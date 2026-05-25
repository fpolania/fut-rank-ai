export interface Subscription {
  id?: string;
  teamId: string;
  teamName: string;
  planId: string;
  planName: string;
  status: 'active' | 'inactive' | 'cancelled';
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  price?: number;
  currency?: string;
  maxPlayers?: number;
  maxVideos?: number;
  maxAnalysis?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
