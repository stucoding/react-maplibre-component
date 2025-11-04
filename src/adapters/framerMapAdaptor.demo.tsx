import React, { useMemo } from 'react';
import MapDemo from '../components/MapDemo';

export type FramerControlType = 'string' | 'number' | 'boolean';

export type FramerControls = Record<string, { type: FramerControlType; title?: string }>;

export interface FramerAdaptorProps {
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  title?: string;
  enableInteraction?: boolean;
  markers?: any;
  onMarkerClick?: (marker: any) => void;
  [key: string]: any;
}

export function createFramerMapAdaptor(MapComponent: React.FC<any>) {
  const Wrapped: React.FC<FramerAdaptorProps> & { framerControls: FramerControls } = (props) => {
    const { centerLat, centerLng, zoom, markers, onMarkerClick, ...rest } = props;

    const center = useMemo(() => {
      if (rest.center && typeof rest.center === 'object') return rest.center;
      if (typeof centerLat === 'number' && typeof centerLng === 'number') {
        return { lat: centerLat, lng: centerLng };
      }
      return undefined;
    }, [rest.center, centerLat, centerLng]);

    const forwardedProps = useMemo(
      () => ({
        ...rest,
        ...(center ? { center } : {}),
        ...(typeof zoom === 'number' ? { zoom } : {}),
        ...(markers !== undefined ? { markers } : {}),
        ...(onMarkerClick ? { onMarkerClick } : {}),
      }),
      [rest, center, zoom, markers, onMarkerClick],
    );

    return <MapComponent {...forwardedProps} />;
  };

  Wrapped.framerControls = {
    centerLat: { type: 'number', title: 'Center Latitude' },
    centerLng: { type: 'number', title: 'Center Longitude' },
    zoom: { type: 'number', title: 'Zoom' },
    title: { type: 'string', title: 'Title' },
    enableInteraction: { type: 'boolean', title: 'Enable Interaction' },
  };

  return Wrapped;
}

export const MapAdaptor = createFramerMapAdaptor(MapDemo);

export default MapAdaptor;
