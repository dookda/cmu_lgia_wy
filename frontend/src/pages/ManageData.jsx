import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/organisms/Navbar";
import { IoLayers, IoTrash, IoAdd } from "react-icons/io5";
import { BackButton } from "../components/atoms";

const ManageData = () => {
    const navigate = useNavigate();
    const [layers, setLayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedLayer, setSelectedLayer] = useState(null);

    useEffect(() => {
        loadLayers();
    }, []);

    const loadLayers = async () => {
        try {
            const response = await fetch("/api/list_layer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const data = await response.json();
            setLayers(data || []);
        } catch (error) {
            console.error("Failed to load layers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedLayer) return;

        try {
            const response = await fetch("/api/delete_layer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ formid: selectedLayer.formid }),
            });

            if (response.ok) {
                setShowDeleteModal(false);
                setSelectedLayer(null);
                loadLayers(); // Reload the list
            } else {
                alert("เกิดข้อผิดพลาดในการลบชั้นข้อมูล");
            }
        } catch (error) {
            console.error("Failed to delete layer:", error);
            alert("เกิดข้อผิดพลาดในการลบชั้นข้อมูล");
        }
    };

    const showDeleteConfirm = (layer) => {
        setSelectedLayer(layer);
        setShowDeleteModal(true);
    };

    const gotoDataEntry = (formid) => {
        navigate(`/data-entry?formid=${formid}`);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <Navbar />

            <div className="flex-1 p-6 overflow-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Back Button */}
                    <BackButton className="mb-4" />

                    <h2 className="text-3xl font-bold text-gray-800 mb-6">จัดการชั้นข้อมูล</h2>

                    {loading ? (
                        <div className="bg-white rounded-lg shadow p-12 text-center">
                            <p className="text-gray-600">กำลังโหลด...</p>
                        </div>
                    ) : layers.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-12 text-center">
                            <IoLayers className="text-5xl text-gray-300 mx-auto mb-3" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                ยังไม่มีชั้นข้อมูล
                            </h3>
                            <p className="text-gray-500 mb-4">
                                คุณยังไม่มีชั้นข้อมูลในระบบ สร้างชั้นข้อมูลแรกของคุณ
                            </p>
                            <button
                                onClick={() => navigate("/create-layer")}
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                สร้างชั้นข้อมูลใหม่
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {layers.map((layer) => (
                                <div key={layer.formid} className="bg-white rounded-lg shadow p-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                        ชั้นข้อมูล: {layer.layername}
                                    </h3>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                                            ผู้สร้าง: {layer.division}
                                        </span>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                                            วันที่สร้าง: {formatDate(layer.ts)}
                                        </span>
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                            เลขอ้างอิง: {layer.formid}
                                        </span>
                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                                            ประเภท: {layer.layertype}
                                        </span>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => gotoDataEntry(layer.formid)}
                                            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                                        >
                                            <IoAdd /> เพิ่ม/แก้ไขข้อมูล
                                        </button>
                                        <button
                                            onClick={() => showDeleteConfirm(layer)}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                        >
                                            <IoTrash /> ลบ
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-semibold mb-4">ยืนยันการลบชั้นข้อมูล</h3>
                        <p className="text-gray-600 mb-6">
                            ยืนยันการลบชั้นข้อมูล{" "}
                            <span className="font-semibold">{selectedLayer?.layername}</span>?
                            <br />
                            <span className="text-red-600 text-sm">
                                การดำเนินการนี้ไม่สามารถย้อนกลับได้
                            </span>
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDelete}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                <IoTrash /> ยืนยัน
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedLayer(null);
                                }}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                                ยกเลิก
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

export default ManageData;
