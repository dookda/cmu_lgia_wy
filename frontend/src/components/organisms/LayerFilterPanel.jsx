import { useState, useEffect } from "react";
import axios from "axios";

const LayerFilterPanel = ({ layers, onLayerSelect, onSearch }) => {
    const [selectedLayer, setSelectedLayer] = useState("");
    const [selectedColumn, setSelectedColumn] = useState("");
    const [selectedKeyword, setSelectedKeyword] = useState("");
    const [columns, setColumns] = useState([]);
    const [keywords, setKeywords] = useState([]);

    useEffect(() => {
        if (selectedLayer) {
            axios
                .post("/api/load_column_description", { formid: selectedLayer })
                .then((res) => {
                    setColumns(res.data || []);
                    setSelectedColumn("");
                    setKeywords([]);
                    setSelectedKeyword("");
                })
                .catch((err) => console.error("Failed to load columns:", err));
        }
    }, [selectedLayer]);

    useEffect(() => {
        if (selectedLayer && selectedColumn) {
            axios
                .post("/api/load_by_column_id", {
                    formid: selectedLayer,
                    columnid: selectedColumn,
                })
                .then((res) => {
                    const uniqueKeywords = res.data?.map((row) => row[selectedColumn]) || [];
                    setKeywords([...new Set(uniqueKeywords)]);
                    setSelectedKeyword("");
                })
                .catch((err) => console.error("Failed to load keywords:", err));
        }
    }, [selectedColumn, selectedLayer]);

    const handleLayerChange = (formid) => {
        setSelectedLayer(formid);
        onLayerSelect?.(formid);
    };

    const handleSearch = () => {
        onSearch?.(selectedLayer, selectedColumn, selectedKeyword);
    };

    return (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 space-y-3">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    เลือกชั้นข้อมูล
                </label>
                <select
                    value={selectedLayer}
                    onChange={(e) => handleLayerChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                    <option value="">เลือก...</option>
                    {layers.map((layer) => (
                        <option key={layer.formid} value={layer.formid}>
                            {layer.layername}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    เลือกคอลัมน์
                </label>
                <select
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                    disabled={!selectedLayer}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
                >
                    <option value="">เลือก...</option>
                    {columns.map((col) => (
                        <option key={col.col_id} value={col.col_id}>
                            {col.col_name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    คำที่ต้องการค้นหา
                </label>
                <select
                    value={selectedKeyword}
                    onChange={(e) => {
                        setSelectedKeyword(e.target.value);
                        handleSearch();
                    }}
                    disabled={!selectedColumn}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
                >
                    <option value="">ทั้งหมด</option>
                    {keywords.map((kw, idx) => (
                        <option key={idx} value={kw}>
                            {kw}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default LayerFilterPanel;
