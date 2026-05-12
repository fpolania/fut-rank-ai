import { Timestamp } from '@angular/fire/firestore';

/* RATING ITEM */

export interface RatingItem {
  ratedBy: string;

  rating: number;

  comment: string;

  anonymous: boolean;

  isMvp: boolean;

  createdAt: Timestamp;
}

/* RATING DOCUMENT */

export interface Rating {
  id?: string;

  playerId: string;

  matchId: string;

  playerName: string;

  averageRating: number;

  totalRatings: number;

  createdAt: Timestamp;

  data: RatingItem[];
}
export interface AiInsight {
  strengths: string[];
  weaknesses: string[];
  tips: string[];
}
