import React, { createContext, useContext, useState } from "react";

interface AdminContextProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

const AdminContext = createContext<AdminContextProps | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedModel, setSelectedModel] = useState<string>("users");
  return (
    <AdminContext.Provider value={{ selectedModel, setSelectedModel }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin debe usarse dentro de AdminProvider");
  return ctx;
};
