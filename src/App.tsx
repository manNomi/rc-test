import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { NormalPage } from "./pages/NormalPage";
import { IncompatiblePage } from "./pages/IncompatiblePage";
import { NoMemoPage } from "./pages/NoMemoPage";
import { CustomHookPage } from "./pages/CustomHookPage";
import { VirtualListPage } from "./pages/VirtualListPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="normal" element={<NormalPage />} />
          <Route path="incompatible" element={<IncompatiblePage />} />
          <Route path="no-memo" element={<NoMemoPage />} />
          <Route path="custom-hook" element={<CustomHookPage />} />
          <Route path="list" element={<VirtualListPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
