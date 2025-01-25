import {Component, OnInit} from '@angular/core';
import {CurrencyPipe, DatePipe, NgClass} from '@angular/common';
import {MatTableModule} from '@angular/material/table';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {CookieService} from 'ngx-cookie-service';

@Component({
  selector: 'app-simple',
  imports: [
    DatePipe,
    CurrencyPipe,
    MatTableModule,
    MatFormField,
    FormsModule,
    MatInput,
    MatLabel,
    NgClass
  ],
  templateUrl: './weekly-budget.component.html',
  styleUrl: './weekly-budget.component.css'
})
export class WeeklyBudgetComponent implements OnInit {

  displayedColumns: string[] = ['startDate', 'spent', 'remaining', 'total'];

  BUDGET_COOKIE_NAME = 'initial_budget';

  SPENT_COOKIE_NAME = 'initial_spent';

  DEFAULT_BUDGET = 200;

  DEFAULT_SPENT = 100;

  budget: number = this.DEFAULT_BUDGET;

  spent: number = this.DEFAULT_SPENT;

  year = 2025;

  month = 0; // January (0-based index)

  currentDate = new Date();

  weeks: Week[] = [];

  constructor(private cookieService: CookieService) {
  }

  ngOnInit(): void {
    // restore the initial values from the cookies (if they exist)
    const budgetString = this.cookieService.get(this.BUDGET_COOKIE_NAME);
    const spentString = this.cookieService.get(this.SPENT_COOKIE_NAME);
    this.budget = budgetString ? parseInt(budgetString, 10) : this.DEFAULT_BUDGET;
    this.spent = spentString ? parseInt(spentString, 10) : this.DEFAULT_SPENT;

    // get the current year and month
    this.year = this.currentDate.getFullYear();
    this.month = this.currentDate.getMonth();

    this.weeks = this.getWeeksForMonth();
  }

  onBudgetChange() {
    // console.log("budget change: " + this.budget);
    this.weeks = this.getWeeksForMonth();
    // console.log(this.weeks);

    // save to cookies
    this.cookieService.set(this.BUDGET_COOKIE_NAME, this.budget.toString(10));
    this.cookieService.set(this.SPENT_COOKIE_NAME, this.spent.toString(10));
  }

  getWeeksForMonth(): Week[] {
    const currentYear = this.currentDate.getFullYear();
    const currentMonth = this.currentDate.getMonth();
    const totalAmountInCents = this.budget * 100;

    const weeks: Week[] = [];
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    let endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1); // move one month forward, e.g. Feb 1st
    endOfMonth.setDate(endOfMonth.getDate() - 1); // move one day backward, e.g. Jan 31st

    console.log("startOfMonth", startOfMonth);
    console.log("endOfMonth", endOfMonth);

    const daysInMonth = endOfMonth.getDate() - startOfMonth.getDate() + 1;
    const perDayInCents = totalAmountInCents / daysInMonth;
    console.log("days: " + daysInMonth + ", per day: " + perDayInCents);

    let currentStartDate = new Date(startOfMonth);
    let offset = currentStartDate.getDay() === 0 ? 0 : 7 - currentStartDate.getDay();
    let currentEndDate = new Date(
      currentStartDate.getFullYear(),
      currentStartDate.getMonth(),
      currentStartDate.getDate() + offset
    );

    weeks.push(new Week(new Date(currentStartDate), new Date(currentEndDate), perDayInCents));

    while (currentEndDate <= endOfMonth) {
      currentEndDate.setDate(currentEndDate.getDate() + 7);
      currentStartDate = new Date(currentEndDate);
      currentStartDate.setDate(currentStartDate.getDate() - 6);

      console.log("currentStartDate: " + currentStartDate);
      console.log("currentEndDate: " + currentEndDate);

      if (currentEndDate > endOfMonth) {
        currentEndDate.setTime(endOfMonth.getTime());
        weeks.push(new Week(new Date(currentStartDate), new Date(currentEndDate), perDayInCents));
        break;
      }

      weeks.push(new Week(new Date(currentStartDate), new Date(currentEndDate), perDayInCents));
    }

    // allocate spent money
    let remainingCents = this.spent * 100;
    for (let week of weeks) {
      remainingCents = week.allocateMoney(remainingCents);
    }

    return weeks;
  }

  isRowHighlighted(row: Week): boolean {
    return row ? row.isCurrentWeek() : false;
  }
}

class Week {

  startDate: Date;
  endDate: Date;
  budgetAmountCents: number;
  spentAmountCents: number;
  remainingAmountCents: number;

  constructor(startDate: Date, endDate: Date, perDayInCents: number) {
    this.startDate = startDate;
    this.endDate = endDate;
    const days = endDate.getDate() - startDate.getDate() + 1;
    // console.log(days);
    this.budgetAmountCents = days * perDayInCents;
    this.spentAmountCents = 0;
    this.remainingAmountCents = this.budgetAmountCents;
  }

  allocateMoney(remainingCents: number): number {
    this.spentAmountCents = remainingCents >= this.budgetAmountCents ? this.budgetAmountCents : remainingCents;
    this.remainingAmountCents = this.budgetAmountCents - this.spentAmountCents;

    return remainingCents - this.spentAmountCents;
  }

  isCurrentWeek(): boolean {
    const currentDate = new Date();
    return currentDate >= this.startDate && currentDate < this.endDate;
  }

}
