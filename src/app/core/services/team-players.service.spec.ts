import { TestBed } from '@angular/core/testing';

import { TeamPlayersService } from './team-players.service';

describe('TeamPlayersService', () => {
  let service: TeamPlayersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeamPlayersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
