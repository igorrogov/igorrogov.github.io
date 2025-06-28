import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class MovieService {

	private readonly baseUrl = 'https://api.themoviedb.org/3';

	constructor(private http: HttpClient) {
	}

	discoverMovies(apiKey: string): Observable<DiscoverMoviesResponse> {
		const headers = new HttpHeaders({
			Authorization: `Bearer ${apiKey}`
		});
		const params = new HttpParams()
			.set('release_date.gte', '2025-06-01')
			.set('release_date.lte', '2025-06-25')
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
