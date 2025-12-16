import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        division: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    const divisions = [
        "สำนักปลัดเทศบาล",
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.username || formData.username.length < 3) {
            newErrors.username = "อย่างน้อย 3 ตัวอักษร";
        }

        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "กรุณากรอกอีเมลให้ถูกต้อง";
        }

        if (!formData.division) {
            newErrors.division = "กรุณาเลือกหน่วยงาน";
        }

        if (!formData.password || formData.password.length < 4) {
            newErrors.password = "อย่างน้อย 4 ตัวอักษร";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "กำหนดรหัสผ่านให้ตรงกัน";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    division: formData.division,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (response.ok && data.status === "success") {
                setModalMessage("ลงทะเบียนสำเร็จ");
                setRegistrationSuccess(true);
                setShowModal(true);
            } else if (data.message && data.message.includes("already exists")) {
                setModalMessage("ชื่อผู้ใช้งานนี้มีอยู่แล้ว กรุณาเปลี่ยนชื่อผู้ใช้งานแล้วลองอีกครั้ง");
                setRegistrationSuccess(false);
                setShowModal(true);
            } else {
                setModalMessage(data.message || "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
                setRegistrationSuccess(false);
                setShowModal(true);
            }
        } catch (error) {
            console.error("Registration error:", error);
            setModalMessage("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
            setRegistrationSuccess(false);
            setShowModal(true);
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        if (registrationSuccess) {
            navigate("/login");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8">
                        <div className="flex items-center justify-center mb-2">
                            <img
                                src="/logo.png"
                                alt="LGIA Logo"
                                className="h-16 w-16 mr-4"
                                onError={(e) => {
                                    e.target.style.display = "none";
                                }}
                            />
                            <h1 className="text-3xl font-bold text-white">ลงทะเบียน</h1>
                        </div>
                        <p className="text-center text-orange-100">
                            ระบบภูมิสารสนเทศชุมชน (LGIA)
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="space-y-6">
                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ชื่อ-นามสกุล
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                                        errors.username ? "border-red-500" : "border-gray-300"
                                    }`}
                                    placeholder="กรอกชื่อ-นามสกุล"
                                />
                                {errors.username && (
                                    <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    อีเมล
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                                        errors.email ? "border-red-500" : "border-gray-300"
                                    }`}
                                    placeholder="example@email.com"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                                )}
                            </div>

                            {/* Division */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    หน่วยงาน
                                </label>
                                <select
                                    name="division"
                                    value={formData.division}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                                        errors.division ? "border-red-500" : "border-gray-300"
                                    }`}
                                >
                                    <option value="">เลือกหน่วยงาน...</option>
                                    {divisions.map((div) => (
                                        <option key={div} value={div}>
                                            {div}
                                        </option>
                                    ))}
                                </select>
                                {errors.division && (
                                    <p className="mt-1 text-sm text-red-500">{errors.division}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    กำหนดรหัสผ่าน
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                                        errors.password ? "border-red-500" : "border-gray-300"
                                    }`}
                                    placeholder="อย่างน้อย 4 ตัวอักษร"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    กำหนดรหัสผ่านอีกครั้ง
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                                        errors.confirmPassword ? "border-red-500" : "border-gray-300"
                                    }`}
                                    placeholder="ยืนยันรหัสผ่าน"
                                />
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full mt-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition shadow-lg"
                        >
                            ลงทะเบียน
                        </button>

                        {/* Login Link */}
                        <div className="mt-6 text-center">
                            <p className="text-gray-600">
                                มีบัญชีอยู่แล้ว?{" "}
                                <Link
                                    to="/login"
                                    className="text-orange-600 hover:text-orange-700 font-medium"
                                >
                                    เข้าสู่ระบบ
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
                        <p className="text-lg text-gray-800 mb-4">{modalMessage}</p>
                        <button
                            onClick={handleModalClose}
                            className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
                        >
                            ตกลง
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;
