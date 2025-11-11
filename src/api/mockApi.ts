// Mock Movie API for testing React Compiler behavior
// Uses local mock data for movie listings

export interface Movie {
  id: number;
  title: string;
  description: string;
  year: number;
  genre: string[];
  rating: number;
  director: string;
  poster: string;
  duration: number; // in minutes
}

export interface Review {
  id: number;
  movieId: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

// Mock movie data
const mockMovies: Movie[] = [
  {
    id: 1,
    title: "The Shawshank Redemption",
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    year: 1994,
    genre: ["Drama"],
    rating: 9.3,
    director: "Frank Darabont",
    poster: "🎬",
    duration: 142
  },
  {
    id: 2,
    title: "The Godfather",
    description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    year: 1972,
    genre: ["Crime", "Drama"],
    rating: 9.2,
    director: "Francis Ford Coppola",
    poster: "🎭",
    duration: 175
  },
  {
    id: 3,
    title: "The Dark Knight",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
    year: 2008,
    genre: ["Action", "Crime", "Drama"],
    rating: 9.0,
    director: "Christopher Nolan",
    poster: "🦇",
    duration: 152
  },
  {
    id: 4,
    title: "Pulp Fiction",
    description: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
    year: 1994,
    genre: ["Crime", "Drama"],
    rating: 8.9,
    director: "Quentin Tarantino",
    poster: "🔫",
    duration: 154
  },
  {
    id: 5,
    title: "Forrest Gump",
    description: "The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold from the perspective of an Alabama man.",
    year: 1994,
    genre: ["Drama", "Romance"],
    rating: 8.8,
    director: "Robert Zemeckis",
    poster: "🏃",
    duration: 142
  },
  {
    id: 6,
    title: "Inception",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.",
    year: 2010,
    genre: ["Action", "Sci-Fi", "Thriller"],
    rating: 8.8,
    director: "Christopher Nolan",
    poster: "🌀",
    duration: 148
  },
  {
    id: 7,
    title: "The Matrix",
    description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    year: 1999,
    genre: ["Action", "Sci-Fi"],
    rating: 8.7,
    director: "Lana Wachowski, Lilly Wachowski",
    poster: "💊",
    duration: 136
  },
  {
    id: 8,
    title: "Goodfellas",
    description: "The story of Henry Hill and his life in the mob, covering his relationship with his wife and his partners in crime.",
    year: 1990,
    genre: ["Crime", "Drama"],
    rating: 8.7,
    director: "Martin Scorsese",
    poster: "🍕",
    duration: 146
  },
  {
    id: 9,
    title: "Interstellar",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    year: 2014,
    genre: ["Adventure", "Drama", "Sci-Fi"],
    rating: 8.6,
    director: "Christopher Nolan",
    poster: "🚀",
    duration: 169
  },
  {
    id: 10,
    title: "Parasite",
    description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    year: 2019,
    genre: ["Drama", "Thriller"],
    rating: 8.6,
    director: "Bong Joon Ho",
    poster: "🪜",
    duration: 132
  }
];

const mockReviews: Review[] = [
  {
    id: 1,
    movieId: 1,
    author: "John Doe",
    rating: 10,
    comment: "A masterpiece! One of the best films ever made.",
    date: "2024-01-15"
  },
  {
    id: 2,
    movieId: 1,
    author: "Jane Smith",
    rating: 9,
    comment: "Incredible storytelling and performances.",
    date: "2024-02-20"
  },
  {
    id: 3,
    movieId: 3,
    author: "Mike Johnson",
    rating: 10,
    comment: "Heath Ledger's Joker is unforgettable!",
    date: "2024-03-10"
  }
];

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  // Get list of movies
  async getMovies(): Promise<Movie[]> {
    await delay(500);
    return [...mockMovies];
  },

  // Get single movie
  async getMovie(id: number): Promise<Movie | undefined> {
    await delay(300);
    return mockMovies.find(movie => movie.id === id);
  },

  // Get movies by genre
  async getMoviesByGenre(genre: string): Promise<Movie[]> {
    await delay(400);
    return mockMovies.filter(movie => 
      movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    );
  },

  // Get reviews for a movie
  async getReviewsForMovie(movieId: number): Promise<Review[]> {
    await delay(300);
    return mockReviews.filter(review => review.movieId === movieId);
  },

  // Get all reviews
  async getAllReviews(): Promise<Review[]> {
    await delay(400);
    return [...mockReviews];
  },

  // Get unique genres
  async getGenres(): Promise<string[]> {
    await delay(200);
    const allGenres = mockMovies.flatMap(movie => movie.genre);
    return [...new Set(allGenres)];
  },

  // Search movies by title
  async searchMovies(query: string): Promise<Movie[]> {
    await delay(400);
    const lowerQuery = query.toLowerCase();
    return mockMovies.filter(movie => 
      movie.title.toLowerCase().includes(lowerQuery) ||
      movie.description.toLowerCase().includes(lowerQuery)
    );
  }
};
