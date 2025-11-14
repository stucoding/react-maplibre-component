// @ts-ignore - framer module is provided by Framer at runtime
import { addPropertyControls, ControlType } from 'framer';
// @ts-ignore - framer module is provided by Framer at runtime
import {
  MapTiler3DMap,
  type MapPoint,
  type MapCameraConfig,
  type MapTerrainConfig,
  type MapRotationConfig,
  type MapAnimationConfig,
  type MapStyleConfig,
  type MapUIConfig,
  type MapMarkerConfig,
  type MapLibreConfig,
} from '../components/MapComponent';

type MapOptionsControl = Partial<{
  mapName: string;
  rotating: boolean;
  bgColor: string;
}>;

type CameraOptionsControl = Partial<{
  centerLng: number;
  centerLat: number;
  zoom: number;
  pitch: number;
  bearing: number;
}>;

type TerrainOptionsControl = Partial<{
  enabled: boolean;
  exaggeration: number;
  source: string;
}>;

type RotationOptionsControl = Partial<{
  speed: number;
  stepDuration: number;
  initialBearing: number;
  zoomLevel: number;
}>;

type AnimationOptionsControl = Partial<{
  flyToDuration: number;
  rotationStep: number;
  zoomLevel: number;
}>;

type StyleOptionsControl = Partial<{
  bgColor: string;
  buttonColor: string;
  popupBgColor: string;
  popupTextColor: string;
}>;

type UiOptionsControl = Partial<{
  showNavigation: boolean;
  showFullscreen: boolean;
  showSidebar: boolean;
  sidebarWidth: number;
  listAlwaysVisible: boolean;
  locationListAlign: 'left' | 'right';
  listSize: number;
}>;

type MarkerOptionsControl = Partial<{
  width: number;
  height: number;
}>;

type MapLibreOptionsControl = Partial<{
  version: string;
  scriptUrl: string;
  cssUrl: string;
}>;

// Wrapper component for Framer compatibility
function FramerMapTiler3DMap(props: {
  apiKey?: string;
  points?: MapPoint[];
  mapOptions?: MapOptionsControl;
  cameraOptions?: CameraOptionsControl;
  terrainOptions?: TerrainOptionsControl;
  rotationOptions?: RotationOptionsControl;
  animationOptions?: AnimationOptionsControl;
  styleOptions?: StyleOptionsControl;
  uiOptions?: UiOptionsControl;
  markerOptions?: MarkerOptionsControl;
  mapLibreOptions?: MapLibreOptionsControl;
}) {
  // Defaults defined inline
  const apiKey = props.apiKey || 'ltzFbUmxmYsIaKJ0ybNR';
  const points = props.points || [];
  const mapOptions = {
    mapName: 'outdoor',
    rotating: false,
    bgColor: '#333',
    ...(props.mapOptions ?? {}),
  };

  const cameraOptions = props.cameraOptions ?? {};
  const camera: MapCameraConfig = {
    center: [
      cameraOptions.centerLng ?? 8.763649918607726,
      cameraOptions.centerLat ?? 46.68006894117724,
    ],
    zoom: cameraOptions.zoom ?? 12,
    pitch: cameraOptions.pitch ?? 50,
    bearing: cameraOptions.bearing ?? -90,
  };

  const terrainOptions = props.terrainOptions ?? {};
  const terrain: MapTerrainConfig = {
    enabled: terrainOptions.enabled ?? true,
    exaggeration: terrainOptions.exaggeration ?? 1.5,
    source: terrainOptions.source ?? 'terrainSource',
  };

  const rotationOptions = props.rotationOptions ?? {};
  const rotation: MapRotationConfig = {
    enabled: mapOptions.rotating,
    speed: rotationOptions.speed ?? 30,
    stepDuration: rotationOptions.stepDuration ?? 12000,
    initialBearing: rotationOptions.initialBearing ?? -90,
    ...(rotationOptions.zoomLevel !== undefined && { zoomLevel: rotationOptions.zoomLevel }),
  };

  const animationOptions = props.animationOptions ?? {};
  const animation: MapAnimationConfig = {
    flyToDuration: animationOptions.flyToDuration ?? 2400,
    rotationStep: animationOptions.rotationStep ?? 30,
    zoomLevel: animationOptions.zoomLevel ?? 16,
  };

  const styleOptions = props.styleOptions ?? {};
  const style: MapStyleConfig = {
    bgColor: styleOptions.bgColor,
    buttonColor: styleOptions.buttonColor,
    popupBgColor: styleOptions.popupBgColor,
    popupTextColor: styleOptions.popupTextColor,
  };

  const uiOptions = props.uiOptions ?? {};
  const ui: MapUIConfig = {
    showNavigation: uiOptions.showNavigation ?? true,
    showFullscreen: uiOptions.showFullscreen ?? false,
    showSidebar: uiOptions.showSidebar ?? true,
    sidebarWidth: uiOptions.sidebarWidth ?? 300,
    listAlwaysVisible: uiOptions.listAlwaysVisible ?? false,
    locationListAlign: uiOptions.locationListAlign ?? 'left',
    listSize: uiOptions.listSize ?? 320,
  };

  const markerOptions = props.markerOptions ?? {};
  const marker: MapMarkerConfig = {
    width: markerOptions.width ?? 20,
    height: markerOptions.height ?? 20,
  };

  const mapLibreOptions = props.mapLibreOptions ?? {};
  const version = mapLibreOptions.version ?? '3.6.2';
  const mapLibre: MapLibreConfig = {
    version,
    scriptUrl: mapLibreOptions.scriptUrl && mapLibreOptions.scriptUrl.trim() 
      ? mapLibreOptions.scriptUrl 
      : undefined,
    cssUrl: mapLibreOptions.cssUrl && mapLibreOptions.cssUrl.trim() 
      ? mapLibreOptions.cssUrl 
      : undefined,
  };

  if (!apiKey) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
        Please provide a MapTiler API Key
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MapTiler3DMap
        apiKey={apiKey}
        points={points}
        mapName={mapOptions.mapName}
        rotating={mapOptions.rotating}
        bgColor={mapOptions.bgColor}
        camera={camera}
        terrain={terrain}
        rotation={rotation}
        animation={animation}
        style={style}
        ui={ui}
        marker={marker}
        mapLibre={mapLibre}
      />
    </div>
  );
}

// Make it configurable in Framer's right sidebar
addPropertyControls(FramerMapTiler3DMap, {
  apiKey: {
    type: ControlType.String,
    title: 'MapTiler API Key',
    defaultValue: 'ltzFbUmxmYsIaKJ0ybNR',
  },
  points: {
    type: ControlType.Array,
    title: 'Locations',
    control: {
      type: ControlType.Object,
      controls: {
        title: { type: ControlType.String, title: 'Name' },
        lat: { type: ControlType.Number, title: 'Latitude' },
        lng: { type: ControlType.Number, title: 'Longitude' },
        pin: { type: ControlType.Image, title: 'Pin Icon' },
        image: { type: ControlType.Image, title: 'Image' },
        url: { type: ControlType.String, title: 'URL' },
        infoText: { type: ControlType.String, title: 'Info text' },
      },
    },
  },
  mapOptions: {
    type: ControlType.Object,
    title: 'Map Behaviour',
    controls: {
      mapName: {
        type: ControlType.Enum,
        title: 'Map Style',
        options: ['hybrid', 'outdoor', 'winter', 'winter-v2', 'outdoor-v2', 'satellite', 'landscape-v4', 'dataviz'],
        optionTitles: ['Hybrid', 'Outdoor', 'Winter', 'Winter v2', 'Outdoor v2', 'Satellite', 'Landscape', 'Data Viz'],
        defaultValue: 'outdoor',
      },
      rotating: {
        type: ControlType.Boolean,
        title: 'Rotation',
        defaultValue: false,
      },
      bgColor: {
        type: ControlType.Color,
        title: 'Button Color',
        defaultValue: '#333',
      },
    },
  },
  cameraOptions: {
    type: ControlType.Object,
    title: 'Camera',
    controls: {
      centerLng: {
        type: ControlType.Number,
        title: 'Center Longitude',
        defaultValue: 8.763649918607726,
        step: 0.0001,
      },
      centerLat: {
        type: ControlType.Number,
        title: 'Center Latitude',
        defaultValue: 46.68006894117724,
        step: 0.0001,
      },
      zoom: {
        type: ControlType.Number,
        title: 'Zoom',
        defaultValue: 12,
        min: 0,
        max: 22,
        displayStepper: true,
      },
      pitch: {
        type: ControlType.Number,
        title: 'Pitch',
        defaultValue: 50,
        min: 0,
        max: 85,
        displayStepper: true,
      },
      bearing: {
        type: ControlType.Number,
        title: 'Bearing',
        defaultValue: -90,
        min: -180,
        max: 180,
        displayStepper: true,
      },
    },
  },
  terrainOptions: {
    type: ControlType.Object,
    title: 'Terrain',
    controls: {
      enabled: {
        type: ControlType.Boolean,
        title: 'Enabled',
        defaultValue: true,
      },
      exaggeration: {
        type: ControlType.Number,
        title: 'Exaggeration',
        defaultValue: 1.5,
        min: 0,
        max: 10,
        step: 0.1,
      },
      source: {
        type: ControlType.String,
        title: 'Source ID',
        defaultValue: 'terrainSource',
      },
    },
  },
  rotationOptions: {
    type: ControlType.Object,
    title: 'Rotation Settings',
    controls: {
      speed: {
        type: ControlType.Number,
        title: 'Speed (deg)',
        defaultValue: 30,
        min: 1,
        max: 180,
        displayStepper: true,
      },
      stepDuration: {
        type: ControlType.Number,
        title: 'Step Duration (ms)',
        defaultValue: 12000,
        min: 100,
        max: 60000,
        displayStepper: true,
      },
      initialBearing: {
        type: ControlType.Number,
        title: 'Initial Bearing',
        defaultValue: -90,
        min: -180,
        max: 180,
        displayStepper: true,
      },
      zoomLevel: {
        type: ControlType.Number,
        title: 'Rotation Zoom',
        min: 0,
        max: 22,
        displayStepper: true,
      },
    },
  },
  animationOptions: {
    type: ControlType.Object,
    title: 'Animation',
    controls: {
      flyToDuration: {
        type: ControlType.Number,
        title: 'FlyTo Duration (ms)',
        defaultValue: 2400,
        min: 100,
        max: 20000,
        displayStepper: true,
      },
      rotationStep: {
        type: ControlType.Number,
        title: 'Rotation Step (deg)',
        defaultValue: 30,
        min: 1,
        max: 180,
        displayStepper: true,
      },
      zoomLevel: {
        type: ControlType.Number,
        title: 'FlyTo Zoom',
        defaultValue: 16,
        min: 0,
        max: 22,
        displayStepper: true,
      },
    },
  },
  styleOptions: {
    type: ControlType.Object,
    title: 'Style Overrides',
    controls: {
      bgColor: {
        type: ControlType.Color,
        title: 'Overlay Background',
      },
      buttonColor: {
        type: ControlType.Color,
        title: 'Sidebar Button',
      },
      popupBgColor: {
        type: ControlType.Color,
        title: 'Popup Background',
      },
      popupTextColor: {
        type: ControlType.Color,
        title: 'Popup Text',
      },
    },
  },
  uiOptions: {
    type: ControlType.Object,
    title: 'UI Controls',
    controls: {
      showNavigation: {
        type: ControlType.Boolean,
        title: 'Navigation Control',
        defaultValue: true,
      },
      showFullscreen: {
        type: ControlType.Boolean,
        title: 'Fullscreen Control',
        defaultValue: false,
      },
      showSidebar: {
        type: ControlType.Boolean,
        title: 'Enable List',
        defaultValue: true,
      },
      sidebarWidth: {
        type: ControlType.Number,
        title: 'Sidebar Width (px)',
        defaultValue: 300,
        min: 160,
        max: 800,
        displayStepper: true,
      },
      listAlwaysVisible: {
        type: ControlType.Boolean,
        title: 'List Always Visible',
        defaultValue: false,
      },
      locationListAlign: {
        type: ControlType.Enum,
        title: 'List Alignment',
        options: ['left', 'right'],
        optionTitles: ['Left', 'Right'],
        defaultValue: 'left',
      },
      listSize: {
        type: ControlType.Number,
        title: 'List Size (px)',
        defaultValue: 320,
        min: 160,
        max: 800,
        displayStepper: true,
      },
    },
  },
  markerOptions: {
    type: ControlType.Object,
    title: 'Marker',
    controls: {
      width: {
        type: ControlType.Number,
        title: 'Marker Width',
        defaultValue: 20,
        min: 4,
        max: 128,
        displayStepper: true,
      },
      height: {
        type: ControlType.Number,
        title: 'Marker Height',
        defaultValue: 20,
        min: 4,
        max: 128,
        displayStepper: true,
      },
    },
  },
  mapLibreOptions: {
    type: ControlType.Object,
    title: 'MapLibre',
    controls: {
      version: {
        type: ControlType.String,
        title: 'Version',
        defaultValue: '3.6.2',
      },
      scriptUrl: {
        type: ControlType.String,
        title: 'Script URL',
      },
      cssUrl: {
        type: ControlType.String,
        title: 'CSS URL',
      },
    },
  },
});

// Export as default for Framer
export default FramerMapTiler3DMap;
