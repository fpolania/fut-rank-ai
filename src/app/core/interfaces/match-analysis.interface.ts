export interface MatchAnalysis {
  id?: string;
  matchId?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  teamColor: string;
  matchType: 'FUT 5' | 'FUT 8';
  focus?: string;
  analysis?: string;
  createdAt: number;
  createdBy?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  matchName?: string;
}
