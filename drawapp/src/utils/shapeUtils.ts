import type { DrawnFeature, ShapeType } from "../types/geo";

export function countShapes(
  features: DrawnFeature[],
  type: ShapeType
) {
  return features.filter(
    (f) => f.properties.shapeType === type
  ).length;
}
