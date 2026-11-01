import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Movie, MovieService} from './movies.service';
import {DatePipe, NgIf} from '@angular/common';
import {MatError, MatFormField, MatFormFieldModule, MatLabel} from '@angular/material/form-field';
import {MatDatepickerModule, MatDatepickerToggle, MatDateRangeInput, MatDateRangePicker} from '@angular/material/datepicker';
import {MatOption, provideNativeDateAdapter} from '@angular/material/core';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {Subscription} from 'rxjs';
import {MatPaginator, MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatProgressBar, MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSelect} from '@angular/material/select';

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
		MatIconModule,
		MatPaginator,
		MatPaginatorModule,
		DatePipe,
		MatProgressBar,
		MatProgressBarModule,
		MatSelect,
		MatOption
	],
	providers: [provideNativeDateAdapter()],
	templateUrl: './movies.component.html',
	styleUrl: './movies.component.css'
})
export class MoviesComponent implements OnInit, AfterViewInit, OnDestroy  {

	readonly DEFAULT_START_DATE = new Date();

	readonly DEFAULT_END_DATE = new Date();

	readonly genreMap = new Map<number, string>();
	genreList: { id: number, name: string }[] = [];

	// 99 - documentary
	// 16 - animation
	excludedGenres: number[] = [ 99, 16 ];
	includedGenres: number[] = [];

	apiKey: string = '';

	readonly range = new FormGroup({
		start: new FormControl<Date | null>(new Date()),
		end: new FormControl<Date | null>(new Date()),
	});

	displayedColumns: string[] = ['poster', 'description'];

	dataSource = new MatTableDataSource<Movie>();

	@ViewChild(MatPaginator, { static: true })
	paginator: MatPaginator = new MatPaginator();

	currentStartDate: Date = this.DEFAULT_START_DATE;

	currentEndDate: Date = this.DEFAULT_END_DATE;

	isLoading = false;

	progress = 0;

	private progressSub!: Subscription;

	constructor(private movieService: MovieService) {
		// show the last two weeks by default
		this.DEFAULT_START_DATE.setDate(this.DEFAULT_END_DATE.getDate() - 14);
		this.range.setValue({ start: this.DEFAULT_START_DATE, end: new Date() });
	}

	ngOnInit(): void {
		// Subscribe to progress updates
		this.progressSub = this.movieService.progress$.subscribe(p => {
			this.progress = p;
		});

		const loadedKey = localStorage.getItem('apiKey');
		if (loadedKey) {
			this.apiKey = loadedKey;
			this.loadGenres(this.apiKey);
			this.reloadMovies();
		}
	}

	ngAfterViewInit() {
		this.dataSource.paginator = this.paginator;
	}

	ngOnDestroy(): void {
		if (this.progressSub) {
			this.progressSub.unsubscribe();
		}
	}

	saveApiKey() {
		localStorage.setItem('apiKey', this.apiKey);
		this.reloadMovies();
	}

	public onRangeSelected() {
		const { start, end } = this.range.value;
		if (start && end) {
			this.currentStartDate = start;
			this.currentEndDate = end;
			this.reloadMovies();
		}
	}

	public onFilterChanged() {
		this.reloadMovies();
	}

	reloadMovies() {
		this.isLoading = true;
		this.movieService.discoverMovies(this.apiKey, this.currentStartDate, this.currentEndDate, this.excludedGenres,
			this.includedGenres).subscribe(movies =>
		{
			// sort by release date (newest to oldest)
			movies.sort((a, b) => b.first_digital_release_date.getTime() - a.first_digital_release_date.getTime());
			this.dataSource.data = movies;
			this.isLoading = false;
		});
	}

	loadGenres(apiKey: string) {
		this.movieService.getAllGenres(apiKey).subscribe(response => {
			this.genreList = response.genres;
			response.genres.forEach(genre => {
				this.genreMap.set(genre.id, genre.name);
			});
		});
	}

	getGenres(genreIDs: number[]): string {
		return genreIDs.map(id => this.genreMap.get(id)).join(", ");
	}

	truncate(text: string, length: number): string {
		return text.length > length ? text.slice(0, length) + "..." : text;
	}

	onPageChange($event: PageEvent) {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
}


