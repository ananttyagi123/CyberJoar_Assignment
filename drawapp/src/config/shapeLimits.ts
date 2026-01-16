import type { ShapeType } from "../types/geo";

export const SHAPE_LIMITS: Record<ShapeType, number> = {
  polygon: 10,
  rectangle: 5,
  circle: 5,
  line: Infinity, // no limit
};
