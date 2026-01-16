export type ShapeType = "polygon" | "rectangle" | "circle" | "line";

export interface DrawnFeature
  extends GeoJSON.Feature<GeoJSON.Geometry> {
  properties: {
    id: string;
    shapeType: ShapeType;
    radius?: number; 
  };
}
