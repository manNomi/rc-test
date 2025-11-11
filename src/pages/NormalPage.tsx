import { useState, useEffect } from "react";
import { api, type Movie } from "../api/mockApi";

export function NormalPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    api
      .getMovies()
      .then((data) => {
        setMovies(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
        <p style={{ fontSize: "1.2rem", color: "#666" }}>Loading movies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          color: "#f44336",
        }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❌</div>
        <p style={{ fontSize: "1.2rem" }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          marginBottom: "2rem",
          padding: "1.5rem",
          backgroundColor: "#f9fff9",
          border: "2px solid #4CAF50",
          borderRadius: "8px",
        }}>
        <h2
          style={{
            fontSize: "2rem",
            marginBottom: "0.5rem",
            color: "#4CAF50",
          }}>
          ✅ Normal Component Test
        </h2>
        <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "#555" }}>
          This component uses standard React hooks (<code>useState</code>,{" "}
          <code>useEffect</code>) and fetches movie data. The React Compiler
          should successfully optimize this component without any warnings.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
        }}>
        <div>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            🎬 Movie List ({movies.length} movies)
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {movies.map((movie) => (
              <div
                key={movie.id}
                onClick={() => setSelectedMovie(movie)}
                style={{
                  padding: "1rem",
                  border:
                    selectedMovie?.id === movie.id
                      ? "2px solid #4CAF50"
                      : "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: "pointer",
                  backgroundColor:
                    selectedMovie?.id === movie.id ? "#f9fff9" : "#fff",
                  transition: "all 0.2s",
                }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}>
                  <span style={{ fontSize: "2rem" }}>{movie.poster}</span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
                      {movie.title}
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#666" }}>
                      {movie.year} • ⭐ {movie.rating}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            📝 Movie Details
          </h3>
          {selectedMovie ? (
            <div
              style={{
                padding: "1.5rem",
                border: "2px solid #4CAF50",
                borderRadius: "8px",
                backgroundColor: "#f9fff9",
              }}>
              <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                <div style={{ fontSize: "4rem", marginBottom: "0.5rem" }}>
                  {selectedMovie.poster}
                </div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    marginBottom: "0.5rem",
                  }}>
                  {selectedMovie.title}
                </div>
                <div style={{ color: "#666", marginBottom: "0.5rem" }}>
                  {selectedMovie.year} • {selectedMovie.duration} min
                </div>
                <div
                  style={{
                    color: "#FF9800",
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                  }}>
                  ⭐ {selectedMovie.rating}/10
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}>
                <div>
                  <strong>Director:</strong> {selectedMovie.director}
                </div>
                <div>
                  <strong>Genre:</strong> {selectedMovie.genre.join(", ")}
                </div>
                <div>
                  <strong>Description:</strong>
                  <p
                    style={{
                      marginTop: "0.5rem",
                      lineHeight: "1.6",
                      color: "#555",
                    }}>
                    {selectedMovie.description}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                border: "1px dashed #ddd",
                borderRadius: "8px",
                color: "#999",
              }}>
              Select a movie to see details
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#f5f5f5",
          borderRadius: "4px",
          fontSize: "0.9rem",
          color: "#666",
        }}>
        <strong>💡 Compiler Status:</strong> This component should compile
        successfully with React Compiler. Check the build logs for confirmation.
      </div>
    </div>
  );
}
