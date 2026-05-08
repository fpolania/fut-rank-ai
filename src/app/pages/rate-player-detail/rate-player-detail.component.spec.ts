import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatePlayerDetailComponent } from './rate-player-detail.component';

describe('RatePlayerDetailComponent', () => {
  let component: RatePlayerDetailComponent;
  let fixture: ComponentFixture<RatePlayerDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatePlayerDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RatePlayerDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
