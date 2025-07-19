import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {DatePipe} from '@angular/common';

const datepipe: DatePipe = new DatePipe('en-US');

@Injectable({
	providedIn: 'root'
})
export class MovieService {

	private readonly baseUrl = 'https://api.themoviedb.org/3';

	constructor(private http: HttpClient) {
	}

	discoverMovies(apiKey: string, start: Date, end: Date): Observable<DiscoverMoviesResponse> {
		const headers = new HttpHeaders({
			Authorization: `Bearer ${apiKey}`
		});

		const formattedStart = datepipe.transform(start, 'YYYY-MM-dd');
		const formattedEnd = datepipe.transform(end, 'YYYY-MM-dd');

		const params = new HttpParams()
			.set('release_date.gte', formattedStart as string)
			.set('release_date.lte', formattedEnd as string)
			.set('sort_by', 'primary_release_date.desc')
			.set('vote_count.gte', 50)
			.set('with_release_type', '4|5')
			.set('with_original_language', 'en')
			.set('without_genres', 99)
			.set('page', 1)
		return this.http.get<DiscoverMoviesResponse>(`${this.baseUrl}/discover/movie`, { headers, params });
	}

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
}
