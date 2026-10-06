export interface CategoryProps {
  id: string | null;
  name: string;
  description: string;
  isActive?: boolean;
}

export type CategorySignature = {
  id: string;
  name: string;
  image: string;
}
