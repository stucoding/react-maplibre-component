import { MapTiler3DMap, type MapPoint } from './components/MapComponent'
import './App.css'

function App() {
  // Sample map points for testing
  const samplePoints: MapPoint[] = [
    {
      id: '1',
      lat: 46.68006894117724,
      lng: 8.763649918607726,
      title: 'Swiss Alps',
      infoText: 'Beautiful mountain view in the Swiss Alps',
      pin: 'https://api.maptiler.com/maps/dataviz/markers/pin-1.png',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    },
    {
      id: '2',
      lat: 46.51,
      lng: 9.01,
      title: 'Swiss Valley',
      infoText: 'Scenic valley location',
      pin: 'https://api.maptiler.com/maps/dataviz/markers/pin-2.png',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    },
  ]

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <MapTiler3DMap
        apiKey="ltzFbUmxmYsIaKJ0ybNR"
        points={samplePoints}
        mapName="outdoor"
        rotating={true}
        bgColor="#3b82f6"
        camera={{
          center: [8.763649918607726, 46.68006894117724],
          zoom: 12,
          pitch: 50,
          bearing: -90,
        }}
        onMarkerClick={(point, index) => {
          console.log('Marker clicked:', point, index)
        }}
        onMapReady={() => {
          console.log('Map is ready!')
        }}
      />
    </div>
  )
}

export default App
