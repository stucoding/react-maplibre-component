//import * as React from 'react';
import { addPropertyControls, ControlType } from 'framer';
import { MapTiler3DMap} from '../components/MapComponent';

// Make it configurable in Framer’s right sidebar
addPropertyControls(MapTiler3DMap, {
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
  mapName: {
    type: ControlType.Enum,
    title: 'Map Style',
    options: ['hybrid', 'outdoor', 'winter', 'satellite', 'landscape-v4', 'dataviz'],
    optionTitles: ['Hybrid', 'Outdoor', 'Winter', 'Satellite', 'Landscape', 'Data Viz'],
  },
  rotating: {
    type: ControlType.Boolean,
    title: 'Rotation',
  },
  bgColor: {
    type: ControlType.Color,
    title: 'Button Color',
  },
});
