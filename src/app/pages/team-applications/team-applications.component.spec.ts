import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamApplicationsComponent } from './team-applications.component';

describe('TeamApplicationsComponent', () => {
  let component: TeamApplicationsComponent;
  let fixture: ComponentFixture<TeamApplicationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamApplicationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
