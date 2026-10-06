export interface AdminUserAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export type AdminUserView = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: AdminUserAddress;
  role: "admin" | "user";
  isBlocked: boolean;
  createdAt: string;
};
