import React, { useRef, useEffect, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import axios from "axios";

const Map = ({ checkedLayers = [] }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng] = useState(99.0173);
    const [lat] = useState(18.5762);
    const [zoom] = useState(14);
    const layerSourcesRef = useRef(new Set());

    useEffect(() => {
        if (map.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: {
                    osm: {
                        type: "raster",
                        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                        tileSize: 256,
                        attribution: "&copy; OpenStreetMap Contributors",
                    },
                    "google-road": {
                        type: "raster",
                        tiles: [
                            "https://mt0.google.com/vt/lyrs=r&x={x}&y={y}&z={z}",
                            "https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}",
                        ],
                        tileSize: 256,
                    },
                    "google-hybrid": {
                        type: "raster",
                        tiles: [
                            "https://mt0.google.com/vt/lyrs=y,m&x={x}&y={y}&z={z}",
                            "https://mt1.google.com/vt/lyrs=y,m&x={x}&y={y}&z={z}",
                        ],
                        tileSize: 256,
                    },
                },
                layers: [
                    {
                        id: "google-road",
                        type: "raster",
                        source: "google-road",
                        minzoom: 0,
                        maxzoom: 20,
                    },
                ],
            },
            center: [lng, lat],
            zoom: zoom,
        });

        map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    }, [lng, lat, zoom]);

    // Handle layer changes
    useEffect(() => {
        if (!map.current) return;

        const loadLayers = async () => {
            // Remove unchecked layers
            layerSourcesRef.current.forEach((sourceId) => {
                if (!checkedLayers.some((l) => `layer-${l.formid}` === sourceId)) {
                    if (map.current.getLayer(sourceId)) {
                        map.current.removeLayer(sourceId);
                    }
                    if (map.current.getSource(sourceId)) {
                        map.current.removeSource(sourceId);
                    }
                    layerSourcesRef.current.delete(sourceId);
                }
            });

            // Add checked layers
            for (const layer of checkedLayers) {
                const sourceId = `layer-${layer.formid}`;
                if (layerSourcesRef.current.has(sourceId)) continue;

                try {
                    const response = await axios.post("/api/load_layer", {
                        formid: layer.formid,
                    });
                    const data = response.data;

                    if (data && data.length > 0) {
                        const features = data
                            .filter((item) => item.geojson)
                            .map((item) => {
                                try {
                                    const geometry = JSON.parse(item.geojson);
                                    return {
                                        type: "Feature",
                                        properties: { id: item.id },
                                        geometry: geometry,
                                    };
                                } catch {
                                    return null;
                                }
                            })
                            .filter(Boolean);

                        const geojson = {
                            type: "FeatureCollection",
                            features: features,
                        };

                        map.current.addSource(sourceId, {
                            type: "geojson",
                            data: geojson,
                        });

                        if (layer.layertype === "point") {
                            map.current.addLayer({
                                id: sourceId,
                                type: "circle",
                                source: sourceId,
                                paint: {
                                    "circle-radius": 6,
                                    "circle-color": "#ff6b35",
                                    "circle-stroke-width": 2,
                                    "circle-stroke-color": "#ffffff",
                                },
                            });
                        } else if (layer.layertype === "linestring") {
                            map.current.addLayer({
                                id: sourceId,
                                type: "line",
                                source: sourceId,
                                paint: {
                                    "line-color": "#3388ff",
                                    "line-width": 3,
                                },
                            });
                        } else {
                            map.current.addLayer({
                                id: sourceId,
                                type: "fill",
                                source: sourceId,
                                paint: {
                                    "fill-color": "#3388ff",
                                    "fill-opacity": 0.5,
                                },
                            });
                            map.current.addLayer({
                                id: `${sourceId}-outline`,
                                type: "line",
                                source: sourceId,
                                paint: {
                                    "line-color": "#3388ff",
                                    "line-width": 2,
                                },
                            });
                        }

                        layerSourcesRef.current.add(sourceId);
                    }
                } catch (error) {
                    console.error(`Failed to load layer ${layer.formid}:`, error);
                }
            }
        };

        loadLayers();
    }, [checkedLayers]);

    return (
        <div className="relative w-full h-full">
            <div ref={mapContainer} className="absolute inset-0" />
        </div>
    );
};

export default Map;
