export interface Product {
  id?: string;
  sku: string;
  name: string;
  price: number;
  images: string[];
  createdAt?: Date;
  updatedAt?: Date;
}