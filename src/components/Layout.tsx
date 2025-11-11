import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";

export function Layout() {
  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            marginBottom: "0.5rem",
          }}>
          🧪 React Compiler Test Lab
        </h1>
        <p style={{ color: "#666", fontSize: "1.1rem", marginBottom: "1.5rem" }}>
          Testing React Compiler behavior with real API integration
        </p>
        <Navigation />
      </header>

      <main>
        <Outlet />
      </main>

      <footer
        style={{
          marginTop: "3rem",
          paddingTop: "2rem",
          borderTop: "1px solid #ddd",
          textAlign: "center",
          color: "#666",
        }}>
        <p style={{ marginBottom: "0.5rem" }}>
          📚 React Compiler: <code>babel-plugin-react-compiler</code>
        </p>
        <p style={{ fontSize: "0.9rem", color: "#999" }}>
          Using JSONPlaceholder API for realistic data testing
        </p>
      </footer>
    </div>
  );
}

