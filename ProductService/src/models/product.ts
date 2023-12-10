export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
};

export type FoundProduct = {
  id?: string;
  title: string;
  price: number;
  description: string;
  count: number;
};
