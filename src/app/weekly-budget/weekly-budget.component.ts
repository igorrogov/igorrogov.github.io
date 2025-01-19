import {Component, OnInit} from '@angular/core';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {MatTableModule} from '@angular/material/table';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {MatInput} from '@angular/material/input';

@Component({
  selector: 'app-simple',
  imports: [
    DatePipe,
    CurrencyPipe,
    MatTableModule,
    MatFormField,
    FormsModule,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel
  ],
  templateUrl: './weekly-budget.component.html',
  styleUrl: './weekly-budget.component.css'
})
export class WeeklyBudgetComponent implements OnInit {

  displayedColumns: string[] = ['startDate', 'spent', 'remaining', 'total'];

  year = 2025;

  month = 0; // January (0-based index)

  budget: number = 200;

  spent: number = 115.72;

  weeks: Week[] = [];

  ngOnInit(): void {
    this.onBudgetChange();
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('en-US', {style: 'currency', currency: 'USD'});
  }

  spentPercentage(): number {
    return this.spent / this.budget * 100;
  }

  onBudgetChange() {
    // console.log("change budget: " + this.budget);
    this.weeks = this.getWeeksForMonth(this.year, this.month, this.budget * 100);
    console.log(this.weeks);
  }

  getWeeksForMonth(year: number, month: number, totalAmountInCents: number): Week[] {
    const weeks: Week[] = [];
    const startOfMonth = new Date(year, month, 1);
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

}
