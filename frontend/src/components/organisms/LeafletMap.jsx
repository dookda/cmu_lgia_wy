import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const LeafletMap = ({ checkedLayers, onFeatureClick, enableWeatherLayers = true }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const layersRef = useRef({});
    const [radarLayers, setRadarLayers] = useState([]);

    useEffect(() => {
        if (!mapInstance.current) {
            // Initialize map
            mapInstance.current = L.map(mapRef.current).setView([18.5762, 99.0173], 15);

            // Base maps
            const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            });

            const googleRoad = L.tileLayer("https://{s}.google.com/vt/lyrs=r&x={x}&y={y}&z={z}", {
                maxZoom: 20,
                subdomains: ["mt0", "mt1", "mt2", "mt3"],
            });

            const googleHybrid = L.tileLayer("https://{s}.google.com/vt/lyrs=y,m&x={x}&y={y}&z={z}", {
                maxZoom: 20,
                subdomains: ["mt0", "mt1", "mt2", "mt3"],
            });

            const baseMaps = {
                "แผนที่ OSM": osm,
                "แผนที่ถนน": googleRoad,
                "แผนที่ภาพถ่าย": googleHybrid,
            };

            googleRoad.addTo(mapInstance.current);

            // Overlay layers
            const overlayMaps = {};

            // Weather radar (if enabled)
            if (enableWeatherLayers) {
                loadWeatherRadar();
                loadHotspotLayer();
                loadAQILayer();
            }

            L.control.layers(baseMaps, overlayMaps).addTo(mapInstance.current);
        }

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // Load weather radar
    const loadWeatherRadar = async () => {
        try {
            const response = await fetch("https://api.rainviewer.com/public/weather-maps.json");
            const data = await response.json();

            if (data.radar && data.radar.past) {
                const radarLayerGroup = L.layerGroup();
                const lastFrame = data.radar.past[data.radar.past.length - 1];

                if (lastFrame) {
                    const radarTileLayer = L.tileLayer(
                        `${data.host}${lastFrame.path}/256/{z}/{x}/{y}/2/1_1.png`,
                        {
                            opacity: 0.6,
                            zIndex: 1000,
                        }
                    );
                    radarLayerGroup.addLayer(radarTileLayer);
                }

                radarLayerGroup.addTo(mapInstance.current);
                layersRef.current["weather-radar"] = radarLayerGroup;
            }
        } catch (error) {
            console.error("Failed to load weather radar:", error);
        }
    };

    // Load hotspot layer
    const loadHotspotLayer = async () => {
        try {
            const response = await fetch(
                "https://firms.modaps.eosdis.nasa.gov/mapserver/wfs/SouthEast_Asia/c56f7d70bc06160e3c443a592fd9c87e/?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAME=ms:fires_snpp_24hrs&STARTINDEX=0&COUNT=5000&SRSNAME=urn:ogc:def:crs:EPSG::4326&BBOX=5,96,22,107,urn:ogc:def:crs:EPSG::4326&outputformat=geojson"
            );
            const data = await response.json();

            const hotspotLayer = L.geoJSON(data, {
                pointToLayer: (feature, latlng) => {
                    return L.circleMarker(latlng, {
                        radius: 5,
                        fillColor: "#ff5100",
                        color: "#a60b00",
                        weight: 0,
                        opacity: 1,
                        fillOpacity: 0.7,
                    });
                },
                onEachFeature: (feature, layer) => {
                    if (feature.properties) {
                        layer.bindPopup(`
                            <b>ตำแหน่งจุดความร้อน</b><br/>
                            ข้อมูลจาก VIIRS<br/>
                            ตำแหน่งที่พบ: ${feature.properties.latitude}, ${feature.properties.longitude}<br/>
                            ค่า Brightness temperature: ${feature.properties.brightness} Kelvin<br/>
                            วันที่: ${feature.properties.acq_datetime} UTC
                        `);
                    }
                },
            });

            hotspotLayer.addTo(mapInstance.current);
            layersRef.current["hotspot"] = hotspotLayer;
        } catch (error) {
            console.error("Failed to load hotspot layer:", error);
        }
    };

    // Load AQI layer
    const loadAQILayer = async () => {
        try {
            const token = "2b9b7d19f47c41ab2f58a00c0f61315f7a0c5926";
            const response = await fetch(
                `https://api.waqi.info/v2/map/bounds?latlng=5.5,96.5,21,106&networks=all&token=${token}`
            );
            const data = await response.json();

            if (data.status === "ok") {
                const aqiLayer = L.layerGroup();

                data.data.forEach((station) => {
                    const { lat, lon, aqi, station: { name } } = station;

                    let color;
                    if (aqi <= 25) color = "#0000ff";
                    else if (aqi <= 50) color = "#00ff00";
                    else if (aqi <= 100) color = "#ffff00";
                    else if (aqi <= 200) color = "#ff8800";
                    else color = "#ff0000";

                    const marker = L.circleMarker([lat, lon], {
                        radius: 8,
                        fillColor: color,
                        color: "#fff",
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.8,
                    });

                    marker.bindPopup(`<b>${name}</b><br>AQI: ${aqi}`);
                    aqiLayer.addLayer(marker);
                });

                aqiLayer.addTo(mapInstance.current);
                layersRef.current["aqi"] = aqiLayer;
            }
        } catch (error) {
            console.error("Failed to load AQI layer:", error);
        }
    };

    // Handle layer changes
    useEffect(() => {
        if (!mapInstance.current) return;

        // Remove unchecked layers
        Object.keys(layersRef.current).forEach((key) => {
            if (
                !key.startsWith("weather-") &&
                !key.startsWith("hotspot") &&
                !key.startsWith("aqi") &&
                !checkedLayers.some((l) => `layer-${l.formid}` === key)
            ) {
                mapInstance.current.removeLayer(layersRef.current[key]);
                delete layersRef.current[key];
            }
        });

        // Add checked layers
        checkedLayers.forEach(async (layer) => {
            const layerKey = `layer-${layer.formid}`;
            if (layersRef.current[layerKey]) return;

            try {
                const response = await fetch("/api/load_layer", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ formid: layer.formid }),
                });
                const data = await response.json();

                if (data && data.length > 0) {
                    const features = data
                        .filter((item) => item.geojson)
                        .map((item) => {
                            try {
                                const geometry = JSON.parse(item.geojson);
                                let style = null;
                                try {
                                    style = item.style ? JSON.parse(item.style) : null;
                                } catch (e) {
                                    console.log("No style for feature");
                                }

                                return {
                                    type: "Feature",
                                    properties: {
                                        ...item,
                                        id: item.id,
                                        formid: layer.formid,
                                        style: style,
                                    },
                                    geometry: geometry,
                                };
                            } catch (e) {
                                return null;
                            }
                        })
                        .filter(Boolean);

                    const geoJsonLayer = L.geoJSON(features, {
                        pointToLayer: (feature, latlng) => {
                            const style = feature.properties.style;
                            if (style && style.markerType === "markercircle") {
                                return L.circleMarker(latlng, {
                                    radius: style.radius || 6,
                                    fillColor: style.fillColor || "#ff6b35",
                                    color: style.color || "#ffffff",
                                    weight: style.weight || 2,
                                    opacity: 1,
                                    fillOpacity: style.fillOpacity || 0.7,
                                });
                            }
                            return L.marker(latlng);
                        },
                        style: (feature) => {
                            const style = feature.properties.style;
                            if (layer.layertype === "linestring") {
                                return {
                                    color: style?.color || "#3388ff",
                                    weight: style?.weight || 3,
                                    opacity: style?.opacity || 1,
                                    dashArray: style?.dashArray || "",
                                };
                            } else if (layer.layertype === "polygon") {
                                return {
                                    color: style?.color || "#3388ff",
                                    fillColor: style?.fillColor || "#3388ff",
                                    weight: style?.weight || 2,
                                    opacity: 1,
                                    fillOpacity: style?.fillOpacity || 0.5,
                                    dashArray: style?.dashArray || "",
                                };
                            }
                            return {};
                        },
                        onEachFeature: (feature, layer) => {
                            layer.on("click", () => {
                                if (onFeatureClick) {
                                    onFeatureClick(feature.properties.formid, feature.properties.id);
                                }
                            });
                        },
                    });

                    geoJsonLayer.addTo(mapInstance.current);
                    layersRef.current[layerKey] = geoJsonLayer;

                    // Fit bounds to show all features
                    if (geoJsonLayer.getBounds().isValid()) {
                        mapInstance.current.fitBounds(geoJsonLayer.getBounds());
                    }
                }
            } catch (error) {
                console.error(`Failed to load layer ${layer.formid}:`, error);
            }
        });
    }, [checkedLayers, onFeatureClick]);

    return <div ref={mapRef} className="w-full h-full" />;
};

export default LeafletMap;
