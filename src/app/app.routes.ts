import { Routes } from '@angular/router';
import {WeeklyBudgetComponent} from './weekly-budget/weekly-budget.component';
import {MoviesComponent} from './movies/movies.component';

export const routes: Routes = [
  { path: 'weekly-budget', component: WeeklyBudgetComponent },
  { path: 'movies', component: MoviesComponent },
  { path: '', component: MoviesComponent },
];
