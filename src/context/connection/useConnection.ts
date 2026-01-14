// src/context/connection/useConnection.ts
import { useContext } from "react";
import { ConnectionContext, type ConnectionContextType } from "./ConnectionContext";

export const useConnection = (): ConnectionContextType => {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error("useConnection must be used within a ConnectionProvider");
  }
  return context;
};
