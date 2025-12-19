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
    IoChevronBack,
    IoChevronForward,
    IoChevronUp,
    IoChevronDown,
    IoEye,
} from "react-icons/io5";
import AttributeValue from "../components/atoms/AttributeValue";

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
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showTable, setShowTable] = useState(true);
    const [highlightedRowId, setHighlightedRowId] = useState(null);
    const tableRef = useRef(null);
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
            // Auto-select this layer in the search panel if not already selected
            if (selectedLayer !== formid) {
                setSelectedLayer(formid);

                // Load columns for this layer
                const columnsResponse = await fetch("/api/load_column_description", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ formid }),
                });
                const columnsData = await columnsResponse.json();
                setLayerColumns(columnsData);

                // Load all data for this layer
                const dataResponse = await fetch("/api/load_layer", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ formid }),
                });
                const layerDataResult = await dataResponse.json();
                setLayerData(layerDataResult || []);
                setFilteredData(layerDataResult || []);

                // Clear filters
                setSelectedColumn("");
                setKeywords([]);
                setSelectedKeyword("");
            }

            // Load feature details for modal
            const columnsResponse = await fetch("/api/load_column_description", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ formid }),
            });
            const columnsData = await columnsResponse.json();

            const dataResponse = await fetch("/api/load_layer_by_id", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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

                // Highlight the row in table (store both formid and id for multi-layer support)
                setHighlightedRowId({ formid, id });
                setShowTable(true); // Ensure table is visible

                // Scroll table to highlighted row after data loads
                setTimeout(() => {
                    const row = document.getElementById(`table-row-${id}`);
                    if (row && tableRef.current) {
                        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 200);
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
                <aside className={`${sidebarCollapsed ? 'w-16' : 'w-72'} bg-white shadow-xl z-20 flex flex-col border-r border-gray-200 overflow-hidden transition-all duration-300 ease-in-out`}>
                    {/* Sidebar Header with Collapse Toggle */}
                    <div className={`p-3 border-b border-gray-200 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                        {!sidebarCollapsed && (
                            <h2 className="text-sm font-semibold text-gray-700">เมนู</h2>
                        )}
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="w-8 h-8 bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-600 rounded-lg flex items-center justify-center transition-colors"
                            title={sidebarCollapsed ? 'ขยายเมนู' : 'ย่อเมนู'}
                        >
                            {sidebarCollapsed ? <IoChevronForward className="text-lg" /> : <IoChevronBack className="text-lg" />}
                        </button>
                    </div>

                    {/* Menu Links */}
                    <nav className="p-3 border-b border-gray-200">
                        <ul className="space-y-1">
                            {filteredMenu.map((item) => (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
                                        title={sidebarCollapsed ? item.label : ''}
                                    >
                                        <item.icon className="text-lg flex-shrink-0" />
                                        {!sidebarCollapsed && <span>{item.label}</span>}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Layer Tree */}
                    <div className="flex-1 overflow-y-auto">
                        {!sidebarCollapsed && (
                            <LayerSidebar
                                onLayerToggle={handleLayerToggle}
                                checkedLayers={checkedLayers.map((l) => String(l.formid))}
                            />
                        )}
                        {sidebarCollapsed && (
                            <div className="p-3 flex flex-col items-center">
                                <IoLayers className="text-2xl text-gray-400" title="ชั้นข้อมูล" />
                            </div>
                        )}
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
                                highlightedFeatureId={highlightedRowId}
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

                    {/* Data Table with Toggle */}
                    <div className="bg-white border-t border-gray-200">
                        {/* Table Header with Toggle */}
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <h4 className="text-sm font-semibold text-gray-700">
                                    ตารางข้อมูล
                                </h4>
                                {filteredData.length > 0 && (
                                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                                        {filteredData.length} รายการ
                                    </span>
                                )}
                                {highlightedRowId && (
                                    <button
                                        onClick={() => setHighlightedRowId(null)}
                                        className="text-xs text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-full transition-colors"
                                    >
                                        ✕ ล้างการเลือก
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => setShowTable(!showTable)}
                                className="flex items-center gap-1 text-sm text-gray-600 hover:text-orange-600 transition-colors"
                            >
                                {showTable ? (
                                    <>
                                        <IoChevronDown className="text-lg" />
                                        <span>ซ่อน</span>
                                    </>
                                ) : (
                                    <>
                                        <IoChevronUp className="text-lg" />
                                        <span>แสดง</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Table Content - Collapsible */}
                        <div
                            ref={tableRef}
                            className={`overflow-auto transition-all duration-300 ease-in-out ${showTable ? 'max-h-72' : 'max-h-0'}`}
                        >
                            {filteredData.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    ดู
                                                </th>
                                                {layerColumns.map((col) => (
                                                    <th
                                                        key={col.col_id}
                                                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                    >
                                                        {col.col_name}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredData.map((row) => (
                                                <tr
                                                    key={row.id}
                                                    id={`table-row-${row.id}`}
                                                    onClick={() => {
                                                        setHighlightedRowId({ formid: selectedLayer, id: row.id });
                                                        handleZoomToFeature(row.id);
                                                    }}
                                                    className={`cursor-pointer transition-colors ${highlightedRowId?.id === row.id && highlightedRowId?.formid === selectedLayer
                                                        ? 'bg-orange-100 hover:bg-orange-150'
                                                        : 'hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <td className="px-3 py-2 whitespace-nowrap">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setHighlightedRowId({ formid: selectedLayer, id: row.id });
                                                                // Load and show modal with details
                                                                if (selectedLayer) {
                                                                    handleFeatureClick(selectedLayer, row.id);
                                                                    setShowModal(true);
                                                                }
                                                            }}
                                                            className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                                                            title="ดูรายละเอียด"
                                                        >
                                                            <IoEye className="text-lg" />
                                                        </button>
                                                    </td>
                                                    {layerColumns.map((col) => {
                                                        const cellValue = row[col.col_id];
                                                        const isImage = cellValue && typeof cellValue === 'string' && (
                                                            cellValue.startsWith('data:image/') ||
                                                            cellValue.startsWith('/9j/') ||
                                                            cellValue.startsWith('iVBOR') ||
                                                            cellValue.startsWith('R0lGO')
                                                        );

                                                        // Get proper image src
                                                        const getImageSrc = (value) => {
                                                            if (value.startsWith('data:image/')) return value;
                                                            if (value.startsWith('/9j/')) return `data:image/jpeg;base64,${value}`;
                                                            if (value.startsWith('iVBOR')) return `data:image/png;base64,${value}`;
                                                            if (value.startsWith('R0lGO')) return `data:image/gif;base64,${value}`;
                                                            return `data:image/jpeg;base64,${value}`;
                                                        };

                                                        return (
                                                            <td
                                                                key={col.col_id}
                                                                className="px-3 py-2 whitespace-nowrap text-sm text-gray-900"
                                                            >
                                                                {isImage ? (
                                                                    <img
                                                                        src={getImageSrc(cellValue)}
                                                                        alt="thumbnail"
                                                                        className="w-10 h-10 object-cover rounded border border-gray-200"
                                                                    />
                                                                ) : (
                                                                    cellValue || "-"
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="h-32 flex items-center justify-center text-gray-400">
                                    <p>เลือกชั้นข้อมูลและค้นหาเพื่อแสดงตาราง</p>
                                </div>
                            )}
                        </div>
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
                                        <div className="text-base text-gray-900 mt-1">
                                            <AttributeValue
                                                value={attr.value}
                                                type={attr.type}
                                            />
                                        </div>
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
