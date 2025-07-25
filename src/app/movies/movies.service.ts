import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {forkJoin, map, Observable, of, switchMap} from 'rxjs';
import {DatePipe} from '@angular/common';

const datepipe: DatePipe = new DatePipe('en-US');

@Injectable({
	providedIn: 'root'
})
export class MovieService {

	private readonly baseUrl = 'https://api.themoviedb.org/3';

	constructor(private http: HttpClient) {
	}

	getAllGenres(apiKey: string): Observable<GenreListResponse> {
		const headers = new HttpHeaders({
			Authorization: `Bearer ${apiKey}`
		});

		return this.http.get<GenreListResponse>(`${this.baseUrl}/genre/movie/list`, { headers });
	}

	discoverMovies(apiKey: string, start: Date, end: Date): Observable<Movie[]> {
		let originalMovies$ = this.discoverMoviesForPage(apiKey, start, end, 1).pipe(
			switchMap(firstResponse => {
				const firstPage = firstResponse.results;
				if (firstResponse.total_pages <= 1) {
					return of(firstPage);
				}

				// more than one page
				const remainingRequests$: Observable<DiscoverMoviesResponse>[] = [];
				for (let page = 2; page <= firstResponse.total_pages; page++) {
					remainingRequests$.push(this.discoverMoviesForPage(apiKey, start, end, page));
				}

				return forkJoin(remainingRequests$).pipe(
					map(responses => {
						const remainingPages = responses.flatMap(res => res.results);
						return [...firstPage, ...remainingPages];
					})
				);
			})
		);

		// load release dates
		return this.loadReleaseDates(apiKey, start, originalMovies$);
	}

	discoverMoviesForPage(apiKey: string, start: Date, end: Date, page: number) {
		const headers = new HttpHeaders({
			Authorization: `Bearer ${apiKey}`
		});

		const formattedStart = datepipe.transform(start, 'YYYY-MM-dd');
		const formattedEnd = datepipe.transform(end, 'YYYY-MM-dd');

		// 99 - documentary
		// 16 - animation

		const params = new HttpParams()
			.set('release_date.gte', formattedStart as string)
			.set('release_date.lte', formattedEnd as string)
			.set('sort_by', 'primary_release_date.desc')
			.set('vote_count.gte', 50)
			.set('with_release_type', '4|5')
			.set('with_original_language', 'en')
			.set('without_genres', "99,16")
			.set('page', page)
		return this.http.get<DiscoverMoviesResponse>(`${this.baseUrl}/discover/movie`, { headers, params });
	}

	loadReleaseDates(apiKey: string, start: Date, movies$: Observable<Movie[]>): Observable<Movie[]> {
		const earliestReleaseDate = new Date(start);
		earliestReleaseDate.setFullYear(start.getFullYear() - 1);

		return movies$.pipe(
			switchMap(movies => {
				// remove movies from the list where the original release date is too far away in the past
				// ex: released more than a year ago
				movies = movies.filter(m => new Date(m.release_date) >= earliestReleaseDate);

				if (!movies || movies.length === 0) {
					return of([]);
				}

				// find first digital release dates for each movie
				const observables$ = movies.map(movie =>
					this.getReleaseDates(apiKey, movie.id).pipe(
						map(response => {
							movie.first_digital_release_date = this.findFirstReleaseDate(response, movie.release_date);
							return movie;
						})
					)
				);

				return forkJoin(observables$);
			})
		);
	}

	getReleaseDates(apiKey: string, movieID: number) {
		const headers = new HttpHeaders({
			Authorization: `Bearer ${apiKey}`
		});

		// TODO: add caching

		return this.http.get<ReleaseDatesResponse>(`${this.baseUrl}/movie/${movieID}/release_dates`, { headers });
	}

	findFirstReleaseDate(response: ReleaseDatesResponse, originalDate: string): Date {
		let firstDate: Date | null = null;
		for (const res of response.results) {
			for (const rd of res.release_dates) {
				if (rd.type == 4 || rd.type == 5) {
					const currentDate = new Date(rd.release_date);
					if (firstDate == null || currentDate < firstDate) {
						firstDate = currentDate;
					}
				}
			}
		}
		return firstDate ? firstDate : new Date(originalDate);
	}

}

export interface GenreListResponse {
	genres: IdNamePair[];
}

export interface IdNamePair {
	id: number;
	name: string;
}

export interface DiscoverMoviesResponse {
	page: number;
	results: Movie[];
	total_pages: number;
	total_results: number;
}

export interface ReleaseDatesResponse {
	id: number;
	results: ReleaseDatesResult[];
}

export interface ReleaseDatesResult {
	iso_3166_1: string; // country
	release_dates: ReleaseDates[];
}

export interface ReleaseDates {
	type: number; // 4|5 for digital and physical
	note: string;
	release_date: string;
}

export interface Movie {
	id: number;
	title: string;
	release_date: string;
	poster_path: string;
	genre_ids: number[];
	overview: string;
	first_digital_release_date: Date;
}
