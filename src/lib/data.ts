import type { Product, Order } from './types';

export const products: Product[] = [
  { id: 'ff100', name: '100 Diamonds', price: 50, game: 'Free Fire' },
  { id: 'ff210', name: '210 Diamonds', price: 100, game: 'Free Fire' },
  { id: 'ff520', name: '520 Diamonds', price: 240, game: 'Free Fire' },
  { id: 'ff1060', name: '1060 Diamonds', price: 480, game: 'Free Fire' },
  { id: 'ff2180', name: '2180 Diamonds', price: 950, game: 'Free Fire' },
  { id: 'ff5600', name: '5600 Diamonds', price: 2300, game: 'Free Fire' },
];

export const orders: Order[] = [
  {
    id: 'ORD001',
    playerId: '123456789',
    product: products[1],
    paymentMethod: 'bKash',
    transactionId: 'TX123ABC456',
    status: 'Completed',
    timestamp: new Date('2023-10-28T10:00:00Z'),
  },
  {
    id: 'ORD002',
    playerId: '987654321',
    product: products[3],
    paymentMethod: 'Nagad',
    transactionId: 'TX789DEF123',
    status: 'Pending',
    timestamp: new Date('2023-10-28T11:30:00Z'),
  },
  {
    id: 'ORD003',
    playerId: '555555555',
    product: products[0],
    paymentMethod: 'Rocket',
    transactionId: 'TX456GHI789',
    status: 'Failed',
    timestamp: new Date('2023-10-28T12:15:00Z'),
  },
];
