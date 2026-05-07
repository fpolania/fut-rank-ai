import { Timestamp }
    from '@angular/fire/firestore';

export interface Match {
    id?: string;
    title: string;
    type: string;
    teamA: string;
    teamB: string;
    scoreA: number;
    scoreB: number;
    formation: string;
    mvpPlayerId: string;
    players: string[];
    createdBy: string;
    finished: boolean;
    createdAt: Timestamp;
}