import { ReactNode } from 'react';

export interface LayoutChildrenProps {
  children?: ReactNode;
}

export interface InformationsProps {
  hash: any;
  isConfirming: boolean;
  isConfirmed: boolean;
  error: any;
}

export interface Club {
  id: string
  title: string;
  description: string;
  end: string;
  amountCollected: string;
  image: string;
  subscriptionPrice: string;
  owner: string;
}
