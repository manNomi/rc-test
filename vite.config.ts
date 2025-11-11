import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
    minify: false, // Disable minification for easier analysis
  },
  plugins: [
    react({
      babel: {
        plugins: [
          [
            "babel-plugin-react-compiler",
            {
              logger: {
                logEvent(filename: string, event: unknown) {
                  console.log(`[React Compiler] ${filename}:`, JSON.stringify(event, null, 2));
                },
              },
            },
          ],
        ],
      },
    }),
  ],
});
