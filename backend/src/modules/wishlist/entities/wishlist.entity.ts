export type WishlistProps = {
  id?: string | null;
  userId?: string | null;
  guestId?: string | null;
  productIds?: string[];
};

export class Wishlist {
  public readonly id: string | null;
  public readonly userId: string | null;
  public readonly guestId: string | null;
  public readonly productIds: string[];

  constructor(props: WishlistProps) {
    if (!props.userId && !props.guestId) {
      throw new Error("Wishlist must belong to a user or guest");
    }

    if (props.userId && props.guestId) {
      throw new Error("Wishlist cannot have both userId and guestId");
    }

    this.id = props.id ?? null;
    this.userId = props.userId ?? null;
    this.guestId = props.guestId ?? null;
    this.productIds = props.productIds ?? [];
  }

  has(productId: string): boolean {
    return this.productIds.includes(productId);
  }
}
