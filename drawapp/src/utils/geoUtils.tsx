import booleanWithin from "@turf/boolean-within";
import booleanIntersects from "@turf/boolean-intersects";
import area from "@turf/area";
import difference from "@turf/difference";
import union from "@turf/union";
import * as turf from "@turf/turf";

import type { DrawnFeature } from "../types/geo";
import type { Feature, Polygon, MultiPolygon, Point } from "geojson";

/**
 * Convert any shape (Circle, Rectangle, Polygon) to Polygon for overlap detection
 */
function normalizeToPolygon(feature: DrawnFeature): Feature<Polygon> | null {
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
    return null;
  }

  // Polygon / Rectangle → already polygon
  if (feature.geometry.type === "Polygon") {
    return feature as Feature<Polygon>;
  }

  return null;
}

/**
 * Handles overlap logic for all shapes (Circle, Rectangle, Polygon)
 * - Fully enclosed → block
 * - Fully covering existing → block
 * - Partial overlap → trim
 * - No overlap → allow
 */
export function handlePolygonOverlap(
  newFeature: DrawnFeature,
  existingFeatures: DrawnFeature[]
): DrawnFeature | null {
  // Convert new feature to polygon for overlap detection
  const newPolygon = normalizeToPolygon(newFeature);
  if (!newPolygon) return newFeature; // If can't normalize, allow it (e.g., lines)

  const newFeaturePoly: Feature<Polygon | MultiPolygon> = {
    type: "Feature",
    geometry: newPolygon.geometry,
    properties: {},
  };

  // Collect all overlapping existing features
  const overlappingFeatures: Feature<Polygon | MultiPolygon>[] = [];

  for (const existing of existingFeatures) {
    const existingPolygon = normalizeToPolygon(existing);
    if (!existingPolygon) continue; // Skip non-polygon shapes (e.g., lines)

    const existingFeature: Feature<Polygon | MultiPolygon> = {
      type: "Feature",
      geometry: existingPolygon.geometry,
      properties: {},
    };

    // Check for intersection
    if (!booleanIntersects(newFeaturePoly, existingFeature)) {
      continue; // No intersection, skip
    }

    // ❌ BLOCK CASE 1: New shape fully inside existing
    if (booleanWithin(newFeaturePoly, existingFeature)) {
      return null;
    }

    // ❌ BLOCK CASE 2: New shape fully covers existing
    if (booleanWithin(existingFeature, newFeaturePoly)) {
      return null;
    }

    // Add to overlapping features list
    overlappingFeatures.push(existingFeature);
  }

  // If no overlaps, return original feature
  if (overlappingFeatures.length === 0) {
    return newFeature;
  }

  // ✂️ TRIM: Union all overlapping features, then subtract from new feature
  try {
    let unionFeature: Feature<Polygon | MultiPolygon> | null = null;

    // Union all overlapping existing features into one
    if (overlappingFeatures.length === 1) {
      unionFeature = overlappingFeatures[0];
    } else {
      // Start with first feature
      unionFeature = overlappingFeatures[0];
      
      // Union with each subsequent overlapping feature
      for (let i = 1; i < overlappingFeatures.length; i++) {
        if (unionFeature) {
          try {
            // @ts-expect-error Turf typing bug
            const unioned = union(unionFeature, overlappingFeatures[i]);
            if (unioned && unioned.geometry) {
              unionFeature = unioned as Feature<Polygon | MultiPolygon>;
            } else {
              console.warn("Union failed, falling back to iterative trimming");
              // Fallback: trim against each feature individually
              return trimIteratively(newFeaturePoly, overlappingFeatures, newFeature);
            }
          } catch (unionError) {
            console.warn("Union error, falling back to iterative trimming:", unionError);
            // Fallback: trim against each feature individually
            return trimIteratively(newFeaturePoly, overlappingFeatures, newFeature);
          }
        }
      }
    }

    if (!unionFeature) {
      return null;
    }

    // Subtract the unioned overlapping areas from the new feature
    // @ts-expect-error Turf typing bug
    const diff = difference(newFeaturePoly, unionFeature);

    if (!diff || !diff.geometry) {
      console.warn("Difference failed, trying iterative approach");
      // Fallback: trim against each feature individually
      return trimIteratively(newFeaturePoly, overlappingFeatures, newFeature);
    }

    // Check if geometry is valid
    if (diff.geometry.type !== "Polygon" && diff.geometry.type !== "MultiPolygon") {
      console.warn("Invalid geometry type after difference:", diff.geometry.type);
      return null; // Invalid geometry type
    }

    // Check if result has valid area (use a very small threshold)
    const diffArea = area(diff);
    const originalArea = area(newFeaturePoly);
    
    console.log("Trimming overlap:", {
      originalArea,
      trimmedArea: diffArea,
      removedArea: originalArea - diffArea,
      geometryType: diff.geometry.type
    });

    if (isNaN(diffArea) || diffArea < 0.0001) {
      console.warn("Trimmed area too small, blocking operation");
      return null; // Resulting area invalid or too small
    }

    // Return trimmed feature with original properties
    const trimmedFeature = {
      type: "Feature",
      geometry: diff.geometry,
      properties: newFeature.properties,
    } as DrawnFeature;
    
    console.log("Returning trimmed feature:", trimmedFeature);
    return trimmedFeature;
  } catch (error) {
    console.error("Error trimming overlap:", error);
    // Fallback: try iterative trimming
    return trimIteratively(newFeaturePoly, overlappingFeatures, newFeature);
  }
}

/**
 * Fallback: Trim iteratively against each overlapping feature
 */
function trimIteratively(
  workingFeature: Feature<Polygon | MultiPolygon>,
  overlappingFeatures: Feature<Polygon | MultiPolygon>[],
  originalFeature: DrawnFeature
): DrawnFeature | null {
  let result = workingFeature;

  for (const existingFeature of overlappingFeatures) {
    try {
      // @ts-expect-error Turf typing bug
      const diff = difference(result, existingFeature);

      if (!diff || !diff.geometry) {
        return null;
      }

      if (diff.geometry.type !== "Polygon" && diff.geometry.type !== "MultiPolygon") {
        return null;
      }

      const diffArea = area(diff);
      if (isNaN(diffArea) || diffArea < 0.0001) {
        return null;
      }

      result = diff as Feature<Polygon | MultiPolygon>;
    } catch (error) {
      console.error("Error in iterative trim:", error);
      return null;
    }
  }

  return {
    type: "Feature",
    geometry: result.geometry,
    properties: originalFeature.properties,
  } as DrawnFeature;
}
