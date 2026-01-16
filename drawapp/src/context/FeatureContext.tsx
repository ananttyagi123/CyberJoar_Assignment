import { createContext, useContext, useState, type ReactNode } from "react";
import type { DrawnFeature } from "../types/geo";

interface FeatureContextType {
  features: DrawnFeature[];
  addFeature: (feature: DrawnFeature) => void;
}

const FeatureContext = createContext<FeatureContextType | null>(null);

export function FeatureProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<DrawnFeature[]>([]);

  const addFeature = (feature: DrawnFeature) => {
    console.log("📦 Saved Feature:", feature);

    setFeatures((prev) => {
      const updated = [...prev, feature];
      console.log("📊 All Features:", updated);
      return updated;
    });
  };

  return (
    <FeatureContext.Provider value={{ features, addFeature }}>
      {children}
    </FeatureContext.Provider>
  );
}

export function useFeatures() {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error("useFeatures must be used inside FeatureProvider");
  }
  return context;
}
