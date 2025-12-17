import React, { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "../components/organisms/Navbar";
import LayerSidebar from "../components/organisms/LayerSidebar";
import LeafletMap from "../components/organisms/LeafletMap";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    IoDocumentText,
    IoMap,
    IoCloudUpload,
    IoLayers,
    IoSettings,
    IoPeople,
    IoBook,
    IoSearch,
    IoClose,
} from "react-icons/io5";

const Home = () => {
    const { user } = useAuth();
    const [checkedLayers, setCheckedLayers] = useState([]);
    const [allLayers, setAllLayers] = useState([]);
    const [selectedLayer, setSelectedLayer] = useState(null);
    const [layerColumns, setLayerColumns] = useState([]);
    const [layerData, setLayerData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedColumn, setSelectedColumn] = useState("");
    const [keywords, setKeywords] = useState([]);
    const [selectedKeyword, setSelectedKeyword] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [featureAttributes, setFeatureAttributes] = useState([]);
    const mapRef = useRef(null);

    const menuItems = [
        { path: "/report", icon: IoDocumentText, label: "รายงาน", roles: ["admin", "editor", "user"] },
        { path: "/", icon: IoMap, label: "ชั้นข้อมูลแผนที่", roles: ["admin", "editor", "user"] },
        { path: "/upload", icon: IoCloudUpload, label: "นำเข้าข้อมูลจาก CSV", roles: ["admin", "editor"] },
        { path: "/create-layer", icon: IoLayers, label: "สร้างชั้นข้อมูล", roles: ["admin", "editor"] },
        { path: "/manage-data", icon: IoSettings, label: "จัดการข้อมูล", roles: ["admin", "editor"] },
        { path: "/users", icon: IoPeople, label: "จัดการผู้ใช้", roles: ["admin"] },
        { path: "/docs", icon: IoBook, label: "คู่มือการใช้งาน", roles: ["admin", "editor", "user"] },
    ];

    // Filter menu items based on user role
    const filteredMenu = menuItems.filter((item) => {
        if (!user) {
            // Not logged in - show only items accessible to everyone (with "user" role)
            return item.roles.includes("user");
        }
        // Logged in - show items that match the user's role
        return item.roles.includes(user.role);
    });

    useEffect(() => {
        loadLayers();
    }, []);

    const loadLayers = async () => {
        try {
            const response = await fetch("/api/list_layer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                console.error(`Failed to load layers: ${response.status} ${response.statusText}`);
                setAllLayers([]);
                return;
            }

            const data = await response.json();
            setAllLayers(data || []);
        } catch (error) {
            console.error("Failed to load layers:", error);
            setAllLayers([]);
        }
    };

    const handleLayerToggle = useCallback((formid, layertype) => {
        const id = String(formid);

        setCheckedLayers(prevLayers => {
            const existingIndex = prevLayers.findIndex((l) => String(l.formid) === id);

            if (existingIndex >= 0) {
                // Layer exists - remove it
                console.log("Unchecking layer:", id);
                const newLayers = prevLayers.filter((l) => String(l.formid) !== id);

                // Handle filter state update
                if (String(selectedLayer) === id) {
                    if (newLayers.length > 0) {
                        // Don't auto-select another layer when unchecking
                        setSelectedLayer(null);
                        setLayerColumns([]);
                        setLayerData([]);
                        setFilteredData([]);
                        setSelectedColumn("");
                        setKeywords([]);
                        setSelectedKeyword("");
                    } else {
                        setSelectedLayer(null);
                        setLayerColumns([]);
                        setLayerData([]);
                        setFilteredData([]);
                        setSelectedColumn("");
                        setKeywords([]);
                        setSelectedKeyword("");
                    }
                }

                return newLayers;
            } else {
                // Layer doesn't exist - add it
                console.log("Checking layer:", id);
                // Don't auto-select when checking, let user select from dropdown
                return [...prevLayers, { formid: id, layertype }];
            }
        });
    }, [selectedLayer]);

    const handleLayerSelect = async (formid) => {
        if (!formid || formid === "เลือก...") {
            setSelectedLayer(null);
            setLayerColumns([]);
            setLayerData([]);
            setFilteredData([]);
            return;
        }

        try {
            setSelectedLayer(formid);

            // Load columns
            const columnsResponse = await fetch("/api/load_column_description", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ formid }),
            });
            const columnsData = await columnsResponse.json();
            setLayerColumns(columnsData || []);

            // Load data
            const dataResponse = await fetch("/api/load_layer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ formid }),
            });
            const layerDataResult = await dataResponse.json();
            setLayerData(layerDataResult || []);
            setFilteredData(layerDataResult || []);
        } catch (error) {
            console.error("Failed to load layer data:", error);
        }
    };

    const handleColumnSelect = async (columnId) => {
        if (!columnId || !selectedLayer) return;

        setSelectedColumn(columnId);

        try {
            const response = await fetch("/api/load_by_column_id", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    formid: selectedLayer,
                    columnid: columnId,
                }),
            });

            const data = await response.json();
            const uniqueValues = data.map((item) => item[columnId]);
            setKeywords(uniqueValues);
        } catch (error) {
            console.error("Failed to load keywords:", error);
        }
    };

    const handleSearch = () => {
        if (!selectedKeyword || selectedKeyword === "ทั้งหมด") {
            setFilteredData(layerData);
            return;
        }

        const filtered = layerData.filter((item) => {
            if (selectedColumn) {
                return String(item[selectedColumn]) === String(selectedKeyword);
            }
            return true;
        });

        setFilteredData(filtered);
    };

    const handleFeatureClick = async (formid, id) => {
        try {
            const columnsResponse = await fetch("/api/load_column_description", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ formid }),
            });
            const columnsData = await columnsResponse.json();

            const dataResponse = await fetch("/api/load_layer_by_id", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ formid, id }),
            });
            const responseData = await dataResponse.json();

            if (responseData && responseData.length > 0) {
                const featureData = responseData[0];
                const attributes = columnsData.map((col) => ({
                    name: col.col_name,
                    value: featureData[col.col_id] || "-",
                    type: col.col_type,
                }));

                setSelectedFeature(featureData);
                setFeatureAttributes(attributes);
                setShowModal(true);
            }
        } catch (error) {
            console.error("Failed to load feature data:", error);
        }
    };

    const handleZoomToFeature = (id) => {
        // Find the feature in filteredData
        const feature = filteredData.find(item => item.id === id);
        if (!feature || !feature.geojson) {
            console.log("Feature not found or no geometry:", id);
            return;
        }

        try {
            const geometry = JSON.parse(feature.geojson);
            if (mapRef.current) {
                let latlng;
                if (geometry.type === "Point") {
                    latlng = [geometry.coordinates[1], geometry.coordinates[0]];
                    mapRef.current.setView(latlng, 18);
                } else if (geometry.type === "LineString" || geometry.type === "Polygon" || geometry.type === "MultiPolygon") {
                    // For lines and polygons, calculate center
                    const coords = geometry.type === "Polygon" ? geometry.coordinates[0] :
                        geometry.type === "MultiPolygon" ? geometry.coordinates[0][0] :
                            geometry.coordinates;
                    const latSum = coords.reduce((sum, c) => sum + c[1], 0);
                    const lngSum = coords.reduce((sum, c) => sum + c[0], 0);
                    latlng = [latSum / coords.length, lngSum / coords.length];
                    mapRef.current.setView(latlng, 17);
                }
            }
        } catch (e) {
            console.error("Failed to parse geometry:", e);
        }
    };

    useEffect(() => {
        if (selectedKeyword) {
            handleSearch();
        }
    }, [selectedKeyword]);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100">
            <Navbar />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-72 bg-white shadow-xl z-20 flex flex-col border-r border-gray-200 overflow-hidden">
                    {/* Menu Links */}
                    <nav className="p-3 border-b border-gray-200">
                        <ul className="space-y-1">
                            {filteredMenu.map((item) => (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                                    >
                                        <item.icon className="text-lg" />
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Layer Tree */}
                    <div className="flex-1 overflow-y-auto">
                        <LayerSidebar
                            onLayerToggle={handleLayerToggle}
                            checkedLayers={checkedLayers.map((l) => String(l.formid))}
                        />
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 flex">
                        {/* Map with Floating Filter Panel */}
                        <div className="flex-1 relative">
                            <LeafletMap
                                checkedLayers={checkedLayers}
                                onFeatureClick={handleFeatureClick}
                                enableWeatherLayers={true}
                                mapRef={mapRef}
                            />

                            {/* Floating Filter Panel */}
                            <div className="absolute top-4 right-4 w-80 max-h-[calc(100%-2rem)] overflow-y-auto bg-white rounded-lg shadow-2xl z-[1000] p-4">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                                    ค้นหาข้อมูล
                                </h3>

                                {/* Layer Selection - only show if layers are checked */}
                                {checkedLayers.length > 0 && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            เลือกชั้นข้อมูล
                                        </label>
                                        <select
                                            value={selectedLayer || ""}
                                            onChange={(e) => handleLayerSelect(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        >
                                            <option value="">เลือก...</option>
                                            {checkedLayers.map((layer) => {
                                                const layerInfo = allLayers.find(l => l.formid === layer.formid);
                                                return (
                                                    <option key={layer.formid} value={layer.formid}>
                                                        {layerInfo?.layername || layer.formid}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                )}

                                {/* Column Selection */}
                                {layerColumns.length > 0 && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            เลือกคอลัมน์
                                        </label>
                                        <select
                                            value={selectedColumn}
                                            onChange={(e) => handleColumnSelect(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        >
                                            <option value="">เลือก...</option>
                                            {layerColumns.map((col) => (
                                                <option key={col.col_id} value={col.col_id}>
                                                    {col.col_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Keyword Selection */}
                                {keywords.length > 0 && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            คำที่ต้องการค้นหา
                                        </label>
                                        <select
                                            value={selectedKeyword}
                                            onChange={(e) => setSelectedKeyword(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        >
                                            <option value="">ทั้งหมด</option>
                                            {keywords.map((keyword, idx) => (
                                                <option key={idx} value={keyword}>
                                                    {keyword}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Empty state message */}
                                {checkedLayers.length === 0 && (
                                    <div className="text-center text-gray-400 text-sm py-4">
                                        <p>กรุณาเลือกชั้นข้อมูลจากรายการด้านซ้าย</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="h-64 bg-white border-t border-gray-200 overflow-auto">
                        {filteredData.length > 0 ? (
                            <div className="p-4">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    ซูม
                                                </th>
                                                {layerColumns.map((col) => (
                                                    <th
                                                        key={col.col_id}
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                    >
                                                        {col.col_name}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredData.map((row) => (
                                                <tr key={row.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <button
                                                            onClick={() => handleZoomToFeature(row.id)}
                                                            className="text-orange-600 hover:text-orange-700"
                                                        >
                                                            <IoSearch className="text-lg" />
                                                        </button>
                                                    </td>
                                                    {layerColumns.map((col) => (
                                                        <td
                                                            key={col.col_id}
                                                            className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
                                                        >
                                                            {row[col.col_id] || "-"}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                <p>เลือกชั้นข้อมูลเพื่อแสดงตาราง</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Feature Attribute Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[1050] flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowModal(false)}
                    />
                    {/* Modal Content */}
                    <div className="relative bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden shadow-2xl">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800">
                                รายละเอียดข้อมูล
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
                            >
                                <IoClose className="text-2xl" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto max-h-[60vh]">
                            <div className="space-y-3">
                                {featureAttributes.map((attr, idx) => (
                                    <div key={idx} className="border-b border-gray-100 pb-2">
                                        <p className="text-sm font-medium text-gray-600">
                                            {attr.name}
                                        </p>
                                        <p className="text-base text-gray-900 mt-1">
                                            {attr.type === "date" && attr.value !== "-"
                                                ? new Date(attr.value).toLocaleDateString("th-TH")
                                                : attr.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end p-4 border-t border-gray-200">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                            >
                                ปิด
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-2 px-4 text-center text-sm text-gray-500">
                © 2024 ระบบภูมิสารสนเทศชุมชน (LGIA)
            </footer>
        </div>
    );
};

export default Home;
