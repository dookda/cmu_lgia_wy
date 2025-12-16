import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import Navbar from "../components/organisms/Navbar";
import { IoSave, IoTrash, IoArrowBack, IoSearch } from "react-icons/io5";

const DataEntry = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const drawnItemsRef = useRef(null);

    const [formid, setFormid] = useState(searchParams.get("formid") || "");
    const [layerInfo, setLayerInfo] = useState(null);
    const [columns, setColumns] = useState([]);
    const [formData, setFormData] = useState({});
    const [currentFeature, setCurrentFeature] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [coordinates, setCoordinates] = useState({ lat: "", lng: "" });

    useEffect(() => {
        if (formid) {
            loadLayerInfo();
        }
    }, [formid]);

    useEffect(() => {
        initializeMap();
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    const initializeMap = () => {
        if (!mapInstance.current) {
            mapInstance.current = L.map(mapRef.current).setView([18.5762, 99.0173], 15);

            const googleRoad = L.tileLayer("https://{s}.google.com/vt/lyrs=r&x={x}&y={y}&z={z}", {
                maxZoom: 20,
                subdomains: ["mt0", "mt1", "mt2", "mt3"],
            });
            googleRoad.addTo(mapInstance.current);

            // Initialize drawn items layer
            drawnItemsRef.current = L.featureGroup().addTo(mapInstance.current);

            // Add drawing controls
            mapInstance.current.pm.addControls({
                position: "topleft",
                drawCircle: false,
                drawCircleMarker: true,
                drawPolyline: true,
                drawRectangle: false,
                drawPolygon: true,
                drawMarker: true,
                cutPolygon: false,
            });

            // Handle draw events
            mapInstance.current.on("pm:create", (e) => {
                const layer = e.layer;
                drawnItemsRef.current.addLayer(layer);
                setCurrentFeature(layer);

                // Reset form when new feature is drawn
                setFormData({});
            });

            mapInstance.current.on("pm:remove", () => {
                setCurrentFeature(null);
                setFormData({});
            });
        }
    };

    const loadLayerInfo = async () => {
        try {
            const response = await fetch("/api/get_layer_description", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ formid }),
            });
            const data = await response.json();

            if (data && data.length > 0) {
                setLayerInfo(data[0]);
                loadColumns();
                loadExistingFeatures();
            }
        } catch (error) {
            console.error("Failed to load layer info:", error);
        }
    };

    const loadColumns = async () => {
        try {
            const response = await fetch("/api/load_column_description", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ formid }),
            });
            const data = await response.json();
            setColumns(data || []);
        } catch (error) {
            console.error("Failed to load columns:", error);
        }
    };

    const loadExistingFeatures = async () => {
        try {
            const response = await fetch("/api/load_layer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ formid }),
            });
            const data = await response.json();

            if (data && data.length > 0 && drawnItemsRef.current) {
                data.forEach((item) => {
                    try {
                        const geometry = JSON.parse(item.geojson);
                        const layer = L.geoJSON(geometry).getLayers()[0];

                        layer.feature = {
                            type: "Feature",
                            properties: { ...item },
                            geometry: geometry,
                        };

                        drawnItemsRef.current.addLayer(layer);

                        layer.on("click", () => {
                            setCurrentFeature(layer);
                            setEditMode(true);
                            setFormData(item);
                        });
                    } catch (e) {
                        console.error("Error loading feature:", e);
                    }
                });

                if (data.length > 0) {
                    mapInstance.current.fitBounds(drawnItemsRef.current.getBounds());
                }
            }
        } catch (error) {
            console.error("Failed to load existing features:", error);
        }
    };

    const handleInputChange = (colId, value) => {
        setFormData((prev) => ({ ...prev, [colId]: value }));
    };

    const searchByCoordinates = () => {
        const lat = parseFloat(coordinates.lat);
        const lng = parseFloat(coordinates.lng);

        if (!isNaN(lat) && !isNaN(lng)) {
            const marker = L.marker([lat, lng]).addTo(mapInstance.current);
            mapInstance.current.setView([lat, lng], 17);

            setTimeout(() => {
                mapInstance.current.removeLayer(marker);
            }, 3000);
        }
    };

    const clearCoordinates = () => {
        setCoordinates({ lat: "", lng: "" });
    };

    const saveFeature = async () => {
        if (!currentFeature) {
            alert("กรุณาวาดข้อมูลบนแผนที่ก่อน");
            return;
        }

        try {
            const geojson = currentFeature.toGeoJSON().geometry;
            const dataArr = columns.map((col) => ({
                name: col.col_id,
                value: formData[col.col_id] || "",
            }));

            const response = await fetch("/api/save_layer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    formid,
                    geojson: JSON.stringify(geojson),
                    dataarr: JSON.stringify(dataArr),
                }),
            });

            if (response.ok) {
                alert("บันทึกข้อมูลสำเร็จ");
                setFormData({});
                drawnItemsRef.current.clearLayers();
                setCurrentFeature(null);
                loadExistingFeatures();
            } else {
                alert("เกิดข้อผิดพลาดในการบันทึก");
            }
        } catch (error) {
            console.error("Failed to save feature:", error);
            alert("เกิดข้อผิดพลาดในการบันทึก");
        }
    };

    const updateFeature = async () => {
        if (!currentFeature || !formData.id) {
            alert("กรุณาเลือกข้อมูลที่ต้องการแก้ไข");
            return;
        }

        try {
            const geojson = currentFeature.toGeoJSON().geometry;
            const dataArr = columns.map((col) => ({
                name: col.col_id,
                value: formData[col.col_id] || "",
            }));

            const response = await fetch("/api/update_layer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    formid,
                    id: formData.id,
                    geojson: JSON.stringify(geojson),
                    dataarr: JSON.stringify(dataArr),
                }),
            });

            if (response.ok) {
                alert("อัปเดตข้อมูลสำเร็จ");
                setFormData({});
                setEditMode(false);
                drawnItemsRef.current.clearLayers();
                setCurrentFeature(null);
                loadExistingFeatures();
            } else {
                alert("เกิดข้อผิดพลาดในการอัปเดต");
            }
        } catch (error) {
            console.error("Failed to update feature:", error);
            alert("เกิดข้อผิดพลาดในการอัปเดต");
        }
    };

    const deleteFeature = async () => {
        if (!formData.id) {
            alert("กรุณาเลือกข้อมูลที่ต้องการลบ");
            return;
        }

        if (!window.confirm("คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้?")) {
            return;
        }

        try {
            const response = await fetch("/api/delete_row", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ formid, id: formData.id }),
            });

            if (response.ok) {
                alert("ลบข้อมูลสำเร็จ");
                setFormData({});
                setEditMode(false);
                drawnItemsRef.current.clearLayers();
                setCurrentFeature(null);
                loadExistingFeatures();
            } else {
                alert("เกิดข้อผิดพลาดในการลบ");
            }
        } catch (error) {
            console.error("Failed to delete feature:", error);
            alert("เกิดข้อผิดพลาดในการลบ");
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <Navbar />

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content */}
                <div className="flex-1 p-4 overflow-auto">
                    <div className="mb-4 flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            <IoArrowBack /> กลับ
                        </button>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {layerInfo ? `เพิ่ม/แก้ไขข้อมูล: ${layerInfo.layername}` : "เพิ่ม/แก้ไขข้อมูล"}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Map */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow p-4">
                                <div
                                    ref={mapRef}
                                    className="w-full h-[600px] rounded-lg"
                                />
                            </div>
                        </div>

                        {/* Right Panel */}
                        <div className="space-y-4">
                            {/* Coordinate Search */}
                            <div className="bg-white rounded-lg shadow p-4">
                                <h3 className="text-lg font-semibold mb-3">ค้นหาจากพิกัดภูมิศาสตร์</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            ละติจูด
                                        </label>
                                        <input
                                            type="number"
                                            value={coordinates.lat}
                                            onChange={(e) => setCoordinates({ ...coordinates, lat: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="เช่น 18.57621865878676"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            ลองจิจูด
                                        </label>
                                        <input
                                            type="number"
                                            value={coordinates.lng}
                                            onChange={(e) => setCoordinates({ ...coordinates, lng: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="เช่น 99.01626966755235"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={searchByCoordinates}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                        >
                                            <IoSearch /> ค้นหา
                                        </button>
                                        <button
                                            onClick={clearCoordinates}
                                            className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                                        >
                                            ล้าง
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Attribute Form */}
                            <div className="bg-white rounded-lg shadow p-4">
                                <h3 className="text-lg font-semibold mb-3">ข้อมูลรายละเอียด</h3>
                                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                    {columns.map((col) => (
                                        <div key={col.col_id}>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {col.col_name}
                                            </label>
                                            {col.col_type === "date" ? (
                                                <input
                                                    type="date"
                                                    value={formData[col.col_id] || ""}
                                                    onChange={(e) => handleInputChange(col.col_id, e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                />
                                            ) : col.col_type === "numeric" ? (
                                                <input
                                                    type="number"
                                                    value={formData[col.col_id] || ""}
                                                    onChange={(e) => handleInputChange(col.col_id, e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={formData[col.col_id] || ""}
                                                    onChange={(e) => handleInputChange(col.col_id, e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-4 space-y-2">
                                    {editMode ? (
                                        <>
                                            <button
                                                onClick={updateFeature}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                            >
                                                <IoSave /> อัปเดตข้อมูล
                                            </button>
                                            <button
                                                onClick={deleteFeature}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                            >
                                                <IoTrash /> ลบข้อมูล
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={saveFeature}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                        >
                                            <IoSave /> บันทึกข้อมูล
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-2 px-4 text-center text-sm text-gray-500">
                © 2024 ระบบภูมิสารสนเทศชุมชน (LGIA)
            </footer>
        </div>
    );
};

export default DataEntry;
