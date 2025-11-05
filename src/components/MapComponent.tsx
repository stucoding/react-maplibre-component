import * as React from 'react';
import { renderToString } from 'react-dom/server';
import type { MapLibreMap } from 'maplibre-gl';

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
}

export interface MapAnimationConfig {
  flyToDuration?: number; // ms
  rotationStep?: number; // degrees
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
      flyToDuration: 1200,
      rotationStep: 30,
      ...animation,
    };

    const uiConfig: MapUIConfig = {
      showNavigation: true,
      showFullscreen: true,
      showSidebar: true,
      sidebarWidth: 300,
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
      scriptUrl:
        mapLibre?.scriptUrl ?? `https://unpkg.com/maplibre-gl@${version}/dist/maplibre-gl.js`,
      cssUrl: mapLibre?.cssUrl ?? `https://unpkg.com/maplibre-gl@${version}/dist/maplibre-gl.css`,
    };

    const [menuOpen, setMenuOpen] = React.useState(false);
    const [ready, setReady] = React.useState(false);

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
        const map = new maplibregl.Map({
          container: mapRef.current!,
          style: `https://api.maptiler.com/maps/${mapName}/style.json?key=${apiKey}`,
          center: cameraConfig.center,
          zoom: cameraConfig.zoom,
          pitch: cameraConfig.pitch,
          bearing: cameraConfig.bearing,
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

          // 💡 Optional: Fullscreen toggle
          if (uiConfig.showFullscreen) {
            map.addControl(new maplibregl.FullscreenControl(), 'top-left');
          }

          // Add markers from Framer UI
          points.forEach((p) => {
            const el = document.createElement('div');
            const width =
              typeof markerConfig.width === 'number'
                ? `${markerConfig.width}px`
                : (markerConfig.width ?? '20px');
            const height =
              typeof markerConfig.height === 'number'
                ? `${markerConfig.height}px`
                : (markerConfig.height ?? '20px');
            el.style.width = width;
            el.style.height = height;
            el.style.backgroundImage = `url(${p.pin})`;
            el.style.backgroundSize = 'contain';
            el.style.backgroundRepeat = 'no-repeat';
            el.style.transformOrigin = 'center';
            //el.style.transition = "transform 0.2s ease-out"

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
          isRotating.current = rotationConfig.enabled ?? false;

          let bearing = rotationConfig.initialBearing ?? -90;
          const step = () => {
            if (!isRotating.current) return;
            bearing = (bearing + (animationConfig.rotationStep ?? 30)) % 360;
            map.easeTo({
              center: cameraConfig.center,
              bearing,
              duration: rotationConfig.stepDuration ?? 12000,
              easing: (t: number) => t, // linear easing
              essential: true,
            });

            rotationTimeout.current = setTimeout(step, rotationConfig.stepDuration ?? 12000);
          };
          step();
        }
      }

      return () => {
        const scriptTag = document.querySelector('script[src*="maplibre-gl"]');
        if (scriptTag) scriptTag.remove();
        if (rotationTimeout.current) {
          clearTimeout(rotationTimeout.current);
        }
        if (mapObj.current) mapObj.current.remove();
      };
    }, []);

    // Function to zoom the map to a point
    // Function to fly and open popup
    const handleViewPoint = (p: MapPoint, i: number) => {
      if (!mapObj.current) return;

      // fly to marker
      mapObj.current.flyTo({
        center: [p.lng, p.lat],
        zoom: 14,
        duration: animationConfig.flyToDuration ?? 1200,
      });

      // open popup after flyTo
      setTimeout(
        () => {
          // Note: markersRef would need to be created if you want to toggle popups
          // For now, we'll just call the callback
          onMarkerClick?.(p, i);
        },
        (animationConfig.flyToDuration ?? 1200) - 200,
      );

      // hide side menu
      setMenuOpen(false);
    };

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

          /* MapLibre controls */
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
          .maplibregl-ctrl-group{
            background-color: transparent !important;
            box-shadow: none !important;
          }

          /* Popup styling */
          .maplibregl-popup-content {
            background: var(--map-button-bg) !important;
            font-family: sans-serif !important;
            border-radius: 8px !important;
            padding: 8px 12px !important;
          }
          .maplibregl-popup-tip {
            border-top-color: var(--popup-bg) !important;
          }

          /* Sidebar + button */
          .side-menu {
            position: absolute;
            top: 0;
            left: 0;
            width: ${uiConfig.sidebarWidth ?? 300}px;
            height: 100%;
            background: #fff;
            box-shadow: 4px 0 12px rgba(0,0,0,0.15);
            overflow-y: auto;
            transition: transform 0.35s ease;
            z-index: 1100;
          }
          .side-menu.closed {
            transform: translateX(-100%);
          }
          .side-menu img {
            width: 100%;
            border-radius: 0.5rem;
          }
          .toggle-btn {
            position: absolute;
            top: 10px;
            left: 10px;
            z-index: 1200;
            background: ${bgColor || '#333'};
            color: white;
            border: none;
            border-radius: 6px;
            padding: 6px 10px;
            cursor: pointer;
            transition: background 0.2s ease;
          }
          .toggle-btn:hover {
            filter: brightness(1.15);
          }
          .menu-card {
            padding: 12px;
            border-bottom: 1px solid #eee;
          }
          .menu-card h3 {
            margin: 8px 0 4px;
            font-size: 16px;
          }
          .menu-card p {
            font-size: 14px;
            color: #555;
          }
          .menu-card button {
            background: ${bgColor || '#333'};
            color: #fff;
            border: none;
            border-radius: 4px;
            padding: 6px 10px;
            cursor: pointer;
            margin-top: 8px;
          }
          .menu-card button:hover {
            filter: brightness(1.2);
          }
        `}
        </style>

        {/* Map Container */}
        <div
          ref={mapRef}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '20px',
            overflow: 'hidden',
          }}
        />

        {/* Overlay loader */}
        <div
          id="map-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            background: '#f5f5f5',
            transition: 'opacity 400ms ease',
            opacity: ready ? 0 : 1,
            pointerEvents: 'none',
            borderRadius: 20,
            zIndex: 1000,
          }}
        />

        {/* Toggle button */}
        {uiConfig.showSidebar && (
          <button className="toggle-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        )}

        {/* Sidebar menu */}
        {uiConfig.showSidebar && (
          <div className={`side-menu ${menuOpen ? '' : 'closed'}`}>
            {points.map((p, i) => (
              <div key={p.id ?? i} className="menu-card">
                {p.image && <img src={p.image} alt={p.title} />}
                <h3>{p.title}</h3>
                {p.infoText && <p>{p.infoText}</p>}
                <button onClick={() => handleViewPoint(p, i)}>View</button>
              </div>
            ))}
          </div>
        )}
      </>
    );
  },
  () => true,
);
