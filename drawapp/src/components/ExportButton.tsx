import { exportGeoJSON } from "../utils/exportGeoJSON";
import { useFeatures } from "../context/FeatureContext";

export default function ExportButton() {
  const { features } = useFeatures();

  return (
    <button
      onClick={() => exportGeoJSON(features)}
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 1000,
        padding: "8px 12px",
        background: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      Export GeoJSON
    </button>
  );
}
