import React, { useEffect, useRef, useState, useCallback } from "react";
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

const LeafletMap = ({ checkedLayers = [], onFeatureClick, enableWeatherLayers = true, mapRef: externalMapRef }) => {
    const mapContainerRef = useRef(null);
    const mapInstance = useRef(null);
    const userLayersRef = useRef(new Map()); // Use Map for better key management
    const weatherLayersRef = useRef({});
    const layerControlRef = useRef(null); // Track layer control to prevent duplicates
    const [isMapReady, setIsMapReady] = useState(false);

    // Create a shared canvas renderer
    const canvasRendererRef = useRef(null);

    // Initialize map once
    useEffect(() => {
        if (mapInstance.current || !mapContainerRef.current) return;

        // Use Canvas renderer for better performance with many markers
        canvasRendererRef.current = L.canvas({ padding: 0.5, tolerance: 10 });

        mapInstance.current = L.map(mapContainerRef.current, {
            renderer: canvasRendererRef.current,
            preferCanvas: true,
            zoomControl: false  // Disable default zoom control
        }).setView([18.5762, 99.0173], 15);

        // Add zoom control at bottom right
        L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

        // Base maps
        const grayMap = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
            maxZoom: 20,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd'
        });

        const googleRoad = L.tileLayer("https://{s}.google.com/vt/lyrs=r&x={x}&y={y}&z={z}", {
            maxZoom: 20,
            subdomains: ["mt0", "mt1", "mt2", "mt3"],
        });

        const googleHybrid = L.tileLayer("https://{s}.google.com/vt/lyrs=y,m&x={x}&y={y}&z={z}", {
            maxZoom: 20,
            subdomains: ["mt0", "mt1", "mt2", "mt3"],
        });

        const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap',
        });

        // Set gray map as default
        grayMap.addTo(mapInstance.current);

        // Load weather layers if enabled
        if (enableWeatherLayers) {
            loadWeatherLayers().then((overlayLayers) => {
                // Remove existing layer control if any
                if (layerControlRef.current) {
                    layerControlRef.current.remove();
                }
                // Add layer control with basemaps and overlays at top left
                layerControlRef.current = L.control.layers({
                    "แผนที่สีเทา": grayMap,
                    "แผนที่ถนน": googleRoad,
                    "แผนที่ภาพถ่าย": googleHybrid,
                    "แผนที่ OSM": osm,
                }, overlayLayers, { position: 'topleft' }).addTo(mapInstance.current);
            });
        } else {
            // Remove existing layer control if any
            if (layerControlRef.current) {
                layerControlRef.current.remove();
            }
            // Add layer control without overlays at top left
            layerControlRef.current = L.control.layers({
                "แผนที่สีเทา": grayMap,
                "แผนที่ถนน": googleRoad,
                "แผนที่ภาพถ่าย": googleHybrid,
                "แผนที่ OSM": osm,
            }, null, { position: 'topleft' }).addTo(mapInstance.current);
        }

        if (externalMapRef) {
            externalMapRef.current = mapInstance.current;
        }

        setIsMapReady(true);

        return () => {
            if (layerControlRef.current) {
                layerControlRef.current.remove();
                layerControlRef.current = null;
            }
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
                userLayersRef.current.clear();
                weatherLayersRef.current = {};
                setIsMapReady(false);
            }
        };
    }, []);

    const loadWeatherLayers = async () => {
        const overlayLayers = {};

        // Weather radar
        try {
            const response = await fetch("https://api.rainviewer.com/public/weather-maps.json");
            const data = await response.json();
            if (data.radar?.past && mapInstance.current) {
                const lastFrame = data.radar.past[data.radar.past.length - 1];
                if (lastFrame) {
                    const radarLayer = L.tileLayer(
                        `${data.host}${lastFrame.path}/256/{z}/{x}/{y}/2/1_1.png`,
                        { opacity: 0.6, zIndex: 1000 }
                    );
                    weatherLayersRef.current["radar"] = radarLayer;
                    overlayLayers["เรดาร์ฝน (Rain Radar)"] = radarLayer;
                }
            }
        } catch (e) {
            console.error("Weather radar error:", e);
        }

        // Hotspots
        try {
            const response = await fetch(
                "https://firms.modaps.eosdis.nasa.gov/mapserver/wfs/SouthEast_Asia/c56f7d70bc06160e3c443a592fd9c87e/?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAME=ms:fires_snpp_24hrs&STARTINDEX=0&COUNT=5000&SRSNAME=urn:ogc:def:crs:EPSG::4326&BBOX=5,96,22,107,urn:ogc:def:crs:EPSG::4326&outputformat=geojson"
            );
            const data = await response.json();
            if (mapInstance.current && canvasRendererRef.current) {
                const hotspotLayer = L.geoJSON(data, {
                    pointToLayer: (f, ll) => L.circleMarker(ll, {
                        radius: 5,
                        fillColor: "#ff5100",
                        color: "#a60b00",
                        weight: 0,
                        fillOpacity: 0.7,
                        renderer: canvasRendererRef.current
                    }),
                });
                weatherLayersRef.current["hotspot"] = hotspotLayer;
                overlayLayers["จุดความร้อน (Hotspots)"] = hotspotLayer;
            }
        } catch (e) {
            console.error("Hotspot error:", e);
        }

        // AQI
        try {
            const response = await fetch(
                "https://api.waqi.info/v2/map/bounds?latlng=5.5,96.5,21,106&networks=all&token=2b9b7d19f47c41ab2f58a00c0f61315f7a0c5926"
            );
            const data = await response.json();
            if (data.status === "ok" && mapInstance.current && canvasRendererRef.current) {
                const aqiLayer = L.layerGroup();
                data.data.forEach((s) => {
                    const color = s.aqi <= 25 ? "#0000ff" : s.aqi <= 50 ? "#00ff00" :
                        s.aqi <= 100 ? "#ffff00" : s.aqi <= 200 ? "#ff8800" : "#ff0000";
                    const m = L.circleMarker([s.lat, s.lon], {
                        radius: 8,
                        fillColor: color,
                        color: "#fff",
                        weight: 2,
                        fillOpacity: 0.8,
                        renderer: canvasRendererRef.current
                    });
                    m.bindPopup(`<b>${s.station.name}</b><br>AQI: ${s.aqi}`);
                    aqiLayer.addLayer(m);
                });
                weatherLayersRef.current["aqi"] = aqiLayer;
                overlayLayers["คุณภาพอากาศ (AQI)"] = aqiLayer;
            }
        } catch (e) {
            console.error("AQI error:", e);
        }

        return overlayLayers;
    };

    // Load a layer by formid
    const loadLayer = useCallback(async (formid, layertype) => {
        const key = String(formid); // Ensure string key

        if (userLayersRef.current.has(key)) {
            console.log(`Layer ${key} already loaded`);
            return;
        }

        console.log(`Loading layer: ${key}`);

        try {
            const response = await fetch("/api/load_layer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ formid: key }),
            });
            const data = await response.json();

            if (!data || !Array.isArray(data) || data.length === 0) {
                console.log(`No data for layer ${key}`);
                return;
            }

            const features = data
                .filter(item => item.geojson)
                .map(item => {
                    try {
                        return {
                            type: "Feature",
                            geometry: JSON.parse(item.geojson),
                            properties: {
                                ...item,
                                formid: key,
                                style: item.style ? JSON.parse(item.style) : null,
                            },
                        };
                    } catch { return null; }
                })
                .filter(Boolean);

            if (features.length === 0) return;

            const geoJsonLayer = L.geoJSON(features, {
                pointToLayer: (feature, latlng) => {
                    const s = feature.properties.style;
                    // Always use CircleMarker with canvas renderer for best performance
                    // CircleMarker is much faster than icon-based markers
                    return L.circleMarker(latlng, {
                        radius: s?.radius || 8,
                        fillColor: s?.fillColor || "#ff6b35",
                        color: s?.color || "#fff",
                        weight: s?.weight || 2,
                        fillOpacity: s?.fillOpacity || 0.7,
                        renderer: canvasRendererRef.current // Use shared canvas renderer
                    });
                },
                style: (feature) => {
                    const s = feature.properties.style;
                    const lt = String(layertype).toLowerCase();
                    if (lt === "linestring") {
                        return {
                            color: s?.color || "#3388ff",
                            weight: s?.weight || 3
                        };
                    } else if (lt === "polygon") {
                        return {
                            color: s?.color || "#3388ff",
                            fillColor: s?.fillColor || "#3388ff",
                            weight: s?.weight || 2,
                            fillOpacity: s?.fillOpacity || 0.5
                        };
                    }
                    return {};
                },
                onEachFeature: (feature, layer) => {
                    // Use single click handler instead of multiple event listeners
                    layer.on("click", () => {
                        onFeatureClick?.(feature.properties.formid, feature.properties.id);
                    });
                },
            });

            if (mapInstance.current) {
                geoJsonLayer.addTo(mapInstance.current);
                userLayersRef.current.set(key, geoJsonLayer);
                console.log(`✓ Layer ${key} added (${features.length} features)`);

                if (geoJsonLayer.getBounds().isValid()) {
                    mapInstance.current.fitBounds(geoJsonLayer.getBounds(), { padding: [50, 50] });
                }
            }
        } catch (error) {
            console.error(`Failed to load layer ${key}:`, error);
        }
    }, [onFeatureClick]);

    // Remove a layer by formid
    const removeLayer = useCallback((formid) => {
        const key = String(formid);
        const layer = userLayersRef.current.get(key);

        if (layer && mapInstance.current) {
            console.log(`✗ Removing layer: ${key}`);
            // Check if layer is actually on the map before removing
            if (mapInstance.current.hasLayer(layer)) {
                mapInstance.current.removeLayer(layer);
                console.log(`✓ Layer ${key} removed from map`);
            }
            // Remove from ref regardless
            userLayersRef.current.delete(key);
        } else {
            console.log(`Layer ${key} not found in ref or map not ready`);
        }
    }, []);

    // Sync layers with checkedLayers
    useEffect(() => {
        if (!isMapReady || !mapInstance.current) return;

        // Convert checkedLayers to a Set of string formids
        const checkedIds = new Set(checkedLayers.map(l => String(l.formid)));

        // Get currently loaded layer ids (snapshot at this moment)
        const loadedIds = Array.from(userLayersRef.current.keys());

        console.log("Sync layers - Checked:", [...checkedIds], "Loaded:", loadedIds);

        // First, remove layers that are no longer checked
        loadedIds.forEach(id => {
            if (!checkedIds.has(id)) {
                removeLayer(id);
            }
        });

        // Then, add layers that are checked but not loaded
        // Use a timeout to ensure removal completes first
        const timeoutId = setTimeout(() => {
            checkedLayers.forEach(layer => {
                const id = String(layer.formid);
                // Double-check that it's not already loaded
                if (!userLayersRef.current.has(id)) {
                    loadLayer(id, layer.layertype);
                }
            });
        }, 0);

        return () => clearTimeout(timeoutId);
    }, [checkedLayers, isMapReady, loadLayer, removeLayer]);

    return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default LeafletMap;
