export type Product = {
  id: string;
  name: string;
  price: number;
  game: 'Free Fire' | 'MLBB';
  icon?: React.ComponentType<{ className?: string }>;
};

export type Order = {
  id: string;
  playerId: string;
  product: Product;
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket';
  transactionId: string;
  status: 'Pending' | 'Completed' | 'Failed';
  timestamp: Date;
};

export type Wallet = {
    balance: number;
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
