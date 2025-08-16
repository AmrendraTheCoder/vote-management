import { useState, useEffect } from "react";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Hardcoded credentials (in production, this should be handled by backend)
  const validCredentials = {
    admin: "admin123",
    chirag: "chirag@vote2024",
    manager: "vote_manager_2024",
    coordinator: "coordinator@123",
    viva24: "viva_city",
  };

  useEffect(() => {
    const authStatus = localStorage.getItem("voteManagerAuth");
    const savedUser = localStorage.getItem("voteManagerUser");
    if (authStatus === "true") {
      setIsAuthenticated(true);
      if (savedUser) {
        setLoginId(savedUser);
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (validCredentials[loginId] && validCredentials[loginId] === password) {
      setIsAuthenticated(true);
      localStorage.setItem("voteManagerAuth", "true");
      localStorage.setItem("voteManagerUser", loginId);
    } else {
      setLoginError("Invalid ID or password. Please try again.");
    }

    setLoginLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("voteManagerAuth");
    localStorage.removeItem("voteManagerUser");
    setLoginId("");
    setPassword("");
  };

  return {
    isAuthenticated,
    user: loginId, // Add user property
    loginId,
    setLoginId,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loginError,
    loginLoading,
    login: handleLogin, // Add login alias
    logout: handleLogout, // Add logout alias
    handleLogin,
    handleLogout,
  };
};

export { useAuth };
