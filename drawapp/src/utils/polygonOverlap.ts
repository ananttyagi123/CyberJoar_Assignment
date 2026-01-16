import * as turf from "@turf/turf";
import type { Feature, Polygon, Geometry } from "geojson";

/**
 * Convert shapes to Polygon for Turf
 * Supports:
 *  - Circles (Point + radius)
 *  - Rectangles / Polygons
 */
function normalizeToPolygon(feature: Feature<Geometry>): Feature<Polygon> | null {
  // Circle → convert Point+radius to Polygon
  if (feature.geometry.type === "Point" && feature.properties?.radius) {
    const radius = feature.properties.radius;
    if (typeof radius === "number" && radius > 0) {
      return turf.circle(
        feature.geometry.coordinates,
        radius,
        { units: "meters" }
      ) as Feature<Polygon>;
    }
    return null; // radius invalid
  }

  // Polygon / Rectangle → already polygon
  if (feature.geometry.type === "Polygon") {
    return feature as Feature<Polygon>;
  }

  // Other geometries (LineString, MultiPolygon, etc.) → ignore
  return null;
}

/**
 * Resolve polygon overlap rules:
 *  - Trim overlapping areas
 *  - Block new polygon if it fully contains existing
 *  - Ignore non-polygon shapes
 */
export function resolvePolygonOverlap(
  newFeature: Feature<Geometry>,
  existingFeatures: Feature<Geometry>[]
): Feature<Polygon> | null {
  const normalizedNew = normalizeToPolygon(newFeature);
  if (!normalizedNew) return null; // unsupported geometry

  let result: Feature<Polygon> = normalizedNew;

  for (const feature of existingFeatures) {
    const existingPoly = normalizeToPolygon(feature);
    if (!existingPoly) continue; // skip non-polygons

    // ❌ Block full containment
    if (turf.booleanContains(result, existingPoly)) {
      alert("New polygon cannot fully enclose an existing polygon");
      return null;
    }

    // ✂ Trim partial overlap
    if (turf.booleanOverlap(result, existingPoly)) {
      const diff = turf.difference(result, existingPoly);
      if (!diff) {
        alert("Polygon completely removed due to overlap");
        return null;
      }
      result = diff as Feature<Polygon>; // ensure type
    }
  }

  return result;
}
