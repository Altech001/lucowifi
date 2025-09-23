
export type Package = {
  slug: string;
  name: string;
  price: number;
  description: string;
  details: string[];
  imageId: string;
};

export type Voucher = {
  id: string;
  code: string;
  used: boolean;
  createdAt: string;
};
