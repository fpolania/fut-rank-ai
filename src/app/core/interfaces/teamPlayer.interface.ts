import { Timestamp } from '@angular/fire/firestore';

export interface TeamPlayer {
  id?: string;
  name: string;
  document: string;
  role: 'captain' | 'player';
  active: boolean;
  createdAt: Timestamp;
}
