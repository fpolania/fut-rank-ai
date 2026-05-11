import { Timestamp } from '@angular/fire/firestore';

export interface TeamApplication {
  id?: string;

  name: string;

  age: number;

  position: string;

  foot: string;

  city: string;

  number: string;

  strengths: string;

  status: string;

  createdAt: Timestamp;
}
