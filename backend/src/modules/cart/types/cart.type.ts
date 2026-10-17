
export type CartItem = {
  productId: string;
  variantId: string;
  quantity: number;
  id: string
}

export type Cart = {
  userId: string | null;
  guestId: string | null;
  items: CartItem[];
  isActive: boolean;
  id: string
}

export type AddCartItemPayload = {
  guestId: string;
  cartId: string;
  itemId: string;
  quantity: number;
  stock: number;
};

export type RemoveCartItemPayload = {
  guestId: string;
  cartId: string;
  itemId: string;
}

export type FindSameItemInCartPayload = {
  cartId: string;
  itemId: string;
};

export type PushNewItemPayload = {
  guestId: string;
  cartId: string;
  stock: number;
  item: {
    productId: string;
    variantId: string;
    quantity: number;
  }
}


export type ProductView = {
  image: string
  price: number
  /** The struck-through price; equal to price when there's no discount. */
  mrp: number
  name: string
}

export type VariantView = {
  id: string;
  /** "200 ml", "60 tablets". */
  label: string;
}
export type CartItemView = {
  itemId: string;
  product: ProductView;
  variant: VariantView;
  quantity: number;
}
export type CartView = {
  id: string;
  guestId: string;
  items: CartItemView[];
  totalItems: number;
  totalPrice: number;
  deliveryCharge: number;
  total: number;
}

export type CheckoutItemView = {
  name: string;
  /** "200 ml", "60 tablets". */
  label: string;
  quantity: number;
  price: number;
  mrp: number;
  image: string;
}

export type CheckoutView = {
  cartId: string;
  totalItems: number;
  items: CheckoutItemView[];
  subTotal: number;
  deliveryCharge: number;
  total: number;
}
