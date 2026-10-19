import { Navigate , Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types/auth";

export interface ProtectedRouteProps{
    allowedRoles?:UserRole[];
}

export function ProtectedRoute({allowedRoles}:ProtectedRouteProps){
    const {isAuthenticated,isLoading,user}=useAuth();
    const location=useLocation();


    if(isLoading){
        return(
            <div className="flex min-h-screen items-center justify-center">
                <p>Verifying session....</p>
            </div>
        );
    }
   if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

 
  if (
    allowedRoles &&
    user &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

 
  return <Outlet />;
}

