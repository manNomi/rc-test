import { useState, useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { api, type Movie } from "../api/mockApi";

export function VirtualListPage() {
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [moviesLoading, setMoviesLoading] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .getGenres()
      .then((data) => {
        setGenres(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedGenre) {
      setMoviesLoading(true);
      api
        .getMoviesByGenre(selectedGenre)
        .then((data) => {
          setMovies(data);
          setMoviesLoading(false);
        })
        .catch(() => {
          setMoviesLoading(false);
        });
    }
  }, [selectedGenre]);

  const virtualizer = useVirtualizer({
    count: movies.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180,
    overscan: 3,
  });

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
        <p style={{ fontSize: "1.2rem", color: "#666" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          marginBottom: "2rem",
          padding: "1.5rem",
          backgroundColor: "#f5f0ff",
          border: "2px solid #9C27B0",
          borderRadius: "8px",
        }}>
        <h2
          style={{
            fontSize: "2rem",
            marginBottom: "0.5rem",
            color: "#9C27B0",
          }}>
          📋 Virtual List Demo
        </h2>
        <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "#555" }}>
          A real-world example combining virtual scrolling with movie data.
          Select a genre to see movies rendered in a virtual list. This tests
          how React Compiler handles complex scenarios with incompatible APIs.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "250px 1fr",
          gap: "2rem",
        }}>
        <div>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            🎭 Select Genre
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                style={{
                  padding: "0.75rem",
                  border:
                    selectedGenre === genre
                      ? "2px solid #9C27B0"
                      : "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: selectedGenre === genre ? "#f5f0ff" : "#fff",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                  fontWeight: selectedGenre === genre ? "bold" : "normal",
                }}>
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            🎬 Movies
            {selectedGenre && !moviesLoading && ` (${movies.length} movies)`}
          </h3>

          {!selectedGenre ? (
            <div
              style={{
                padding: "3rem",
                textAlign: "center",
                border: "2px dashed #ddd",
                borderRadius: "8px",
                color: "#999",
              }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👈</div>
              <p style={{ fontSize: "1.1rem" }}>
                Select a genre to view movies
              </p>
            </div>
          ) : moviesLoading ? (
            <div
              style={{
                padding: "3rem",
                textAlign: "center",
                border: "2px solid #9C27B0",
                borderRadius: "8px",
              }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
              <p style={{ fontSize: "1.1rem", color: "#666" }}>
                Loading movies...
              </p>
            </div>
          ) : (
            <div
              ref={parentRef}
              style={{
                height: "600px",
                overflow: "auto",
                border: "2px solid #9C27B0",
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
                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                          alignItems: "flex-start",
                        }}>
                        <div
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "8px",
                            backgroundColor: "#9C27B0",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "2rem",
                            flexShrink: 0,
                          }}>
                          {movie.poster}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: "bold",
                              marginBottom: "0.5rem",
                              color: "#9C27B0",
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
                            {movie.year} • {movie.director} • {movie.duration}{" "}
                            min
                          </div>
                          <div
                            style={{
                              fontSize: "0.85rem",
                              color: "#555",
                              lineHeight: "1.5",
                              marginBottom: "0.5rem",
                            }}>
                            {movie.description}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: "1rem",
                              alignItems: "center",
                            }}>
                            <span
                              style={{ fontWeight: "bold", color: "#FF9800" }}>
                              ⭐ {movie.rating}/10
                            </span>
                            <span
                              style={{ fontSize: "0.85rem", color: "#999" }}>
                              {movie.genre.join(" • ")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#f5f0ff",
          border: "1px solid #9C27B0",
          borderRadius: "4px",
          fontSize: "0.9rem",
          color: "#666",
        }}>
        <strong>⚡ Performance Note:</strong> This page uses virtual scrolling
        to efficiently render large lists. React Compiler will skip optimizing
        this component due to <code>useVirtualizer</code>, but the app still
        performs well.
      </div>
    </div>
  );
}
