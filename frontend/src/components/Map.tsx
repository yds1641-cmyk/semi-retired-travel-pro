'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// ✅ selectedId가 정의되지 않았다는 에러를 막기 위해 타입을 정확히 지정합니다.
export default function Map({ deals, selectedId }: { deals: any[], selectedId: string | null }) {
    return (
        <div className="absolute inset-0 w-full h-full">
            <MapContainer center={[30, 110]} zoom={3} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                {deals?.map((deal: any) => (
                    <Marker key={deal.id} position={[deal.lat, deal.lng]} icon={icon}>
                        <Popup>
                            <div className="text-slate-900 font-bold text-xs">{deal.title}</div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}