
export type Package = {
  slug: string;
  name: string;
  price: number;
  description: string;
  details: string[];
  imageId: string;
  voucherCount?: number;
  durationHours: number; // Duration in hours
};

export type Voucher = {
  id: string;
  code: string;
  status: 'Active' | 'Expired' | 'Available'; // This will be calculated dynamically
  createdAt: string;
  usedAt?: string;
  purchasedBy?: string;
};
