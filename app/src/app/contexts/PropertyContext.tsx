"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type DashboardProperty = {
  id: string;
  name: string;
  timezone: string | null;
};

type PropertyContextType = {
  selectedPropertyId: string;
  setSelectedPropertyId: (id: string) => void;
  dashboardProperties: DashboardProperty[];
  setDashboardProperties: (properties: DashboardProperty[]) => void;
};

const PropertyContext = createContext<PropertyContextType | undefined>(
  undefined
);

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [selectedPropertyId, setSelectedPropertyId] = useState("all");
  const [dashboardProperties, setDashboardProperties] = useState<
    DashboardProperty[]
  >([]);

  return (
    <PropertyContext.Provider
      value={{
        selectedPropertyId,
        setSelectedPropertyId,
        dashboardProperties,
        setDashboardProperties,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperty() {
  const context = useContext(PropertyContext);

  if (!context) {
    throw new Error("useProperty doit être utilisé dans PropertyProvider");
  }

  return context;
}
