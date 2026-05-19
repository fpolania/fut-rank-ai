export interface Competition {
  id?: string;

  name: string;

  type: 'tournament' | 'friendly' | 'reta';

  season: string;

  active: boolean;

  createdAt: Date;
}
