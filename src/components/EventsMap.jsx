import { useEffect } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

function Recenter({ location }) {
  const map = useMap()
  useEffect(() => {
    const centers = { Todos: [-13.2, -75], Lima: [-12.08, -77.04], Cusco: [-13.52, -71.97], Arequipa: [-16.4, -71.54], 'La Libertad': [-8.11, -79.03] }
    map.flyTo(centers[location] || centers.Todos, location === 'Todos' ? 5 : 11, { duration: 0.7 })
  }, [location, map])
  return null
}

export default function EventsMap({ events, location, onOpen }) {
  return <div className="map-wrap"><MapContainer center={[-12.08, -77.04]} zoom={5} scrollWheelZoom={false} zoomControl={false}><TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><Recenter location={location} />{events.filter((event) => event.lat).map((event) => <CircleMarker key={event.id} center={[event.lat, event.lng]} pathOptions={{ color: '#f06f55', fillColor: '#f06f55', fillOpacity: 0.9 }} radius={9}><Popup><strong>{event.title}</strong><br />{event.venue}<br /><button className="map-popup-button" onClick={() => onOpen(event)}>Ver detalle</button></Popup></CircleMarker>)}</MapContainer><div className="map-caption">{events.length} planes en el mapa <span>Arrastra para explorar</span></div></div>
}
