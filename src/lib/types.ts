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
