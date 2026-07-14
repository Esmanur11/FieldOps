import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { MachineDetailPage } from "./pages/MachineDetailPage";
import { MachinesPage } from "./pages/MachinesPage";
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
        <Route path="/machines" element={<MachinesPage />} />
        <Route path="/machines/:id" element={<MachineDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
