import { Timestamp }
    from '@angular/fire/firestore';

export interface Rating {
    id?: string;
    playerId: string;
    matchId: string;
    ratedBy: string;
    rating: number;
    comment: string;
    anonymous: boolean;
    createdAt: Timestamp;
    isMvp: boolean;

}