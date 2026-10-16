import { inject, injectable } from "tsyringe";
import type { ICreateOrderUseCase } from "./interfaces/create.order.use-case.interface.js";
import type { IOrderRepository } from "../repositories/order.repository.interface.js";
import type { CreateOrderRequestDto } from "../dtos/create.order.dto.js";
import type { ICartRepository } from "../../cart/repositories/cart.repository.interface.js";
import type { IProductRepository } from "../../product/repositories/product.repository.interface.js";
import type { IRazorpayOrder } from "../types/order.type.js";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import type { IUserRepository } from "../../user/repositories/user.repository.interface.js";
import { User } from "../../user/entities/user.entity.js";
import { Order, type OrderItem } from "../entities/order.entity.js";
import { generateOrderNumber } from "../utils/generate.order.number.js";
import { Payment } from "../../payment/entities/payment.entity.js";
import { mapRazorpayStatus } from "../../../core/utils/payment.status.helper.js";
import type { IPaymentRepository } from "../../payment/repositories/payment.repository.interface.js";
import type { IPaymentGateway } from "../../../core/ports/payment.service.interface.js";
import type { ISettingsRepository } from "../../settings/repositories/settings.repository.interface.js";
import { formatVariantLabel } from "../../product/utils/variant.helper.js";

@injectable()
export class CreateOrderUseCase implements ICreateOrderUseCase {
    constructor(
        @inject("IOrderRepository")
        private readonly _orderRepository: IOrderRepository,
        @inject("ICartRepository")
        private readonly _cartRepository: ICartRepository,
        @inject("IProductRepository")
        private readonly _productRepository: IProductRepository,

        @inject("IPaymentRepository")
        private readonly _paymentRepository: IPaymentRepository,

        @inject("IPaymentGateway")
        private readonly _paymentGateway: IPaymentGateway,

        @inject("ISettingsRepository")
        private readonly _settingsRepository: ISettingsRepository,

        @inject("IUserRepository")
        private readonly _userRepository: IUserRepository,
    ) { }

    /**
     * Matches the checkout details against an existing customer by email, then
     * phone, so a returning guest is recognised even if they used a different
     * email/phone than last time - and keeps the matched profile's
     * name/email/phone/address refreshed to what was just entered.
     */
    private async _resolveCustomer(data: CreateOrderRequestDto) {
        const address = {
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
        };

        const existing =
            (await this._userRepository.findByEmail(data.email)) ??
            (await this._userRepository.findByPhone(data.phone));

        if (existing) {
            const updated = existing.updateCheckoutProfile({
                name: data.name,
                email: data.email,
                phone: data.phone,
                address,
            });
            return this._userRepository.save(updated);
        }

        return this._userRepository.create(
            new User({
                name: data.name,
                email: data.email,
                phone: data.phone,
                address,
                role: "user",
                isGuest: true,
                tokenVersion: 0,
            }),
        );
    }

    async execute(data: CreateOrderRequestDto): Promise<IRazorpayOrder> {
        /* =========================================================
       VALIDATE ACCEPTED TERMS
   ========================================================= */

        if (!data.acceptedTerms) {
            throw new CustomError(
                ResponseMessages.ACCEPTED_TERMS_REQUIRED,
                HttpStatusCode.BAD_REQUEST,
            );
        }

        /* =========================================================
           MAINTENANCE MODE
           Blocking the storefront's pages is a frontend concern, but that
           alone can be bypassed by hitting this endpoint directly - the
           thing that actually matters (taking a paid order the store can't
           fulfil right now) is stopped here regardless of the UI.
        ========================================================= */

        const settings = await this._settingsRepository.getSettings();
        if (settings.maintenance) {
            throw new CustomError(
                ResponseMessages.STORE_UNDER_MAINTENANCE,
                HttpStatusCode.SERVICE_UNAVAILABLE,
            );
        }

        /* =========================================================
       LOAD USER CART
   ========================================================= */


        const cart = await this._cartRepository.findById(
            data.cartId,
        );


        if (!cart || cart.guestId !== data.guestId) {
            throw new CustomError(
                ResponseMessages.CART_NOT_FOUND,
                HttpStatusCode.BAD_REQUEST,
            );
        }

        if (cart.items.length === 0) {
            throw new CustomError(
                ResponseMessages.CART_IS_EMPTY,
                HttpStatusCode.BAD_REQUEST,
            );
        }



        /* =========================================================
           VALIDATE PRODUCTS & RECALCULATE PRICE
           NEVER trust frontend price
        ========================================================= */

        const validatedItems: OrderItem[] = [];
        let calculatedTotal = 0;

        for (const cartItem of cart.items) {

            // Load latest product from DB
            const product = await this._productRepository.findById(
                cartItem.productId,
            );

            if (!product || !product.isActive) {
                throw new CustomError(
                    ResponseMessages.PRODUCT_NOT_FOUND,
                    HttpStatusCode.BAD_REQUEST,
                );
            }

            // Find selected variant
            const variant = product.variants.find(
                (v) => v.id === cartItem.variantId,
            );

            if (!variant || !variant.isActive) {
                throw new CustomError(
                    ResponseMessages.PRODUCT_VARIANT_NOT_FOUND,
                    HttpStatusCode.BAD_REQUEST,
                );
            }

            /* ----- STOCK CHECK ----- */
            if (variant.stock < cartItem.quantity) {
                throw new CustomError(
                    ResponseMessages.PRODUCT_OUT_OF_STOCK,
                    HttpStatusCode.BAD_REQUEST,
                );
            }


            const latestPrice = variant.price;
            const lineTotal = latestPrice * cartItem.quantity;

            calculatedTotal += lineTotal;

            validatedItems.push({
                productId: cartItem.productId,
                variantId: cartItem.variantId,
                // Snapshotted so the order always shows what was bought, even if
                // the product's quantities or photos change later.
                size: formatVariantLabel(variant),
                name: product.name,
                quantity: cartItem.quantity,
                price: latestPrice,
                mrp: variant.mrp,
                image: product.images[0]?.url,
            });

            await this._productRepository.decrementStock({
                productId: cartItem.productId,
                variantId: cartItem.variantId,
                quantity: cartItem.quantity,
            });
        }

        /* =========================================================
           SAFETY CHECKS
        ========================================================= */

        if (validatedItems.length === 0) {
            throw new CustomError(
                ResponseMessages.CART_IS_EMPTY,
                HttpStatusCode.BAD_REQUEST,
            );
        }

        if (calculatedTotal <= 0) {
            throw new CustomError(
                ResponseMessages.INVALID_ORDER_TOTAL,
                HttpStatusCode.BAD_REQUEST,
            );
        }

        /* =========================================================
           CREATE DOMAIN ORDER
        ========================================================= */


        const shippingFee = settings.calculateDeliveryCharge(calculatedTotal);
        const totalRupees = calculatedTotal + shippingFee;

        const customer = await this._resolveCustomer(data);

        const orderNumber = generateOrderNumber();
        const orderEntity = new Order({
            userId: customer.id,
            items: validatedItems,
            guestId: data.guestId,
            orderNumber,
            userSnapshot: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                addressLine1: data.addressLine1,
                addressLine2: data.addressLine2,
                city: data.city,
                state: data.state,
                pincode: data.pincode,
            },
            subtotal: calculatedTotal,
            shippingFee,
            totalAmount: totalRupees,
            orderStatus: "created",
        });

        /* =========================================================
           STEP 5 — SAVE ORDER
        ========================================================= */

        const createdOrder = await this._orderRepository.create(orderEntity);

        if (!createdOrder.id) {
            throw new CustomError(
                ResponseMessages.FAILED_TO_CREATE_ORDER,
                HttpStatusCode.INTERNAL_SERVER_ERROR,
            );
        }

        /* =========================================================
           CREATE RAZORPAY ORDER
           Amount must be in paise
        ========================================================= */

        const razorpayOrder = await this._paymentGateway.createOrder({
            amount: totalRupees * 100,
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`,
        })



        const newPayment = new Payment({
            orderId: createdOrder.id,
            userId: customer.id,
            guestId: data.guestId,
            provider: "razorpay",
            providerOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            status: mapRazorpayStatus(razorpayOrder.status),
            paymentMode: "upi",
        })

        await this._paymentRepository.create(newPayment);
        return {
            ...razorpayOrder,
            notes: {
                appOrderId: createdOrder.id,
            }
        }
    }
}