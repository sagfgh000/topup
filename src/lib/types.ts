
export type Product = {
  id: string;
  name: string;
  price: number;
  game: 'Free Fire' | 'MLBB';
  icon?: React.ComponentType<{ className?: string }>;
};

export type Order = {
  id: string;
  userId: string;
  userEmail: string;
  playerId: string;
  productName: string;
  productPrice: number;
  status: 'Pending' | 'Completed' | 'Failed';
  createdAt: Date;
};

export type Wallet = {
    balance: number;
    hasAcceptedAgreement?: boolean;
};

export type TopUpRequest = {
    id?: string;
    userId: string;
    userEmail: string;
    amount: number;
    paymentMethod: 'bKash' | 'Nagad';
    transactionId: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    createdAt: Date;
}
