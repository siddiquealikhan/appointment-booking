import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: "patient" | "doctor";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
    role: "patient" | "doctor"
  ) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const response = await axios.get(
            "http://localhost:5002/api/auth/me",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setUser(response.data);
        } catch (error: any) {
          console.error("Authentication error:", error);
          localStorage.removeItem("token");
          setUser(null);
        }
      }

      setLoading(false);
    };

    checkUser();
  }, []);

  const login = async (
    email: string,
    password: string,
    role: "patient" | "doctor"
  ) => {
    try {
      const response = await axios.post(
        `http://localhost:5002/api/${
          role === "patient" ? "patients" : "doctors"
        }/login`,
        {
          email,
          password,
        }
      );

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setUser(user);
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(
        error.response?.data?.message ||
          "Failed to login. Please check your credentials."
      );
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post(
        "http://localhost:5002/api/patients/register",
        {
          name,
          email,
          password,
        }
      );

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setUser(user);
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to register. Please try again."
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
