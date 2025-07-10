import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/axios"; // ✅ Axios instance from earlier

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const response = await api.post("/login/", {
        email,
        password,
      });

      // Example response from Django:
      // { "user": { "id": 1, "email": "ujwal@example.com", "name": "ujwal" }, "token": "JWT..." }

      const user = response.data.user;
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));

      // Optional: Store JWT token
      // localStorage.setItem("token", response.data.token);

      return true;
    } catch (error: any) {
      console.error("Login failed:", error.response?.data || error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    // Optional: remove token if used
    // localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
