import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminIaUsageComponent } from './admin-ia-usage.component';

describe('AdminIaUsageComponent', () => {
  let component: AdminIaUsageComponent;
  let fixture: ComponentFixture<AdminIaUsageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminIaUsageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminIaUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
