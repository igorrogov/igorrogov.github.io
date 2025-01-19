import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyBudgetComponent } from './weekly-budget.component';

describe('SimpleComponent', () => {
  let component: WeeklyBudgetComponent;
  let fixture: ComponentFixture<WeeklyBudgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeklyBudgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeeklyBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
