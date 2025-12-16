import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/organisms/Navbar";
import { IoAdd, IoTrash, IoSave, IoArrowBack } from "react-icons/io5";

const CreateLayer = () => {
    const navigate = useNavigate();
    const [division, setDivision] = useState("");
    const [layername, setLayername] = useState("");
    const [layertype, setLayertype] = useState("point");
    const [columnname, setColumnname] = useState("");
    const [columntype, setColumntype] = useState("");
    const [columndesc, setColumndesc] = useState("");
    const [columns, setColumns] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [createdFormid, setCreatedFormid] = useState("");

    const divisions = [
        "สำนักปลัดฝ่ายอำนวยการ",
        "สำนักปลัดฝ่ายปกครองงานนิติการ",
        "สำนักปลัดฝ่ายปกครองงานป้องกันบรรเทาสาธารณภัย",
        "สำนักปลัดฝ่ายปกครองงานทะเบียนราษฎร",
        "สำนักปลัดฝ่ายพัฒนาชุมชน",
        "กองคลัง",
        "กองช่าง",
        "กองสาธารณสุขและสิ่งแวดล้อม",
        "กองการศึกษา",
        "สำนักปลัดฝ่ายอำนวยการงานวิเคราะห์นโยบายและแผน",
        "สำนักปลัดฝ่ายอำนวยการงานส่งเสริมการท่องเที่ยวและประชาสัมพันธ์",
    ];

    const addColumn = () => {
        if (!columnname || !columntype) {
            alert("กรุณากรอกชื่อคอลัมน์และเลือกชนิดข้อมูล");
            return;
        }

        setColumns([
            ...columns,
            {
                column_name: columnname,
                column_type: columntype,
                column_desc: columndesc,
            },
        ]);

        // Clear form
        setColumnname("");
        setColumntype("");
        setColumndesc("");
    };

    const deleteColumn = (index) => {
        setColumns(columns.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!division || !layername || !layertype) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        if (columns.length === 0) {
            alert("กรุณาเพิ่มคอลัมน์อย่างน้อย 1 คอลัมน์");
            return;
        }

        try {
            const response = await fetch("/api/create_table", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    division,
                    layername,
                    layertype,
                    columes: columns,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setCreatedFormid(data.formid);
                setShowModal(true);
            } else {
                alert("เกิดข้อผิดพลาดในการสร้างชั้นข้อมูล");
            }
        } catch (error) {
            console.error("Failed to create layer:", error);
            alert("เกิดข้อผิดพลาดในการสร้างชั้นข้อมูล");
        }
    };

    const resetForm = () => {
        setDivision("");
        setLayername("");
        setLayertype("point");
        setColumnname("");
        setColumntype("");
        setColumndesc("");
        setColumns([]);
    };

    const gotoDataEntry = () => {
        navigate(`/data-entry?formid=${createdFormid}`);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <Navbar />

            <div className="flex-1 p-6 overflow-auto">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-6 flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            <IoArrowBack /> กลับ
                        </button>
                        <h2 className="text-3xl font-bold text-gray-800">สร้างชั้นข้อมูล</h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Layer Information */}
                        <div className="bg-white rounded-lg shadow mb-6 p-6">
                            <h3 className="text-xl font-semibold mb-4">ข้อมูลชั้นข้อมูล</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ชื่อหน่วยงาน <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={division}
                                        onChange={(e) => setDivision(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">เลือก...</option>
                                        {divisions.map((div) => (
                                            <option key={div} value={div}>
                                                {div}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ชื่อชั้นข้อมูล <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={layername}
                                        onChange={(e) => setLayername(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="ระบุ..."
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ประเภทของชั้นข้อมูล <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={layertype}
                                        onChange={(e) => setLayertype(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="point">จุด (point)</option>
                                        <option value="linestring">เส้น (Polyline)</option>
                                        <option value="polygon">รูปปิด (Polygon)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Column Builder */}
                        <div className="bg-white rounded-lg shadow mb-6 p-6">
                            <h3 className="text-xl font-semibold mb-4">สร้างคอลัมน์</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ชื่อคอลัมน์
                                    </label>
                                    <input
                                        type="text"
                                        value={columnname}
                                        onChange={(e) => setColumnname(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="ระบุ..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ชนิดข้อมูล
                                    </label>
                                    <select
                                        value={columntype}
                                        onChange={(e) => setColumntype(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">เลือก...</option>
                                        <option value="text">ตัวอักษร</option>
                                        <option value="numeric">ตัวเลข</option>
                                        <option value="date">วันที่</option>
                                        <option value="file">รูปภาพ</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        คำอธิบาย/หน่วย
                                    </label>
                                    <input
                                        type="text"
                                        value={columndesc}
                                        onChange={(e) => setColumndesc(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="ระบุ..."
                                    />
                                </div>

                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={addColumn}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                    >
                                        <IoAdd /> เพิ่มคอลัมน์
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Columns Table */}
                        <div className="bg-white rounded-lg shadow mb-6 p-6">
                            <h3 className="text-xl font-semibold mb-4">รายการคอลัมน์</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                                ลำดับ
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                                คอลัมน์
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                                ชนิดข้อมูล
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                                คำอธิบาย/หน่วย
                                            </th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {columns.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="5"
                                                    className="px-4 py-8 text-center text-gray-500"
                                                >
                                                    ยังไม่มีคอลัมน์ กรุณาเพิ่มคอลัมน์
                                                </td>
                                            </tr>
                                        ) : (
                                            columns.map((col, index) => (
                                                <tr key={index} className="border-b hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                        {col.column_name}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                        {col.column_type}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                        {col.column_desc || "-"}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteColumn(index)}
                                                            className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                                                        >
                                                            <IoTrash /> ลบ
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 flex gap-4">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                                >
                                    <IoSave /> สร้างชั้นข้อมูล
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
                                >
                                    ล้างข้อมูล
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Success Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-semibold mb-4">สร้างชั้นข้อมูลสำเร็จ</h3>
                        <p className="text-gray-600 mb-6">
                            ชั้นข้อมูล "{layername}" ถูกสร้างเรียบร้อยแล้ว
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={gotoDataEntry}
                                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                ไปยังหน้าเพิ่มข้อมูล
                            </button>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
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

export default CreateLayer;
