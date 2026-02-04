import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Resumen from "./pages/Dashboard/Resumen";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function AppContent() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/auth" element={<SignIn />} />


      {/* Rutas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/castigados" element={<Home />} />
          <Route path="/resumen" element={<Resumen />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router basename="/CarteraCastigada">
        <ScrollToTop />
        <AppContent />
      </Router>
    </AuthProvider>
  );
}