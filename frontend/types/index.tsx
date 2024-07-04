import { ReactNode } from 'react';

export interface LayoutChildrenProps {
  children?: ReactNode;
}

export interface Contributor {
  contributor: string;
  amount: string;
}

export interface ProgressionProps {
  isLoading: boolean;
  end: string;
  goal: string;
  totalCollected: string;
}

export interface ContributeProps {
  getData: () => void;
}

export interface ContributorsProps {
  events: Array<Contributor>;
}

export interface RefundProps {
  getData: () => void;
  end: string;
  goal: string;
  totalCollected: string;
}

export interface InformationsProps {
  hash: any;
  isConfirming: boolean;
  isConfirmed: boolean;
  error: any;
}

// types.ts
export interface Club {
  id: string;
  title: string;
  description: string;
  end: string;
  amountCollected: string;
  image: string;
  subscriptionPrice: string;
  owner: string;
}

export interface ClubProps {
  id: string;
  title: string;
  description: string;
  end: string;
  amountCollected: string;
  image: string;
  subscriptionPrice: string;
  owner: string;
}
