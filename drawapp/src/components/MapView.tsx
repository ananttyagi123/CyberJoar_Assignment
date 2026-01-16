import { MapContainer, TileLayer, GeoJSON, Circle, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";

import { useFeatures } from "../context/FeatureContext";
import type { DrawnFeature, ShapeType } from "../types/geo";
import ExportButton from "./ExportButton";

import { SHAPE_LIMITS } from "../config/shapeLimits";
import { countShapes } from "../utils/shapeUtils";
import { handlePolygonOverlap } from "../utils/geoUtils";

/* ================= DRAW HANDLER ================= */
function DrawHandler() {
  const map = useMap();
  const { addFeature, features } = useFeatures();

  useEffect(() => {
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

map.on(L.Draw.Event.CREATED, (event: any) => {
  const layer = event.layer;

  let shapeType: ShapeType;
  let radius: number | undefined;

  if (layer instanceof L.Circle) {
    shapeType = "circle";
    radius = layer.getRadius();
  } else if (layer instanceof L.Rectangle) {
    shapeType = "rectangle";
  } else if (layer instanceof L.Polygon) {
    shapeType = "polygon";
  } else {
    shapeType = "line";
  }

  // Step-5: Check shape limits
  const currentCount = countShapes(features, shapeType);
  const limit = SHAPE_LIMITS[shapeType];
  if (currentCount >= limit) {
    alert(`Maximum ${limit} ${shapeType}s allowed`);
    map.removeLayer(layer);
    return;
  }

  // Convert to GeoJSON
  const geoJson = layer.toGeoJSON();

  // Merge original GeoJSON properties with custom properties
  const feature: DrawnFeature = {
    ...geoJson,
    properties: {
      ...geoJson.properties, // preserve original
      id: crypto.randomUUID(),
      shapeType,
      radius, // only circles will have radius
    },
  };

  // Step-6: Handle overlap for all shapes (Circle, Rectangle, Polygon)
  let finalFeature = feature;
  if (shapeType === "polygon" || shapeType === "rectangle" || shapeType === "circle") {
    console.log("Checking overlap for:", shapeType, feature);
    console.log("Existing features:", features.length);
    
    const trimmed = handlePolygonOverlap(feature, features);

    if (!trimmed) {
      console.warn("Overlap check returned null - blocking operation");
      alert("Shape overlaps existing shape. Operation blocked.");
      map.removeLayer(layer);
      return;
    }

    // Check if trimming actually changed the geometry
    const originalGeoJson = JSON.stringify(feature.geometry);
    const trimmedGeoJson = JSON.stringify(trimmed.geometry);
    const wasTrimmed = originalGeoJson !== trimmedGeoJson;
    
    console.log("Trim result:", {
      wasTrimmed,
      originalType: feature.geometry.type,
      trimmedType: trimmed.geometry.type
    });

    // Use the trimmed feature directly
    finalFeature = trimmed;
    
    // If circle was trimmed and became a polygon/multipolygon, update shapeType
    if (shapeType === "circle" && trimmed.geometry.type !== "Point") {
      finalFeature.properties.shapeType = "polygon";
    }
  }

  map.removeLayer(layer);
  addFeature(finalFeature);
});


    return () => {
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
    };
  }, [map, addFeature, features]);

  return null;
}

/* ================= MAP VIEW ================= */
export default function MapView() {
  const { features } = useFeatures();

  return (
    <MapContainer
      center={[28.6139, 77.209]}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <ExportButton />

      {features.map((feature) => {
        // Render as Circle only if it's still a Point geometry (not trimmed)
        if (feature.properties.shapeType === "circle" && feature.geometry.type === "Point") {
          const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates;
          return (
            <Circle
              key={feature.properties.id}
              center={[lat, lng]}
              radius={feature.properties.radius!}
            />
          );
        }

        // Polygons/Rectangles/Trimmed shapes
        return <GeoJSON key={feature.properties.id} data={feature} />;
      })}

      <DrawHandler />
    </MapContainer>
  );
}
