import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Movie, MovieService} from './movies.service';
import {NgIf} from '@angular/common';
import {MatError, MatFormField, MatFormFieldModule, MatLabel} from '@angular/material/form-field';
import {MatDatepickerModule, MatDatepickerToggle, MatDateRangeInput, MatDateRangePicker} from '@angular/material/datepicker';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {Subscription} from 'rxjs';

@Component({
	selector: 'movies',
	standalone: true,
	imports: [
		MatTableModule,
		FormsModule,
		NgIf,
		MatFormField,
		MatLabel,
		MatDatepickerToggle,
		MatDateRangeInput,
		ReactiveFormsModule,
		MatDateRangePicker,
		MatError,
		MatDatepickerModule,
		MatIconModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatDatepickerModule,
		MatIconModule
	],
	providers: [provideNativeDateAdapter()],
	templateUrl: './movies.component.html',
	styleUrl: './movies.component.css'
})
export class MoviesComponent implements OnInit, OnDestroy  {

	readonly DEFAULT_START_DATE = new Date();

	readonly DEFAULT_END_DATE = new Date();

	apiKey: string = '';

	readonly range = new FormGroup({
		start: new FormControl<Date | null>(new Date()),
		end: new FormControl<Date | null>(new Date()),
	});

	private readonly rangeSubscription: Subscription | undefined;

	displayedColumns: string[] = ['poster', 'title', 'releaseDate'];

	movies: Movie[] = [];

	constructor(private movieService: MovieService) {
		// show the last two weeks by default
		this.DEFAULT_START_DATE.setDate(this.DEFAULT_END_DATE.getDate() - 14);

		this.range.setValue({ start: new Date(), end: new Date() });
		this.rangeSubscription = this.range.valueChanges.subscribe(dateRange => {
			const start = dateRange.start ?? this.DEFAULT_START_DATE;
			const end = dateRange.end ?? this.DEFAULT_END_DATE;
			this.loadMovies(this.apiKey, start, end);
		});
	}

	ngOnInit(): void {
		const loadedKey = localStorage.getItem('apiKey');
		if (loadedKey) {
			this.apiKey = loadedKey;
			this.loadMovies(this.apiKey, this.DEFAULT_START_DATE, this.DEFAULT_END_DATE);
		}
	}

	ngOnDestroy(): void {
		if (this.rangeSubscription) {
			this.rangeSubscription.unsubscribe();
		}
	}

	saveApiKey() {
		localStorage.setItem('apiKey', this.apiKey);
		this.loadMovies(this.apiKey, this.DEFAULT_START_DATE, this.DEFAULT_END_DATE);
	}

	loadMovies(apiKey: string, start: Date, end: Date) {
		this.movieService.discoverMovies(apiKey, start, end).subscribe(response => {
			this.movies = response.results;
		});
	}

}


