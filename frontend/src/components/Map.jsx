import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaSchool } from 'react-icons/fa';

// Fix for default Leaflet marker icons not showing in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icon for the schools
const schoolIcon = new L.DivIcon({
    html: `<div class="school-marker-icon"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M256 32C114.6 32 0 125.1 0 240c0 47.6 19.9 91.2 52.9 126.3C38 405.7 7 439.1 6.5 439.5c-6.6 7-8.4 17.2-4.6 26S14.4 480 24 480c61.5 0 110-25.7 139.1-46.3C192 442.8 223.2 448 256 448c141.4 0 256-93.1 256-208S397.4 32 256 32zm0 368c-26.7 0-53.1-4.1-78.4-12.1l-22.7-7.2-19.5 13.8c-14.3 10.1-33.9 21.4-57.5 29 7.3-12.1 14.4-25.7 19.9-40.2l10.6-28.1-20.6-21.8C69.7 314.1 48 282.2 48 240c0-88.2 93.3-160 208-160s208 71.8 208 160-93.3 160-208 160z"></path></svg></div>`,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
});

// Component to handle map movement
const MapUpdater = ({ selectedSchool }) => {
    const map = useMap();

    React.useEffect(() => {
        if (selectedSchool) {
            map.flyTo([selectedSchool.lat, selectedSchool.lng], 15, {
                animate: true,
                duration: 1.5
            });
        }
    }, [selectedSchool, map]);

    return null;
};

const Map = ({ schools, selectedSchool, onMarkerClick }) => {
    // Center of Tokyo
    const center = [35.6895, 139.6917];
    const markerRefs = useRef({});

    useEffect(() => {
        if (selectedSchool && markerRefs.current[selectedSchool.id]) {
            markerRefs.current[selectedSchool.id].openPopup();
        }
    }, [selectedSchool]);

    return (
        <div className="map-wrapper">
            <MapContainer center={center} zoom={12} className="map-container">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater selectedSchool={selectedSchool} />
                {schools.map((school) => (
                    <Marker
                        key={school.id}
                        position={[school.lat, school.lng]}
                        ref={(ref) => {
                            if (ref) {
                                markerRefs.current[school.id] = ref;
                            }
                        }}
                        eventHandlers={{
                            click: () => onMarkerClick(school),
                        }}
                    >
                        <Popup className="school-popup">
                            <div className="popup-content">
                                <h3>{school.name}</h3>
                                <div className="popup-details">
                                    <div className="detail-row">
                                        <span className="detail-label">SAPIX偏差値:</span>
                                        <span className="detail-value deviation">{school.sapixDeviation}</span>
                                    </div>
                                    {school.nearestStation && (
                                        <div className="detail-row">
                                            <span className="detail-label">最寄り駅:</span>
                                            <span className="detail-value">{school.nearestStation} から {school.walkMinutes}分</span>
                                        </div>
                                    )}
                                    <div className="detail-row">
                                        <span className="detail-label">文化祭:</span>
                                        <span className="detail-value">{school.festivalDate}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">説明会:</span>
                                        <span className="detail-value">{school.infoSessionDate}</span>
                                    </div>
                                </div>
                                <div className="popup-actions">
                                    <a href={school.url} target="_blank" rel="noopener noreferrer" className="btn-link">
                                        公式サイトへ
                                    </a>
                                </div>
                                {school.lastUpdated && (
                                    <div className="last-updated">
                                        更新: {new Date(school.lastUpdated).toLocaleString('ja-JP')}
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default Map;
