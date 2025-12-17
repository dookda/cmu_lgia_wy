import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import Navbar from "../components/organisms/Navbar";
import { AlertModal, ConfirmModal, SymbolEditorModal } from "../components/molecules";
import { IoSave, IoTrash, IoHome, IoSearch, IoColorPalette } from "react-icons/io5";

const DataEntry = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const drawnItemsRef = useRef(null);
    const currentEditingLayerRef = useRef(null); // Track currently editing layer

    const [formid, setFormid] = useState(searchParams.get("formid") || "");
    const [layerInfo, setLayerInfo] = useState(null);
    const [columns, setColumns] = useState([]);
    const [formData, setFormData] = useState({});
    const [currentFeature, setCurrentFeature] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [coordinates, setCoordinates] = useState({ lat: "", lng: "" });
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
    const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
    const [saveMessage, setSaveMessage] = useState("");
    const [pendingAutoSave, setPendingAutoSave] = useState(null);
    const [geometryVersion, setGeometryVersion] = useState(0);
    const autoUpdateTimeoutRef = useRef(null);
    const isInitialLoadRef = useRef(true);

    // Modal state
    const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', variant: 'info', onClose: null });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', variant: 'warning', onConfirm: null });

    // Symbol editor state
    const [symbolEditorOpen, setSymbolEditorOpen] = useState(false);
    const [featureStyle, setFeatureStyle] = useState({});

    // Helper functions for modals
    const showAlert = (message, variant = 'info', title = '', onClose = null) => {
        setAlertModal({ isOpen: true, title, message, variant, onClose });
    };

    const showConfirm = (message, onConfirm, variant = 'warning', title = 'ยืนยัน') => {
        setConfirmModal({ isOpen: true, title, message, variant, onConfirm });
    };

    useEffect(() => {
        if (formid) {
            loadLayerInfo();
        }
    }, [formid]);

    useEffect(() => {
        initializeMap();
        return () => {
            // Cleanup auto-update timeout on unmount
            if (autoUpdateTimeoutRef.current) {
                clearTimeout(autoUpdateTimeoutRef.current);
                autoUpdateTimeoutRef.current = null;
            }
            // Disable editing on current layer
            if (currentEditingLayerRef.current) {
                try {
                    currentEditingLayerRef.current.pm.disable();
                } catch (e) {
                    console.error("Error disabling editing on cleanup:", e);
                }
                currentEditingLayerRef.current = null;
            }
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // Configure draw controls based on layer type
    useEffect(() => {
        if (!mapInstance.current || !layerInfo) return;

        // Remove existing controls first
        mapInstance.current.pm.removeControls();

        // Determine which controls to show based on layer type
        const layerType = layerInfo.layertype?.toLowerCase();
        let drawOptions = {
            position: "topleft",
            drawCircle: false,
            drawCircleMarker: false,
            drawPolyline: false,
            drawRectangle: false,
            drawPolygon: false,
            drawMarker: false,
            drawText: false,
            cutPolygon: false,
        };

        if (layerType === "point") {
            drawOptions.drawMarker = true;
        } else if (layerType === "linestring") {
            drawOptions.drawPolyline = true;
        } else if (layerType === "polygon") {
            drawOptions.drawPolygon = true;
            drawOptions.drawRectangle = true;
        }

        // Add controls with filtered options
        mapInstance.current.pm.addControls(drawOptions);
    }, [layerInfo]);

    // Handle auto-save after drawing
    useEffect(() => {
        if (!pendingAutoSave || !autoSaveEnabled || columns.length === 0) {
            setPendingAutoSave(null);
            return;
        }

        const performAutoSave = async () => {
            try {
                const geojson = pendingAutoSave.toGeoJSON().geometry;
                const dataArr = columns.map((col) => ({
                    name: col.col_id,
                    value: "",
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
                    setSaveMessage("✓ บันทึกรูปร่างอัตโนมัติสำเร็จ - คลิกที่รูปร่างเพื่อเพิ่มข้อมูลรายละเอียด");
                    setTimeout(() => setSaveMessage(""), 5000);

                    // loadExistingFeatures will handle clearing and resetting
                    await loadExistingFeatures();
                } else {
                    setSaveMessage("⚠ เกิดข้อผิดพลาดในการบันทึกอัตโนมัติ");
                    setTimeout(() => setSaveMessage(""), 5000);
                }
            } catch (error) {
                console.error("Auto-save failed:", error);
                setSaveMessage("⚠ เกิดข้อผิดพลาดในการบันทึกอัตโนมัติ");
                setTimeout(() => setSaveMessage(""), 5000);
            }
            setPendingAutoSave(null);
        };

        performAutoSave();
    }, [pendingAutoSave, autoSaveEnabled, columns, formid]);

    // Handle auto-update when editing existing features
    useEffect(() => {
        if (!editMode || !autoUpdateEnabled || !currentFeature || !formData.id || columns.length === 0) {
            return;
        }

        // Skip auto-update on initial feature click
        if (isInitialLoadRef.current) {
            console.log("Auto-update: Skipping initial load");
            isInitialLoadRef.current = false;
            return;
        }

        console.log("Auto-update: Setting up debounced update");

        // Clear previous timeout
        if (autoUpdateTimeoutRef.current) {
            clearTimeout(autoUpdateTimeoutRef.current);
        }

        // Set new timeout for auto-update (debounced by 2 seconds)
        autoUpdateTimeoutRef.current = setTimeout(async () => {
            // Show confirm dialog for auto-update
            showConfirm(
                "คุณต้องการบันทึกการแก้ไขข้อมูลนี้หรือไม่?",
                async () => {
                    try {
                        // Validate data before sending
                        if (!formData.id || !currentFeature || !formid) {
                            console.error("Auto-update skipped: missing required data");
                            return;
                        }

                        // Get and validate geometry
                        let geojson;
                        try {
                            geojson = currentFeature.toGeoJSON().geometry;
                            if (!geojson || !geojson.type) {
                                console.error("Auto-update skipped: invalid geometry");
                                return;
                            }
                        } catch (geomError) {
                            console.error("Auto-update skipped: geometry error", geomError);
                            return;
                        }

                        const dataArr = columns
                            .filter(col => col.col_type !== "date")
                            .map((col) => ({
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
                            setSaveMessage("✓ อัปเดตข้อมูลอัตโนมัติสำเร็จ");
                            setTimeout(() => setSaveMessage(""), 3000);
                        } else {
                            setSaveMessage("⚠ เกิดข้อผิดพลาดในการอัปเดตอัตโนมัติ");
                            setTimeout(() => setSaveMessage(""), 3000);
                        }
                    } catch (error) {
                        console.error("Auto-update failed:", error);
                        setSaveMessage("⚠ เกิดข้อผิดพลาดในการอัปเดตอัตโนมัติ");
                        setTimeout(() => setSaveMessage(""), 3000);
                    }
                },
                'info',
                'บันทึกอัตโนมัติ'
            );
        }, 2000); // Wait 2 seconds after user stops typing

        return () => {
            if (autoUpdateTimeoutRef.current) {
                clearTimeout(autoUpdateTimeoutRef.current);
            }
        };
    }, [formData, editMode, autoUpdateEnabled, currentFeature, columns, formid, geometryVersion]);

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

            // Handle draw events
            mapInstance.current.on("pm:create", (e) => {
                const layer = e.layer;
                drawnItemsRef.current.addLayer(layer);
                setCurrentFeature(layer);

                // Reset form when new feature is drawn
                setFormData({});

                // Reset initial load flag for new features
                isInitialLoadRef.current = false;

                // Trigger auto-save
                setPendingAutoSave(layer);
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

            if (!drawnItemsRef.current) return;

            // CRITICAL FIX: Clear all existing layers first to prevent duplicates
            drawnItemsRef.current.clearLayers();
            console.log("Cleared existing layers before reload");

            // Reset references to prevent stale layer references
            if (currentEditingLayerRef.current) {
                try {
                    currentEditingLayerRef.current.pm.disable();
                } catch (e) {
                    // Layer may already be removed
                }
                currentEditingLayerRef.current = null;
            }
            setCurrentFeature(null);
            setEditMode(false);
            setFormData({});

            if (data && data.length > 0) {
                data.forEach((item) => {
                    try {
                        const geometry = JSON.parse(item.geojson);
                        const layer = L.geoJSON(geometry).getLayers()[0];

                        layer.feature = {
                            type: "Feature",
                            properties: { ...item },
                            geometry: geometry,
                        };

                        // Apply style if available
                        if (item.style) {
                            try {
                                const styleObj = JSON.parse(item.style);
                                // Apply style based on geometry type
                                if (layer.setStyle) {
                                    layer.setStyle({
                                        color: styleObj.color || '#3388ff',
                                        fillColor: styleObj.fillColor || '#3388ff',
                                        weight: styleObj.weight || 3,
                                        opacity: styleObj.opacity || 1,
                                        fillOpacity: styleObj.fillOpacity || 0.2,
                                        dashArray: styleObj.dashArray || null,
                                    });
                                }
                            } catch (styleError) {
                                console.warn('Failed to parse feature style:', styleError);
                            }
                        }

                        drawnItemsRef.current.addLayer(layer);

                        layer.on("click", () => {
                            // Read current data from layer.feature.properties (fresh data, not captured stale variable)
                            const currentData = layer.feature.properties;
                            console.log("Feature clicked, id:", currentData.id);

                            // Only load data for viewing - DO NOT enable geometry editing automatically
                            // User must click the Geoman modify/edit button in the toolbar to edit geometry

                            setCurrentFeature(layer);
                            setEditMode(true);
                            setFormData(currentData);
                            // Mark as initial load to prevent auto-update on first click
                            isInitialLoadRef.current = true;

                            // Store reference to currently selected layer (for data editing only)
                            currentEditingLayerRef.current = layer;

                            console.log("Feature selected for viewing - use toolbar edit button to modify geometry");
                        });

                        // Listen for geometry edits to trigger auto-update
                        layer.on("pm:update", () => {
                            console.log("Geometry updated via pm:update");
                            // Increment geometry version to trigger auto-update
                            setGeometryVersion(prev => prev + 1);
                        });

                        layer.on("pm:dragend", () => {
                            console.log("Geometry moved via pm:dragend");
                            // Increment geometry version to trigger auto-update
                            setGeometryVersion(prev => prev + 1);
                        });

                        layer.on("pm:drag", () => {
                            console.log("Geometry being dragged");
                        });
                    } catch (e) {
                        console.error("Error loading feature:", e);
                    }
                });

                if (data.length > 0) {
                    try {
                        const bounds = drawnItemsRef.current.getBounds();
                        if (bounds.isValid()) {
                            mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
                        }
                    } catch (e) {
                        console.error("Error fitting bounds:", e);
                    }
                }

                console.log(`Loaded ${data.length} features`);
            } else {
                console.log("No features to load");
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
            showAlert("กรุณาวาดข้อมูลบนแผนที่ก่อน", 'warning');
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
                // Show success alert first, reload data when user closes the alert
                showAlert("บันทึกข้อมูลสำเร็จ", 'success', 'สำเร็จ', loadExistingFeatures);
            } else {
                showAlert("เกิดข้อผิดพลาดในการบันทึก", 'error');
            }
        } catch (error) {
            console.error("Failed to save feature:", error);
            showAlert("เกิดข้อผิดพลาดในการบันทึก", 'error');
        }
    };

    const updateFeature = async () => {
        if (!currentFeature || !formData.id) {
            showAlert("กรุณาเลือกข้อมูลที่ต้องการแก้ไข", 'warning');
            return;
        }

        // Ask for confirmation before updating using modal
        showConfirm(
            "คุณต้องการบันทึกการแก้ไขข้อมูลนี้หรือไม่?",
            async () => {
                // Cancel any pending auto-update
                if (autoUpdateTimeoutRef.current) {
                    clearTimeout(autoUpdateTimeoutRef.current);
                    autoUpdateTimeoutRef.current = null;
                }

                try {
                    const geojson = currentFeature.toGeoJSON().geometry;
                    const dataArr = columns.map((col) => {
                        let value = formData[col.col_id] || "";

                        // Convert date values to ISO format if needed
                        if (col.col_type === "date" && value) {
                            try {
                                const dateObj = new Date(value);
                                if (!isNaN(dateObj.getTime())) {
                                    value = dateObj.toISOString().split('T')[0];
                                }
                            } catch (e) {
                                console.warn(`Failed to parse date for ${col.col_id}:`, e);
                            }
                        }

                        return {
                            name: col.col_id,
                            value: value,
                        };
                    });

                    const response = await fetch("/api/update_layer", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            formid,
                            id: formData.id,
                            geojson: JSON.stringify(geojson),
                            dataarr: JSON.stringify(dataArr),
                            style: formData.style || null,
                        }),
                    });

                    if (response.ok) {
                        // Store the current feature ID to re-select after reload
                        const updatedId = formData.id;

                        // Show success message first, then reload and re-select the feature
                        showAlert("อัปเดตข้อมูลสำเร็จ", 'success', 'สำเร็จ', async () => {
                            // Reload data from database
                            await loadExistingFeatures();

                            // Re-select the same feature to show updated values
                            // Find the layer with the updated ID and trigger its click
                            if (drawnItemsRef.current) {
                                drawnItemsRef.current.eachLayer((layer) => {
                                    if (layer.feature?.properties?.id === updatedId) {
                                        // Simulate click to reload the feature data into the form
                                        layer.fire('click');
                                    }
                                });
                            }
                        });
                    } else {
                        showAlert("เกิดข้อผิดพลาดในการอัปเดต", 'error');
                    }
                } catch (error) {
                    console.error("Failed to update feature:", error);
                    showAlert("เกิดข้อผิดพลาดในการอัปเดต", 'error');
                }
            },
            'info',
            'ยืนยันการบันทึก'
        );
    };

    const deleteFeature = async () => {
        if (!formData.id) {
            showAlert("กรุณาเลือกข้อมูลที่ต้องการลบ", 'warning');
            return;
        }

        showConfirm(
            "คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้?",
            async () => {
                // Cancel any pending auto-update
                if (autoUpdateTimeoutRef.current) {
                    clearTimeout(autoUpdateTimeoutRef.current);
                    autoUpdateTimeoutRef.current = null;
                }

                try {
                    const response = await fetch("/api/delete_row", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ formid, id: formData.id }),
                    });

                    if (response.ok) {
                        // Show success alert first, reload data when user closes the alert
                        showAlert("ลบข้อมูลสำเร็จ", 'success', 'สำเร็จ', loadExistingFeatures);
                    } else {
                        showAlert("เกิดข้อผิดพลาดในการลบ", 'error');
                    }
                } catch (error) {
                    console.error("Failed to delete feature:", error);
                    showAlert("เกิดข้อผิดพลาดในการลบ", 'error');
                }
            },
            'danger',
            'ยืนยันการลบ'
        );
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <Navbar />

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content */}
                <div className="flex-1 p-4 overflow-auto">
                    <div className="mb-4">
                        <div className="flex items-center gap-4 mb-2">
                            <button
                                onClick={() => navigate("/manage-data")}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            >
                                <IoHome /> จัดการข้อมูล
                            </button>
                            <h2 className="text-2xl font-bold text-gray-800">
                                {layerInfo ? `เพิ่ม/แก้ไขข้อมูล: ${layerInfo.layername}` : "เพิ่ม/แก้ไขข้อมูล"}
                            </h2>
                            <div className="ml-auto flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="autoSave"
                                        checked={autoSaveEnabled}
                                        onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                                        className="rounded border-gray-300 text-green-500 focus:ring-green-500"
                                    />
                                    <label htmlFor="autoSave" className="text-sm text-gray-700 cursor-pointer">
                                        บันทึกอัตโนมัติหลังวาดรูป
                                    </label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="autoUpdate"
                                        checked={autoUpdateEnabled}
                                        onChange={(e) => setAutoUpdateEnabled(e.target.checked)}
                                        className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                                    />
                                    <label htmlFor="autoUpdate" className="text-sm text-gray-700 cursor-pointer">
                                        อัปเดตอัตโนมัติเมื่อแก้ไข
                                    </label>
                                </div>
                            </div>
                        </div>
                        {saveMessage && (
                            <div className={`px-4 py-2 rounded-lg ${saveMessage.includes("✓") ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                }`}>
                                {saveMessage}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Map */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow p-4 relative z-0">
                                <div
                                    ref={mapRef}
                                    className="w-full h-[600px] rounded-lg relative z-0"
                                    style={{ zIndex: 1 }}
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
                                                onClick={() => {
                                                    // Load existing style if available
                                                    const existingStyle = formData.style ? JSON.parse(formData.style) : {};
                                                    setFeatureStyle(existingStyle);
                                                    setSymbolEditorOpen(true);
                                                }}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                                            >
                                                <IoColorPalette /> กำหนดสัญลักษณ์
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

            {/* Alert Modal */}
            <AlertModal
                isOpen={alertModal.isOpen}
                title={alertModal.title}
                message={alertModal.message}
                variant={alertModal.variant}
                onClose={() => {
                    setAlertModal({ ...alertModal, isOpen: false });
                    // Call the onClose callback if provided (e.g., to reload data)
                    if (alertModal.onClose) alertModal.onClose();
                }}
            />

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                variant={confirmModal.variant}
                onConfirm={() => {
                    setConfirmModal({ ...confirmModal, isOpen: false });
                    if (confirmModal.onConfirm) confirmModal.onConfirm();
                }}
                onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            />

            {/* Symbol Editor Modal */}
            <SymbolEditorModal
                isOpen={symbolEditorOpen}
                geometryType={layerInfo?.layertype}
                style={featureStyle}
                onChange={setFeatureStyle}
                onSave={() => {
                    // Save style to formData so it gets sent with update
                    setFormData(prev => ({
                        ...prev,
                        style: JSON.stringify(featureStyle)
                    }));
                    setSymbolEditorOpen(false);
                    showAlert("บันทึกสัญลักษณ์สำเร็จ กรุณากดอัปเดตข้อมูลเพื่อบันทึกลงฐานข้อมูล", 'success', 'สำเร็จ');
                }}
                onCancel={() => setSymbolEditorOpen(false)}
            />
        </div>
    );
};

export default DataEntry;
