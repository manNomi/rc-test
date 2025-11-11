import { useState, useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { api, type Movie } from "../api/mockApi";

export function IncompatiblePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .getMovies()
      .then((data) => {
        // Duplicate movies to have more items for virtual scrolling
        const duplicated = [...data, ...data, ...data];
        setMovies(duplicated);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // ⚠️ Direct use of useVirtualizer - an incompatible API
  // This should trigger a React Compiler warning
  const virtualizer = useVirtualizer({
    count: movies.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150,
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
          backgroundColor: "#fff9f0",
          border: "2px solid #FF9800",
          borderRadius: "8px",
        }}>
        <h2
          style={{
            fontSize: "2rem",
            marginBottom: "0.5rem",
            color: "#FF9800",
          }}>
          ⚠️ Incompatible API Test
        </h2>
        <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "#555" }}>
          This component directly uses <code>useVirtualizer</code> from{" "}
          <code>@tanstack/react-virtual</code>, which is flagged as an
          incompatible API. The React Compiler should show a warning that this
          component will be skipped from optimization.
        </p>
      </div>

      <div>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          🎬 Virtual Scrolling Movies ({movies.length} items)
        </h3>

        <div
          ref={parentRef}
          style={{
            height: "500px",
            overflow: "auto",
            border: "2px solid #FF9800",
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
                      alignItems: "center",
                    }}>
                    <span style={{ fontSize: "3rem" }}>{movie.poster}</span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: "bold",
                          marginBottom: "0.5rem",
                          color: "#FF9800",
                          fontSize: "1.1rem",
                        }}>
                        {movie.title} ({movie.year})
                      </div>
                      <div
                        style={{
                          fontSize: "0.9rem",
                          color: "#666",
                          marginBottom: "0.25rem",
                        }}>
                        {movie.director} • {movie.duration} min
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#999" }}>
                        {movie.genre.join(", ")} • ⭐ {movie.rating}
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
          backgroundColor: "#fff9f0",
          border: "1px solid #FF9800",
          borderRadius: "4px",
          fontSize: "0.9rem",
          color: "#666",
        }}>
        <strong>⚠️ Expected Warning:</strong> React Compiler should log a
        warning about <code>useVirtualizer</code> being an incompatible API.
        Check the terminal output for:{" "}
        <code>Compilation Skipped: Use of incompatible library</code>
      </div>
    </div>
  );
}
