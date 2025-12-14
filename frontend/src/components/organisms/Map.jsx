import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const Map = () => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng] = useState(99.0173);
    const [lat] = useState(18.5762);
    const [zoom] = useState(14);

    useEffect(() => {
        if (map.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: {
                    'osm': {
                        type: 'raster',
                        tiles: [
                            'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
                        ],
                        tileSize: 256,
                        attribution: '&copy; OpenStreetMap Contributors',
                    }
                },
                layers: [
                    {
                        id: 'osm',
                        type: 'raster',
                        source: 'osm',
                        minzoom: 0,
                        maxzoom: 19
                    }
                ]
            },
            center: [lng, lat],
            zoom: zoom
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    }, [lng, lat, zoom]);

    return (
        <div className="relative w-full h-full min-h-[500px] h-screen bg-gray-100">
            <div ref={mapContainer} className="absolute inset-0" />
        </div>
    );
};

export default Map;
