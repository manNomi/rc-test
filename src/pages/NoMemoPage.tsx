import { useState, useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { api, type Movie } from "../api/mockApi";

export function NoMemoPage() {
  "use no memo";

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [genres, setGenres] = useState<string[]>([]);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([api.getMovies(), api.getGenres()])
      .then(([moviesData, genresData]) => {
        setMovies(moviesData);
        setGenres(genresData);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const filteredMovies =
    selectedGenre === "all"
      ? movies
      : movies.filter((m) => m.genre.includes(selectedGenre));

  const virtualizer = useVirtualizer({
    count: filteredMovies.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
        <p style={{ fontSize: "1.2rem", color: "#666" }}>Loading movies...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          marginBottom: "2rem",
          padding: "1.5rem",
          backgroundColor: "#f0f8ff",
          border: "2px solid #2196F3",
          borderRadius: "8px",
        }}>
        <h2
          style={{
            fontSize: "2rem",
            marginBottom: "0.5rem",
            color: "#2196F3",
          }}>
          🚫 Use No Memo Directive Test
        </h2>
        <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "#555" }}>
          This component uses the <code>"use no memo"</code> directive at the
          top to explicitly opt out of React Compiler optimization. Even though
          it uses <code>useVirtualizer</code> (incompatible API), there should
          be no warnings because the compiler skips this component entirely.
        </p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          🎬 Movies by Genre ({filteredMovies.length} movies)
        </h3>

        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}>
          <button
            onClick={() => setSelectedGenre("all")}
            style={{
              padding: "0.5rem 1rem",
              border: "1px solid #2196F3",
              borderRadius: "4px",
              backgroundColor: selectedGenre === "all" ? "#2196F3" : "#fff",
              color: selectedGenre === "all" ? "#fff" : "#2196F3",
              cursor: "pointer",
              fontWeight: selectedGenre === "all" ? "bold" : "normal",
            }}>
            All ({movies.length})
          </button>
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #2196F3",
                borderRadius: "4px",
                backgroundColor: selectedGenre === genre ? "#2196F3" : "#fff",
                color: selectedGenre === genre ? "#fff" : "#2196F3",
                cursor: "pointer",
                fontWeight: selectedGenre === genre ? "bold" : "normal",
              }}>
              {genre} ({movies.filter((m) => m.genre.includes(genre)).length})
            </button>
          ))}
        </div>

        <div
          ref={parentRef}
          style={{
            height: "400px",
            overflow: "auto",
            border: "2px solid #2196F3",
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
              const movie = filteredMovies[virtualItem.index];
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
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  }}>
                  <span style={{ fontSize: "2.5rem" }}>{movie.poster}</span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
                      {movie.title} ({movie.year})
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#666" }}>
                      {movie.genre.join(", ")} • ⭐ {movie.rating}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "4px",
                      fontSize: "0.85rem",
                      backgroundColor:
                        movie.rating >= 9 ? "#4CAF50" : "#2196F3",
                      color: "#fff",
                      fontWeight: "bold",
                    }}>
                    {movie.rating >= 9 ? "Masterpiece" : "Great"}
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
          backgroundColor: "#f0f8ff",
          border: "1px solid #2196F3",
          borderRadius: "4px",
          fontSize: "0.9rem",
          color: "#666",
        }}>
        <strong>🚫 Compiler Status:</strong> This component uses the{" "}
        <code>"use no memo"</code> directive, so React Compiler will skip it
        entirely. No warnings should appear even though it uses an incompatible
        API.
      </div>
    </div>
  );
}
