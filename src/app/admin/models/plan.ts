import { Timestamp } from '@angular/fire/firestore';
export interface Plan {
  id?: string;
  name: string;
  price: number;
  maxPlayers: number;
  maxVideos: number;
  maxAnalysis: number;
  active: boolean;
  createdAt?: Timestamp;
}
