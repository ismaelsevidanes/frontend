import React, { useState, createContext, useContext, useEffect } from "react";

interface UserMenuContextProps {
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleLogout: () => void;
  username: string;
  updateUsername: (newName: string) => void;
}

const UserMenuContext = createContext<UserMenuContextProps | undefined>(undefined);

export const UserMenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUsername(payload.name || payload.email || "Usuario");
      } catch {
        setUsername("");
      }
    } else {
      setUsername("");
    }
  }, []);

  const updateUsername = (newName: string) => {
    setUsername(newName);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };
  return (
    <UserMenuContext.Provider value={{ menuOpen, setMenuOpen, handleLogout, username, updateUsername }}>
      {children}
    </UserMenuContext.Provider>
  );
};

export const useUserMenu = () => {
  const ctx = useContext(UserMenuContext);
  if (!ctx) throw new Error("useUserMenu debe usarse dentro de UserMenuProvider");
  return ctx;
};
