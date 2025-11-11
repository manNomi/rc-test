import { Link, useLocation } from "react-router-dom";

export function Navigation() {
  const location = useLocation();

  const navStyle = {
    display: "flex",
    gap: "1rem",
    padding: "1rem",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    flexWrap: "wrap" as const,
  };

  const linkStyle = (isActive: boolean) => ({
    padding: "0.5rem 1rem",
    textDecoration: "none",
    borderRadius: "4px",
    backgroundColor: isActive ? "#2196F3" : "#fff",
    color: isActive ? "#fff" : "#333",
    border: "1px solid #ddd",
    transition: "all 0.2s",
  });

  const routes = [
    { path: "/", label: "🏠 Home" },
    { path: "/normal", label: "✅ Normal Component" },
    { path: "/incompatible", label: "⚠️ Incompatible API" },
    { path: "/no-memo", label: "🚫 Use No Memo" },
    { path: "/custom-hook", label: "🪝 Custom Hook Error" },
    { path: "/list", label: "📋 Virtual List Demo" },
  ];

  return (
    <nav style={navStyle}>
      {routes.map((route) => (
        <Link
          key={route.path}
          to={route.path}
          style={linkStyle(location.pathname === route.path)}>
          {route.label}
        </Link>
      ))}
    </nav>
  );
}

