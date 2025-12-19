import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/organisms/Navbar";
import { IoCloudUpload, IoCheckmarkCircle, IoWarning, IoDocument } from "react-icons/io5";
import { BackButton } from "../components/atoms";

const Upload = () => {
    const navigate = useNavigate();
    const [division, setDivision] = useState("");
    const [layername, setLayername] = useState("");
    const [layertype, setLayertype] = useState("point");
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

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

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (!selectedFile.name.endsWith(".csv")) {
                alert("กรุณาเลือกไฟล์ CSV เท่านั้น");
                setFile(null);
                e.target.value = "";
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert("กรุณาเลือกไฟล์");
            return;
        }

        if (!division || !layername || !layertype) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("division", division);
            formData.append("layername", layername);
            formData.append("layertype", layertype);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                alert("อัปโหลดไฟล์สำเร็จ");
                // Reset form
                setDivision("");
                setLayername("");
                setLayertype("point");
                setFile(null);
                document.getElementById("fileInput").value = "";
            } else {
                const errorText = await response.text();
                alert("เกิดข้อผิดพลาดในการอัปโหลด: " + errorText);
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("เกิดข้อผิดพลาดในการอัปโหลดไฟล์");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <Navbar />

            <div className="flex-1 p-6 overflow-auto">
                <div className="max-w-6xl mx-auto">
                    {/* Back Button */}
                    <BackButton className="mb-4" />

                    <h2 className="text-3xl font-bold text-gray-800 mb-6">นำเข้าข้อมูลจาก CSV</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Upload Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-xl font-semibold mb-4">ข้อมูลชั้นข้อมูล</h3>

                                <div className="space-y-4">
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

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ไฟล์ CSV <span className="text-red-500">*</span>
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
                                            <input
                                                id="fileInput"
                                                type="file"
                                                accept=".csv"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <label htmlFor="fileInput" className="cursor-pointer block text-center">
                                                {file ? (
                                                    <div className="flex items-center justify-center gap-3">
                                                        <IoDocument className="text-3xl text-green-600" />
                                                        <div className="text-left">
                                                            <p className="font-medium text-gray-800">
                                                                {file.name}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {(file.size / 1024).toFixed(2)} KB
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <IoCloudUpload className="text-5xl text-gray-400 mx-auto mb-3" />
                                                        <p className="text-gray-600">คลิกเพื่อเลือกไฟล์ CSV</p>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            หรือลากไฟล์มาวางที่นี่
                                                        </p>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleUpload}
                                        disabled={uploading || !file || !division || !layername}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        <IoCloudUpload />
                                        {uploading ? "กำลังอัปโหลด..." : "อัปโหลดไฟล์"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow p-6 mb-4">
                                <h3 className="text-lg font-semibold mb-4">คำแนะนำ</h3>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-start gap-2 mb-2">
                                            <IoCheckmarkCircle className="text-green-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">
                                                    รูปแบบไฟล์
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    ไฟล์ต้องเป็น CSV เท่านั้น
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-start gap-2 mb-2">
                                            <IoCheckmarkCircle className="text-green-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">
                                                    คอลัมน์พิกัด
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    ต้องมีคอลัมน์ latitude และ longitude สำหรับข้อมูลจุด
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-start gap-2 mb-2">
                                            <IoCheckmarkCircle className="text-green-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">Encoding</p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    แนะนำให้ใช้ UTF-8 เพื่อรองรับภาษาไทย
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex items-start gap-2">
                                            <IoWarning className="text-yellow-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">
                                                    ข้อควรระวัง
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    ตรวจสอบความถูกต้องของข้อมูลก่อนอัปโหลด
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-gray-700 text-center">
                                    ต้องการความช่วยเหลือ?
                                    <br />
                                    ดูคู่มือการใช้งาน
                                </p>
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

export default Upload;
