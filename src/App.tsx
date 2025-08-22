
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import EcommerceTemplate from "./pages/EcommerceTemplate";
import NotFound from "./pages/NotFound";
import AuthPage from "./components/AuthPage";
import ProcurementSystem from "./pages/ProcurementSystem";
import PoolDetails from "./pages/PoolDetails";
import ContentEditor from "./pages/ContentEditor";

const App = () => (
  <AuthProvider>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/procurement" element={<ProcurementSystem />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/content-editor" element={<ContentEditor />} />
      <Route path="/template" element={<EcommerceTemplate />} />
      <Route path="/pool/:poolId" element={<PoolDetails />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </AuthProvider>
);

export default App;
