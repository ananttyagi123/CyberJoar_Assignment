import L from "leaflet";

export function useDrawFeatures(map: L.Map | null) {
  if (!map) return null;

  const drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  const drawControl = new L.Control.Draw({
    edit: { featureGroup: drawnItems },
    draw: {
      polygon: {},
      rectangle: {},
      circle: {},
      polyline: {},
      marker: false,
      circlemarker: false,
    },
  });

  map.addControl(drawControl);

  return drawnItems;
}
