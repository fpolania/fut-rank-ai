import { Timestamp } from '@angular/fire/firestore';

export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  role: string;
  active: boolean;
  createdAt: Timestamp;
  document: string;
}
