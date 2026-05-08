import {
  Timestamp
} from '@angular/fire/firestore';

export interface Match {
  id?: string;
  title: string;
  type: string;
  formation: string;
  field: string;
  date: string;
  time: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  mvpPlayerId: string;
  players: MatchPlayer[];
  createdBy: string;
  finished: boolean;
  createdAt: Timestamp;

}
export interface MatchPlayer {
  playerId: string;
  name: string;
  photo: string;
  position: string;
  team: 'A' | 'B';
  rating: number;
  goals: number;
  assists: number;
  isMvp: boolean;
}