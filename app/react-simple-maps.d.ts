declare module 'react-simple-maps' {
  import type React from 'react';
  import type { ComponentType, ReactNode } from 'react';

  export interface ProjectionConfig {
    rotate?: [number, number, number];
    scale?: number;
    center?: [number, number];
    parallels?: [number, number];
  }

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: ProjectionConfig;
    style?: React.CSSProperties;
    viewBox?: string;
    children?: ReactNode;
  }

  export interface GeographiesProps {
    geography: string | object;
    children: (args: { geographies: GeoFeature[] }) => ReactNode;
  }

  export interface GeoFeature {
    rsmKey: string;
    properties: Record<string, string>;
    geometry: object;
    type: string;
  }

  export interface GeographyStyleEntry {
    outline?: string;
    cursor?: string;
    fill?: string;
    [key: string]: string | undefined;
  }

  export interface GeographyStyle {
    default?: GeographyStyleEntry;
    hover?: GeographyStyleEntry;
    pressed?: GeographyStyleEntry;
  }

  export interface GeographyProps {
    geography: GeoFeature;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: GeographyStyle;
    onMouseEnter?: (event: React.MouseEvent<SVGPathElement>) => void;
    onMouseLeave?: (event: React.MouseEvent<SVGPathElement>) => void;
    onClick?: (event: React.MouseEvent<SVGPathElement>) => void;
    'aria-label'?: string;
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Geography: ComponentType<GeographyProps>;
}
