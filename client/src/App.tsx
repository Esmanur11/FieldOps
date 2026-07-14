import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { SiteDetailPage } from "./pages/SiteDetailPage";
import { SitesPage } from "./pages/SitesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/sites" element={<SitesPage />} />
        <Route path="/sites/:id" element={<SiteDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
