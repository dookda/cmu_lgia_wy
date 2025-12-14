import React, { useState, useEffect } from "react";
import axios from "axios";
import Map from "../components/organisms/Map";
import Navbar from "../components/organisms/Navbar";
import LayerSidebar from "../components/organisms/LayerSidebar";
import LayerFilterPanel from "../components/organisms/LayerFilterPanel";
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
} from "react-icons/io5";

const Home = () => {
    const { user } = useAuth();
    const [checkedLayers, setCheckedLayers] = useState([]);
    const [allLayers, setAllLayers] = useState([]);

    useEffect(() => {
        axios
            .post("/api/list_layer")
            .then((res) => setAllLayers(res.data || []))
            .catch((err) => console.error("Failed to load layers:", err));
    }, []);

    const handleLayerToggle = (formid, layertype) => {
        setCheckedLayers((prev) => {
            const exists = prev.find((l) => l.formid === formid);
            if (exists) {
                return prev.filter((l) => l.formid !== formid);
            } else {
                return [...prev, { formid, layertype }];
            }
        });
    };

    const menuItems = [
        { path: "/report", icon: IoDocumentText, label: "รายงาน", roles: ["admin", "editor", "user"] },
        { path: "/", icon: IoMap, label: "ชั้นข้อมูลแผนที่", roles: ["admin", "editor", "user"] },
        { path: "/upload", icon: IoCloudUpload, label: "นำเข้าข้อมูลจาก CSV", roles: ["admin", "editor"] },
        { path: "/create-layer", icon: IoLayers, label: "สร้างชั้นข้อมูล", roles: ["admin", "editor"] },
        { path: "/manage-data", icon: IoSettings, label: "จัดการข้อมูล", roles: ["admin", "editor"] },
        { path: "/users", icon: IoPeople, label: "จัดการผู้ใช้", roles: ["admin"] },
        { path: "/docs", icon: IoBook, label: "คู่มือการใช้งาน", roles: ["admin", "editor", "user"] },
    ];

    const filteredMenu = menuItems.filter(
        (item) => !user || item.roles.includes(user.role) || item.roles.includes("user")
    );

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
                            checkedLayers={checkedLayers.map((l) => l.formid)}
                        />
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 flex">
                        {/* Map */}
                        <div className="flex-1 relative">
                            <Map checkedLayers={checkedLayers} />
                        </div>

                        {/* Right Panel */}
                        <div className="w-80 p-4 overflow-y-auto bg-gray-50 border-l border-gray-200">
                            <LayerFilterPanel
                                layers={allLayers}
                                onLayerSelect={(formid) => {
                                    // Could add layer to map or show data
                                }}
                                onSearch={(formid, column, keyword) => {
                                    // Could filter the data table
                                }}
                            />
                        </div>
                    </div>

                    {/* Data Table Placeholder */}
                    <div className="h-64 bg-white border-t border-gray-200 p-4 overflow-auto">
                        <div className="bg-gray-100 rounded-lg h-full flex items-center justify-center text-gray-400">
                            <p>เลือกชั้นข้อมูลเพื่อแสดงตาราง</p>
                        </div>
                    </div>
                </main>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-2 px-4 text-center text-sm text-gray-500">
                © 2024 ระบบภูมิสารสนเทศชุมชน (LGIA)
            </footer>
        </div>
    );
};

export default Home;
