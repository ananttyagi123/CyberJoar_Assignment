import type { DrawnFeature } from "../types/geo";

export function exportGeoJSON(features: DrawnFeature[]) {
  const geoJson = {
    type: "FeatureCollection",
    features,
  };

  const blob = new Blob(
    [JSON.stringify(geoJson, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "drawn-features.geojson";
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
