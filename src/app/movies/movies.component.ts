import {Component, OnInit} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {FormsModule} from '@angular/forms';
import {Movie, MovieService} from './movies.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'movies',
	imports: [
		MatTableModule,
		FormsModule,
		NgIf
	],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.css'
})
export class MoviesComponent implements OnInit {

  apiKey: string = '';

  displayedColumns: string[] = ['poster', 'title', 'releaseDate'];

  movies: Movie[] = [];

  constructor(private movieService: MovieService) {
  }

  ngOnInit(): void {
    const loadedKey = localStorage.getItem('apiKey');
    if (loadedKey) {
      this.apiKey = loadedKey;
	  this.loadMovies(this.apiKey);
    }
  }

  saveApiKey() {
    localStorage.setItem('apiKey', this.apiKey);
	  this.loadMovies(this.apiKey);
  }

  loadMovies(apiKey: string) {
	  this.movieService.discoverMovies(apiKey).subscribe(response => {
		  this.movies = response.results;
	  });
  }

}


