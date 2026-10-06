import { container } from "tsyringe";
import type { IHashingService } from "../core/ports/hashing.service.interface.js";
import { BcryptService } from "../infrastructure/services/bcrypt.service.js";
import type { ITokenService } from "../core/ports/token.service.interface.js";
import { JwtService } from "../infrastructure/services/jwt.service.js";
import type { IPaymentGateway } from "../core/ports/payment.service.interface.js";
import { RazorpayService } from "../infrastructure/services/payment.service.js";
import type { IInvoiceService } from "../core/ports/invoice.service.interface.js";
import { InvoiceService } from "../infrastructure/services/Invoice.service.js";
import type { IEmailService } from "../core/ports/email.service.interface.js";
import { ResendEmailService } from "../infrastructure/services/resend.service.js";
import type { IWhatsAppService } from "../core/ports/whatsapp.service.interface.js";
import { TwilioWhatsAppService } from "../infrastructure/services/twilio-whatsapp.service.js";

export const registerCommonDependencies = () => {
    container.register<IHashingService>("IHashingService", {
        useClass: BcryptService,
    });


    container.register<ITokenService>("ITokenService", { useClass: JwtService });

    container.register<IPaymentGateway>("IPaymentGateway", {
        useClass: RazorpayService,
    });

    container.register<IInvoiceService>("IInvoiceService", {
        useClass: InvoiceService,
    });

    container.register<IEmailService>("IEmailService", {
        useClass: ResendEmailService,
    });

    container.register<IWhatsAppService>("IWhatsAppService", {
        useClass: TwilioWhatsAppService,
    });

};