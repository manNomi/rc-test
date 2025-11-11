export function HomePage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        padding: "2rem",
      }}>
      <section>
        <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
          Welcome to React Compiler Test Lab
        </h2>
        <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "#555" }}>
          This project tests various scenarios of the React Compiler with a movie
          database. Use the navigation above to explore different test cases.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}>
        <TestCard
          emoji="✅"
          title="Normal Component"
          description="Standard React component with movie list. Should compile successfully without any warnings."
          color="#4CAF50"
        />
        <TestCard
          emoji="⚠️"
          title="Incompatible API"
          description="Component directly using virtual scrolling (useVirtualizer). Should show compilation warning."
          color="#FF9800"
        />
        <TestCard
          emoji="🚫"
          title="Use No Memo"
          description="Component with 'use no memo' directive to opt out of React Compiler optimization."
          color="#2196F3"
        />
        <TestCard
          emoji="🪝"
          title="Custom Hook Error"
          description="Custom hook wrapping incompatible API. Should trigger React Compiler error but ESLint might miss it!"
          color="#f44336"
        />
        <TestCard
          emoji="📋"
          title="Virtual List Demo"
          description="Real-world example with virtual scrolling and movie data. Tests compiler with genre filtering."
          color="#9C27B0"
        />
      </section>

      <section
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          📖 What to Look For
        </h3>
        <ul
          style={{
            listStyle: "disc",
            paddingLeft: "2rem",
            lineHeight: "1.8",
            color: "#555",
          }}>
          <li>
            <strong>Build Output:</strong> Check the terminal for React Compiler
            logs during development
          </li>
          <li>
            <strong>ESLint Warnings:</strong> Some incompatible APIs should
            trigger ESLint warnings (if installed)
          </li>
          <li>
            <strong>Runtime Behavior:</strong> All pages should work correctly
            regardless of compiler status
          </li>
          <li>
            <strong>Virtual Scrolling:</strong> Observe smooth scrolling even
            when optimization is skipped
          </li>
        </ul>
      </section>

      <section
        style={{
          marginTop: "1rem",
          padding: "1.5rem",
          backgroundColor: "#fff0f0",
          borderRadius: "8px",
          border: "2px solid #f44336",
        }}>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#f44336" }}>
          🎯 The Critical Test: Custom Hook
        </h3>
        <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "#555", marginBottom: "1rem" }}>
          The most important test is the <strong>Custom Hook Error</strong> page.
          It demonstrates a common issue where:
        </p>
        <ol
          style={{
            paddingLeft: "2rem",
            lineHeight: "1.8",
            color: "#555",
          }}>
          <li>
            An incompatible API (<code>useVirtualizer</code>) is wrapped in a
            custom hook
          </li>
          <li>React Compiler will log warnings in the terminal</li>
          <li>
            <strong style={{ color: "#f44336" }}>
              ESLint might NOT show warnings
            </strong>{" "}
            (this is the problem!)
          </li>
          <li>The page still works, but won't be optimized</li>
        </ol>
      </section>
    </div>
  );
}

interface TestCardProps {
  emoji: string;
  title: string;
  description: string;
  color: string;
}

function TestCard({ emoji, title, description, color }: TestCardProps) {
  return (
    <div
      style={{
        padding: "1.5rem",
        border: `2px solid ${color}`,
        borderRadius: "8px",
        backgroundColor: "#fff",
      }}>
      <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{emoji}</div>
      <h3 style={{ fontSize: "1.3rem", marginBottom: "0.5rem", color }}>
        {title}
      </h3>
      <p style={{ fontSize: "0.95rem", lineHeight: "1.5", color: "#666" }}>
        {description}
      </p>
    </div>
  );
}
