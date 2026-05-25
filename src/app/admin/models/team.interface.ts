export interface Team {
  id?: string;
  name: string;
  city?: string;
  planId?: string;
  planName?: string;
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  active: boolean;
  subscriptionStatus?: 'active' | 'inactive' | 'cancelled';
  currentPeriodEnd?: Date;
  maxPlayers?: number;
  maxVideos?: number;
  maxAnalysis?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
