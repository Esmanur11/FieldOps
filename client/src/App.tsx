import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { PersonnelDetailPage } from "./pages/PersonnelDetailPage";
import { PersonnelPage } from "./pages/PersonnelPage";
import { SiteDetailPage } from "./pages/SiteDetailPage";
import { SitesPage } from "./pages/SitesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/sites" element={<SitesPage />} />
        <Route path="/sites/:id" element={<SiteDetailPage />} />
        <Route path="/personnel" element={<PersonnelPage />} />
        <Route path="/personnel/:id" element={<PersonnelDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
