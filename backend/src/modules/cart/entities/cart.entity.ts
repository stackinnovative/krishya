import type { CartItem } from "../types/cart.type.js";



export type CartProps = {
  id?: string | null;
  userId?: string | null;
  guestId?: string | null;
  items?: CartItem[];
  isActive?: boolean;
};

export class Cart {
  public readonly id: string | null;
  public readonly userId: string | null;
  public readonly guestId: string | null;
  public readonly items: CartItem[];
  public readonly isActive: boolean;

  constructor(props: CartProps) {
    if (!props.userId && !props.guestId) {
      throw new Error("Cart must belong to a user or guest");
    }

    if (props.userId && props.guestId) {
      throw new Error("Cart cannot have both userId and guestId");
    }

    const items = props.items ?? [];

    for (const item of items) {
      if (!item.productId) {
        throw new Error("Product id is required");
      }

      if (!item.variantId) {
        throw new Error("Variant id is required");
      }

      if (item.quantity <= 0) {
        throw new Error("Quantity must be greater than zero");
      }
    }

    this.id = props.id ?? null;
    this.userId = props.userId ?? null;
    this.guestId = props.guestId ?? null;
    this.items = items;
    this.isActive = props.isActive ?? true;
  }

  addItem(newItem: CartItem): Cart {
    if (newItem.quantity <= 0) {
      throw new Error("Quantity must be greater than zero");
    }

    const existing = this.items.find(
      (i) =>
        i.productId === newItem.productId &&
        i.variantId === newItem.variantId
    );

    const updatedItems = existing
      ? this.items.map((i) =>
          i.productId === newItem.productId &&
          i.variantId === newItem.variantId
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        )
      : [...this.items, newItem];

    return new Cart({
      ...this,
      items: updatedItems,
    });
  }

  updateQuantity(itemId: string, quantity: number): Cart {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than zero");
    }

    const updatedItems = this.items.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );

    return new Cart({
      ...this,
      items: updatedItems,
    });
  }

  removeItem(itemId: string): Cart {
    const updatedItems = this.items.filter(
      (item) => item.id !== itemId
    );

    return new Cart({
      ...this,
      items: updatedItems,
    });
  }

  clear(): Cart {
    return new Cart({
      ...this,
      items: [],
    });
  }

  findSameItemInCart(productId: string, variantId: string): CartItem | undefined {
    return this.items.find(
      (i) =>
        i.productId === productId &&
        i.variantId === variantId
    );
  }
}
