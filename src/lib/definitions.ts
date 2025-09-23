

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

export type Membership = {
  id: string;
  name: string;
  phoneNumber: string;
  username: string;
  password?: string; // It's sensitive, might not always be fetched/sent to client
  documentDataUri?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
