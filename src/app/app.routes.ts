import { Routes } from '@angular/router';
import {WeeklyBudgetComponent} from './weekly-budget/weekly-budget.component';

export const routes: Routes = [
  { path: 'weekly-budget', component: WeeklyBudgetComponent },
  { path: '', component: WeeklyBudgetComponent },
];
