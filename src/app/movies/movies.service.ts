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
		return this.discoverMoviesForPage(apiKey, start, end, 1).pipe(
			switchMap(firstResponse => {
				if (firstResponse.total_pages <= 1) {
					return of(firstResponse.results);
				}

				// more than one page
				const remainingRequests$: Observable<DiscoverMoviesResponse>[] = [];
				for (let page = 2; page <= firstResponse.total_pages; page++) {
					remainingRequests$.push(this.discoverMoviesForPage(apiKey, start, end, page));
				}

				return forkJoin(remainingRequests$).pipe(
					map(responses => {
						const subsequentMovies = responses.flatMap(res => res.results);
						return [...firstResponse.results, ...subsequentMovies];
					})
				);
			})
		);
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

export interface Movie {
	id: number;
	title: string;
	release_date: string;
	poster_path: string;
	genre_ids: number[];
	overview: string;
}
