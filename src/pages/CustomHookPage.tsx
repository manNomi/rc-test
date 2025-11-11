import { useState, useEffect } from "react";
import { api, type Movie, type Review } from "../api/mockApi";
import { useIncompatibleMovieList } from "../hooks/useIncompatibleMovieList";

export function CustomHookPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getMovies(), api.getAllReviews()])
      .then(([moviesData, reviewsData]) => {
        setMovies(moviesData);
        setReviews(reviewsData);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // Using the custom hook that wraps incompatible API
  const { virtualizer, parentRef } = useIncompatibleMovieList(movies.length);

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
        <p style={{ fontSize: "1.2rem", color: "#666" }}>Loading movies...</p>
      </div>
    );
  }

  const getReviewCount = (movieId: number) => {
    return reviews.filter((r) => r.movieId === movieId).length;
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          marginBottom: "2rem",
          padding: "1.5rem",
          backgroundColor: "#fff0f0",
          border: "2px solid #f44336",
          borderRadius: "8px",
        }}>
        <h2
          style={{
            fontSize: "2rem",
            marginBottom: "0.5rem",
            color: "#f44336",
          }}>
          🪝 Custom Hook Error Test
        </h2>
        <p
          style={{
            fontSize: "1.1rem",
            lineHeight: "1.6",
            color: "#555",
            marginBottom: "1rem",
          }}>
          This page demonstrates what happens when an incompatible API (
          <code>useVirtualizer</code>) is wrapped inside a custom hook (
          <code>useIncompatibleMovieList</code>).
        </p>
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#fff",
            border: "1px solid #f44336",
            borderRadius: "4px",
          }}>
          <strong style={{ color: "#f44336" }}>❌ Expected Behavior:</strong>
          <ul style={{ marginTop: "0.5rem", paddingLeft: "2rem" }}>
            <li>
              React Compiler should detect this pattern and show an error or
              warning
            </li>
            <li>
              ESLint with <code>eslint-plugin-react-hooks</code> might show:{" "}
              <code>react-hooks/incompatible-library</code>
            </li>
            <li>
              Build logs should indicate compilation was skipped for this hook
            </li>
          </ul>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          🎬 Movies via Custom Hook ({movies.length} movies)
        </h3>

        <div
          ref={parentRef}
          style={{
            height: "500px",
            overflow: "auto",
            border: "2px solid #f44336",
            borderRadius: "8px",
            backgroundColor: "#fff",
          }}>
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}>
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const movie = movies[virtualItem.index];
              const reviewCount = getReviewCount(movie.id);

              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                    padding: "1rem",
                    borderBottom: "1px solid #eee",
                  }}>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <span style={{ fontSize: "3.5rem" }}>{movie.poster}</span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: "bold",
                          marginBottom: "0.5rem",
                          color: "#f44336",
                          fontSize: "1.2rem",
                        }}>
                        {movie.title}
                      </div>
                      <div
                        style={{
                          fontSize: "0.9rem",
                          color: "#666",
                          marginBottom: "0.5rem",
                        }}>
                        {movie.year} • {movie.director} • {movie.duration} min
                      </div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#999",
                          marginBottom: "0.5rem",
                        }}>
                        {movie.genre.join(", ")}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                          alignItems: "center",
                        }}>
                        <span style={{ fontWeight: "bold", color: "#FF9800" }}>
                          ⭐ {movie.rating}/10
                        </span>
                        {reviewCount > 0 && (
                          <span style={{ fontSize: "0.85rem", color: "#666" }}>
                            💬 {reviewCount} review{reviewCount > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#fff0f0",
          border: "1px solid #f44336",
          borderRadius: "4px",
          fontSize: "0.9rem",
          color: "#666",
        }}>
        <strong>⚠️ Check These:</strong>
        <ol style={{ marginTop: "0.5rem", paddingLeft: "2rem" }}>
          <li>
            Terminal build logs for React Compiler warnings about{" "}
            <code>useIncompatibleMovieList</code>
          </li>
          <li>
            ESLint output for <code>react-hooks/incompatible-library</code>{" "}
            warnings
          </li>
          <li>
            Whether the page still functions correctly (it should, but won't be
            optimized)
          </li>
        </ol>
      </div>
    </div>
  );
}
