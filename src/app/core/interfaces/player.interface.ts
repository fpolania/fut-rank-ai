import { Timestamp } from '@angular/fire/firestore';

export interface Player {
    id?: string;
    name: string;
    photo: string;
    position: string;
    averageRating: number;
    goals: number;
    assists: number;
    mvps: number;
    matchesPlayed: number;
    preferredFoot: string;
    active: boolean;
    createdAt: Timestamp;
    speed: number;
    finishing: number;
    vision: number;
    stamina: number;
    defense: number;
    dribbling: number;

}