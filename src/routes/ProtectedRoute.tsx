import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
    const { authenticated, loading } = useAuth();
    const location = useLocation(); // ✅ Usa useLocation() de React Router

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                <p className="ml-3 text-gray-600">Verificando sesión...</p>
            </div>
        );
    }

    if (!authenticated) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return <Outlet />;
}