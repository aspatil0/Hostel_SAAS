import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User, LoginCredential, AuthContextType } from "../types/auth";


const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

 
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as User);
      }
    } catch (error) {
      console.error("Failed to restore authentication session:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredential): Promise<void> => {

    const mockToken = "mock-auth-token-xyz";
    const mockUser: User = {
      _id: "usr_001",
      name: "Demo Admin",
      email: credentials.email,
      role: "SUPER_ADMIN",
      status: "active",
    };

    setToken(mockToken);
    setUser(mockUser);

    localStorage.setItem("token", mockToken);
    localStorage.setItem("user", JSON.stringify(mockUser));
  };


  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  
  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
