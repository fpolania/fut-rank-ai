import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamAccessComponent } from './team-access.component';

describe('TeamAccessComponent', () => {
  let component: TeamAccessComponent;
  let fixture: ComponentFixture<TeamAccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamAccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
