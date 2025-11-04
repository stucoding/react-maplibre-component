import React from 'react'

export type LatLng = { lat: number; lng: number }

export type DemoMarker = {
  id: string
  position: LatLng
  label?: string
}

export interface MapDemoProps {
  center?: LatLng
  zoom?: number
  markers?: DemoMarker[]
  onMarkerClick?: (marker: DemoMarker) => void
  title?: string
  enableInteraction?: boolean
}

const containerStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  borderRadius: 8,
  padding: 12,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
}

const pillStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '4px 8px',
  borderRadius: 9999,
  background: '#eef2ff',
  color: '#3730a3',
  fontSize: 12,
}

const listItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '6px 8px',
  border: '1px solid #eee',
  borderRadius: 6,
  cursor: 'pointer',
}

export default function MapDemo(props: MapDemoProps) {
  const { center, zoom = 3, markers = [], onMarkerClick, title, enableInteraction = true } = props

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <strong>{title ?? 'Map Demo'}</strong>
        <span style={pillStyle}>zoom {zoom}</span>
        {center ? (
          <span style={pillStyle}>
            center {center.lat.toFixed(3)}, {center.lng.toFixed(3)}
          </span>
        ) : (
          <span style={pillStyle}>no center</span>
        )}
        <span style={pillStyle}>{enableInteraction ? 'interactive' : 'static'}</span>
      </div>

      <div
        style={{
          height: 220,
          border: '1px dashed #ddd',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          background: 'repeating-conic-gradient(#f3f4f6 0% 25%, #ffffff 0% 50%) 50% / 20px 20px',
        }}
      >
        Map canvas placeholder
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <strong>Markers ({markers.length})</strong>
        {markers.length === 0 && <span style={{ color: '#9ca3af' }}>No markers</span>}
        {markers.map((m) => (
          <div
            key={m.id}
            style={listItemStyle}
            onClick={() => enableInteraction && onMarkerClick?.(m)}
            role={enableInteraction ? 'button' : undefined}
          >
            <span>
              {m.label ?? m.id} → {m.position.lat.toFixed(3)}, {m.position.lng.toFixed(3)}
            </span>
            {enableInteraction && <span style={{ color: '#3b82f6' }}>Click</span>}
          </div>
        ))}
      </div>
    </div>
  )
}


