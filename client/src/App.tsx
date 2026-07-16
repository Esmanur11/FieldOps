import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuditDetailPage } from "./pages/AuditDetailPage";
import { AuditsPage } from "./pages/AuditsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { MachineDetailPage } from "./pages/MachineDetailPage";
import { MachinesPage } from "./pages/MachinesPage";
import { MaterialsPage } from "./pages/MaterialsPage";
import { PersonnelDetailPage } from "./pages/PersonnelDetailPage";
import { PersonnelPage } from "./pages/PersonnelPage";
import { ShiftsPage } from "./pages/ShiftsPage";
import { SiteDetailPage } from "./pages/SiteDetailPage";
import { SitesPage } from "./pages/SitesPage";
import { UsersPage } from "./pages/UsersPage";
import { WorkOrderDetailPage } from "./pages/WorkOrderDetailPage";
import { WorkOrdersPage } from "./pages/WorkOrdersPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/sites" element={<SitesPage />} />
          <Route path="/sites/:id" element={<SiteDetailPage />} />
          <Route path="/personnel" element={<PersonnelPage />} />
          <Route path="/personnel/:id" element={<PersonnelDetailPage />} />
          <Route path="/machines" element={<MachinesPage />} />
          <Route path="/machines/:id" element={<MachineDetailPage />} />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/audits" element={<AuditsPage />} />
          <Route path="/audits/:id" element={<AuditDetailPage />} />
          <Route path="/work-orders" element={<WorkOrdersPage />} />
          <Route path="/work-orders/:id" element={<WorkOrderDetailPage />} />
          <Route path="/shifts" element={<ShiftsPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
