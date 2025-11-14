import * as React from 'react';
import { renderToString } from 'react-dom/server';

// Define MapLibre map interface (maplibre-gl is loaded dynamically via script tag)
// This works in both Vite builds and Framer environments
interface MapLibreMap {
  easeTo(options: {
    center: [number, number];
    bearing: number;
    duration: number;
    easing: (t: number) => number;
    essential: boolean;
  }): void;
  flyTo(options: { center: [number, number]; zoom: number; duration: number }): void;
  remove(): void;
  on(event: string, handler: () => void): void;
  once(event: string, handler: () => void): void;
  addSource(id: string, source: { type: string; url?: string; tileSize?: number; maxzoom?: number }): void;
  setTerrain(options: { source: string; exaggeration: number }): void;
  addControl(control: { visualizePitch?: boolean } | Record<string, unknown>, position: string): void;
  setBearing(bearing: number): void; // Add this for direct bearing updates
  getBearing(): number; // Add this to get current bearing
}

// Grouped configuration types for better organization
export interface MapCameraConfig {
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  pitch?: number;
  bearing?: number;
}

export interface MapTerrainConfig {
  enabled?: boolean;
  exaggeration?: number;
  source?: string;
}

export interface MapRotationConfig {
  enabled?: boolean;
  speed?: number; // degrees per rotation step
  stepDuration?: number; // ms per step
  initialBearing?: number;
  zoomLevel?: number; // 0 - tile entire world; 1 - ¼ of the world; 2 - 1⁄16
}

export interface MapAnimationConfig {
  flyToDuration?: number; // ms
  rotationStep?: number; // degrees
  zoomLevel?: number; // 0 - tile entire world; 1 - ¼ of the world; 2 - 1⁄16
}

export interface MapStyleConfig {
  bgColor?: string;
  buttonColor?: string;
  popupBgColor?: string;
  popupTextColor?: string;
}

export interface MapUIConfig {
  showNavigation?: boolean;
  showFullscreen?: boolean;
  showSidebar?: boolean;
  sidebarWidth?: number;
  listAlwaysVisible?: boolean;
  locationListAlign?: 'left' | 'right';
  listSize?: number;
}

export interface MapMarkerConfig {
  width?: number | string;
  height?: number | string;
}

export interface MapLibreConfig {
  scriptUrl?: string;
  cssUrl?: string;
  version?: string;
}

export interface MapPoint {
  id?: string;
  lat: number;
  lng: number;
  title: string;
  infoText?: string;
  image?: string;
  pin?: string;
  url?: string;
}

export interface MapTiler3DMapProps {
  // Required
  apiKey: string;
  points: MapPoint[];

  // Core settings (flat for easy Framer control)
  mapName?: string;
  rotating?: boolean;
  bgColor?: string;

  // Grouped configs (optional, with defaults)
  camera?: MapCameraConfig;
  terrain?: MapTerrainConfig;
  rotation?: MapRotationConfig;
  animation?: MapAnimationConfig;
  style?: MapStyleConfig;
  ui?: MapUIConfig;
  marker?: MapMarkerConfig;
  mapLibre?: MapLibreConfig;

  // Callbacks
  onMarkerClick?: (point: MapPoint, index: number) => void;
  onMapReady?: () => void;
}

export const MapTiler3DMap: React.FC<MapTiler3DMapProps> = React.memo(
  function MapTiler3DMap({
    apiKey,
    points,
    mapName = 'outdoor',
    rotating = false,
    bgColor = '#333',
    camera,
    terrain,
    rotation,
    animation,
    style,
    ui,
    marker,
    mapLibre,
    onMarkerClick,
    onMapReady,
  }) {
    const mapRef = React.useRef<HTMLDivElement>(null);
    const mapObj = React.useRef<MapLibreMap>(null);
    const isRotating = React.useRef(false);
    const rotationTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    // Merge defaults with provided configs
    const cameraConfig: MapCameraConfig = {
      center: [8.763649918607726, 46.68006894117724],
      zoom: 12,
      pitch: 50,
      bearing: -90,
      ...camera,
    };

    const terrainConfig: MapTerrainConfig = {
      enabled: true,
      exaggeration: 1.5,
      source: 'terrainSource',
      ...terrain,
    };

    const rotationConfig: MapRotationConfig = {
      enabled: rotating,
      speed: 30,
      stepDuration: 12000,
      initialBearing: -90,
      ...rotation,
    };

    const animationConfig: MapAnimationConfig = {
      flyToDuration: 2400,
      rotationStep: 30,
      zoomLevel: 16,
      ...animation,
    };

    const uiConfig: MapUIConfig = {
      showNavigation: true,
      showFullscreen: false,
      showSidebar: true,
      sidebarWidth: 300,
      listAlwaysVisible: false,
      locationListAlign: 'left',
      listSize: 320,
      ...ui,
    };

    const markerConfig: MapMarkerConfig = {
      width: 20,
      height: 20,
      ...marker,
    };

    const version = mapLibre?.version ?? '3.6.2';
    const mapLibreConfig: MapLibreConfig = {
      version,
      scriptUrl: mapLibre?.scriptUrl || `https://unpkg.com/maplibre-gl@${version}/dist/maplibre-gl.js`,
      cssUrl: mapLibre?.cssUrl || `https://unpkg.com/maplibre-gl@${version}/dist/maplibre-gl.css`,
    };

    const [menuOpen, setMenuOpen] = React.useState(false);
    const [ready, setReady] = React.useState(false);

    React.useEffect(() => {
      if (uiConfig.listAlwaysVisible) {
        setMenuOpen(false);
      }
    }, [uiConfig.listAlwaysVisible]);

    React.useEffect(() => {
      // Load MapLibre and CSS dynamically
      const script = document.createElement('script');
      script.src = mapLibreConfig.scriptUrl!;
      script.onload = initMap;
      document.head.appendChild(script);

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = mapLibreConfig.cssUrl!;
      document.head.appendChild(link);

      function initMap() {
        // @ts-expect-error - maplibregl is not typed
        const maplibregl = window.maplibregl;
        
        // Ensure container exists and has dimensions
        if (!mapRef.current) {
          console.warn('Map container ref not available');
          return;
        }

        const container = mapRef.current;
        
        // Wait a tick to ensure container has dimensions (important for Framer)
        const tryInit = () => {
          if (!container) return;
          
          const hasDimensions = container.offsetWidth > 0 && container.offsetHeight > 0;
          
          if (!hasDimensions) {
            // Retry after a short delay
            setTimeout(tryInit, 100);
            return;
          }
          
          // Calculate maxBounds for xkm radius around center
          const [centerLng, centerLat] = cameraConfig.center!;
          const radiusKm = 5;
          // 1 degree latitude ≈ 111 km
          const latOffset = radiusKm / 111;
          // 1 degree longitude ≈ 111 km * cos(latitude)
          const lngOffset = radiusKm / (111 * Math.cos((centerLat * Math.PI) / 180));
          
          const maxBounds: [[number, number], [number, number]] = [
            [centerLng - lngOffset, centerLat - latOffset], // Southwest corner
            [centerLng + lngOffset, centerLat + latOffset], // Northeast corner
          ];
          
          const map = new maplibregl.Map({
            container: container,
            style: `https://api.maptiler.com/maps/${mapName}/style.json?key=${apiKey}`,
            center: cameraConfig.center,
            zoom: cameraConfig.zoom,
            pitch: cameraConfig.pitch,
            bearing: cameraConfig.bearing,
            maxBounds, // Restrict map view to 2km radius
            terrain: terrainConfig.enabled
              ? { source: terrainConfig.source!, exaggeration: terrainConfig.exaggeration }
              : undefined,
          });
          mapObj.current = map;

        map.on('load', () => {
          // Terrain DEM from MapTiler
          map.addSource('terrainSource', {
            type: 'raster-dem',
            url: `https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=${apiKey}`,
            tileSize: 512,
            maxzoom: 14,
          });
          if (terrainConfig.enabled) {
            map.setTerrain({
              source: terrainConfig.source!,
              exaggeration: terrainConfig.exaggeration,
            });
          }

          // 🧭 Add navigation (zoom + rotate)
          if (uiConfig.showNavigation) {
            map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
          }

          // 🖥️ Add fullscreen control if enabled
          if (uiConfig.showFullscreen) {
            map.addControl(new maplibregl.FullscreenControl(), 'top-left');
          }

          // Add markers from Framer UI
          points.forEach((p) => {
            const el = document.createElement('div');
            const width =
              typeof markerConfig.width === 'number'
                ? `${markerConfig.width}px`
                : markerConfig.width!;
            const height =
              typeof markerConfig.height === 'number'
                ? `${markerConfig.height}px`
                : markerConfig.height!;
            el.style.width = width;
            el.style.height = height;
            el.style.backgroundImage = `url(${p.pin})`;
            el.style.backgroundSize = 'contain';
            el.style.backgroundRepeat = 'no-repeat';
            el.style.transformOrigin = 'center';

            // Create popup content
            const pu = createInfoBlock(p);

            const popup = new maplibregl.Popup({
              offset: 25, // pixels from marker
              closeButton: true, // optional
              closeOnClick: true, // default true
            }).setHTML(renderToString(pu));

            new maplibregl.Marker({ element: el })
              .setLngLat([p.lng, p.lat])
              .setPopup(popup)
              .addTo(map);
          });

          // Wait until map is fully rendered
          map.once('idle', () => {
            if (rotationConfig.enabled) {
              startSmoothRotation(map);
            }
            setReady(true);
            onMapReady?.();
          });

          // 🛑 Stop rotation on any user interaction
          const stopRotation = () => {
            isRotating.current = false;
            rotationTimeout.current = null;
          };

          map.on('mousedown', stopRotation);
          map.on('touchstart', stopRotation);
          map.on('wheel', stopRotation);
        });
        };
        
        // Start initialization attempt
        setTimeout(tryInit, 0);
      }

      function createInfoBlock(p: MapPoint) {
          const img = p.image;
          const title = p.title;
          const infoText = p.infoText;
          const url = p.url;

          return (
            <div>
              <img
                src={img}
                style={{
                  width: '100%',
                  borderRadius: '0.75rem',
                }}
              ></img>
              <div>
                <div>
                  <h2>{title}</h2>
                  <div>{infoText}</div>
                </div>
                {url ? (
                  <div>
                    <a href={url}>Learn More &gt</a>
                  </div>
                ) : null}
              </div>
            </div>
          );
        }

      function startSmoothRotation(map: MapLibreMap) {
          if (isRotating.current) return;
          isRotating.current = rotationConfig.enabled!;

          const stepDuration = rotationConfig.stepDuration!;
          const degreesPerStep = animationConfig.rotationStep!;
          const fixedCenter = cameraConfig.center!;
          const startBearing = rotationConfig.initialBearing!;
          let currentBearing = startBearing;

          const step = () => {
            if (!isRotating.current || !mapObj.current) {
              return;
            }

            // Calculate next bearing
            currentBearing = (currentBearing + degreesPerStep) % 360;

            // Use easeTo with ONLY bearing change, keep center fixed
            map.easeTo({
              center: fixedCenter,
              bearing: currentBearing,
              duration: stepDuration,
              easing: (t: number) => t, // linear easing
              essential: true,
            });

            // Chain the next step when current animation completes
            map.once('moveend', () => {
              if (isRotating.current) {
                rotationTimeout.current = setTimeout(step, 0); // Start next immediately
              }
            });
          };

          // Start the rotation
          step();
        }

      return () => {
        const scriptTag = document.querySelector('script[src*="maplibre-gl"]');
        if (scriptTag) scriptTag.remove();
        if (rotationTimeout.current) {
          // Cancel animation frame if it's an animation frame ID
          if (typeof rotationTimeout.current === 'number') {
            cancelAnimationFrame(rotationTimeout.current);
          } else {
            clearTimeout(rotationTimeout.current);
          }
        }
        if (mapObj.current) mapObj.current.remove();
      };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Function to zoom the map to a point
    const handleViewPoint = (p: MapPoint, i: number) => {
      if (!mapObj.current) return;

      // fly to marker
      mapObj.current.flyTo({
        center: [p.lng, p.lat],
        zoom: animationConfig.zoomLevel!,
        duration: animationConfig.flyToDuration!,
      });

      // open popup after flyTo
      setTimeout(
        () => {
          onMarkerClick?.(p, i);
        },
        animationConfig.flyToDuration! - 200,
      );

      if (!uiConfig.listAlwaysVisible) {
        setMenuOpen(false);
      }
    };

    const listSizeValue =
      uiConfig.listSize ?? (typeof uiConfig.sidebarWidth === 'number' ? uiConfig.sidebarWidth : 300);
    const listSizePx = `${listSizeValue}px`;
    const showList = uiConfig.showSidebar !== false;
    const listAlwaysVisible = uiConfig.listAlwaysVisible ?? false;
    const align = uiConfig.locationListAlign ?? 'left';
    const listOnRight = align === 'right';

    const outerStyle: React.CSSProperties =
      listAlwaysVisible && showList
        ? {
            position: 'relative',
            display: 'flex',
            flexDirection: listOnRight ? 'row-reverse' : 'row',
            width: '100%',
            height: '100%',
            borderRadius: 20,
            overflow: 'hidden',
            background: '#000',
          }
        : {
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: 20,
            overflow: 'hidden',
            background: '#000',
          };

    const mapWrapperStyle: React.CSSProperties =
      listAlwaysVisible && showList
        ? {
            flex: 1,
            position: 'relative',
            minWidth: 0,
            minHeight: 0,
          }
        : {
            position: 'absolute',
            inset: 0,
          };

    const mapCanvasStyle: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
    };

    const mapOverlayStyle: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      background: '#f5f5f5',
      transition: 'opacity 400ms ease',
      opacity: ready ? 0 : 1,
      pointerEvents: 'none',
      borderRadius: listAlwaysVisible && showList ? 0 : 20,
      zIndex: 1000,
    };

    const listContainerPinnedStyle: React.CSSProperties = {
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      width: listSizePx,
      height: '100%',
      borderRight: listOnRight ? undefined : '1px solid rgba(15, 23, 42, 0.08)',
      borderLeft: listOnRight ? '1px solid rgba(15, 23, 42, 0.08)' : undefined,
    };

    const popupStyle: React.CSSProperties = {
      position: 'absolute',
      zIndex: 1100,
      display: 'flex',
      flexDirection: 'column',
      background: '#fff',
      overflowY: 'auto',
      opacity: menuOpen ? 1 : 0,
      pointerEvents: menuOpen ? 'auto' : 'none',
      transition: 'transform 280ms ease, opacity 180ms ease',
      boxShadow: '0 24px 60px rgba(15, 23, 42, 0.25)',
      width: listSizePx,
      height: '100%',
      borderRadius: listOnRight ? '12px 0 0 12px' : '0 12px 12px 0',
      top: 0,
      [listOnRight ? 'right' : 'left']: 0,
      transform: menuOpen
        ? 'translateX(0)'
        : listOnRight
          ? 'translateX(100%)'
          : 'translateX(-100%)',
    };

    const toggleButtonStyle: React.CSSProperties = {
      position: 'absolute',
      top: 10,
      [listOnRight ? 'right' : 'left']: 10,
      zIndex: 1200,
    };

    const listContent =
      points.length > 0 ? (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {points.map((p, i) => (
            <div key={p.id ?? i} className="menu-card">
              {p.image && <img src={p.image} alt={p.title} />}
              <h3>{p.title}</h3>
              {p.infoText && <p>{p.infoText}</p>}
              <button onClick={() => handleViewPoint(p, i)}>View</button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>No locations configured</div>
      );

    return (
      <>
        <style>
          {`
          :root {
            --map-button-bg: ${style?.buttonColor ?? bgColor};
            --map-button-color: #fff;
            --popup-bg: ${style?.popupBgColor ?? 'rgba(0,0,0,0.8)'};
            --popup-text: ${style?.popupTextColor ?? '#fff'};
          }

          .maplibregl-ctrl button {
            background-color: var(--map-button-bg) !important;
            border-radius: 6px !important;
            border: none !important;
            margin: 1px;
            width: 28px !important;
            height: 28px !important;
            transition: background-color 0.2s ease;
          }

          .maplibregl-ctrl button:hover {
            filter: brightness(1.2);
          }
          .maplibregl-ctrl-group {
            background-color: transparent !important;
            box-shadow: none !important;
          }

          .maplibregl-popup-content {
            background: var(--map-button-bg) !important;
            font-family: sans-serif !important;
            border-radius: 8px !important;
            padding: 8px 12px !important;
          }
          .maplibregl-popup-tip {
            border-top-color: var(--popup-bg) !important;
          }

          .toggle-btn {
            background: ${style?.buttonColor ?? bgColor};
            color: #fff;
            border: none;
            border-radius: 6px;
            padding: 6px 10px;
            cursor: pointer;
            box-shadow: 0 14px 40px rgba(15, 23, 42, 0.35);
            transition: transform 0.2s ease, filter 0.2s ease;
          }
          .toggle-btn:hover {
            filter: brightness(1.15);
            transform: translateY(-1px);
          }

          .menu-card {
            padding: 12px;
            border-radius: 10px;
            background: #f9fafb;
            border: 1px solid rgba(148, 163, 184, 0.25);
            box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
          }
          .menu-card img {
            width: 100%;
            border-radius: 8px;
            margin-bottom: 8px;
          }
          .menu-card h3 {
            margin: 4px 0;
            font-size: 16px;
          }
          .menu-card p {
            font-size: 14px;
            color: #4b5563;
            margin: 4px 0 0;
          }
          .menu-card button {
            margin-top: 10px;
            background: ${style?.buttonColor ?? bgColor};
            color: #fff;
            border: none;
            border-radius: 6px;
            padding: 6px 10px;
            cursor: pointer;
          }
          .menu-card button:hover {
            filter: brightness(1.15);
          }
        `}
        </style>

        <div style={outerStyle}>
          <div style={mapWrapperStyle}>
            <div ref={mapRef} style={mapCanvasStyle} />
            <div id="map-overlay" style={mapOverlayStyle} />
          </div>

          {listAlwaysVisible && showList ? (
            <div style={listContainerPinnedStyle}>{listContent}</div>
          ) : null}

          {!listAlwaysVisible && showList ? (
            <>
              <button
                className="toggle-btn"
                style={toggleButtonStyle}
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                {menuOpen ? '✕' : '☰'}
              </button>
              <div style={popupStyle}>{listContent}</div>
            </>
          ) : null}
        </div>
      </>
    );
  },
  () => true,
);

