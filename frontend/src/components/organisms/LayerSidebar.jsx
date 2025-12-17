import { useState, useEffect, useCallback, memo } from "react";
import { IoChevronDown, IoChevronForward } from "react-icons/io5";

const DIVISIONS = [
    { id: "deputy", name: "สำนักปลัดเทศบาล" },
    { id: "deputy_operation", name: "สำนักปลัดฝ่ายอำนวยการ" },
    { id: "deputy_law", name: "สำนักปลัดฝ่ายปกครองงานนิติการ" },
    { id: "deputy_disaster", name: "สำนักปลัดฝ่ายปกครองงานป้องกันบรรเทาสาธารณภัย" },
    { id: "deputy_reg", name: "สำนักปลัดฝ่ายปกครองงานทะเบียนราษฎร" },
    { id: "deputy_community", name: "สำนักปลัดฝ่ายพัฒนาชุมชน" },
    { id: "treasury", name: "กองคลัง" },
    { id: "civil", name: "กองช่าง" },
    { id: "health", name: "กองสาธารณสุขและสิ่งแวดล้อม" },
    { id: "education", name: "กองการศึกษา" },
    { id: "deputy_policy", name: "สำนักปลัดฝ่ายอำนวยการงานวิเคราะห์นโยบายและแผน" },
    { id: "deputy_travel", name: "สำนักปลัดฝ่ายอำนวยการงานส่งเสริมการท่องเที่ยวและประชาสัมพันธ์" },
];

const getDivisionId = (divisionName) => {
    const division = DIVISIONS.find((d) => d.name === divisionName);
    return division ? division.id : null;
};

// Memoized layer item to prevent unnecessary re-renders
const LayerItem = memo(({ layer, isChecked, onToggle }) => {
    const handleChange = useCallback((e) => {
        e.stopPropagation();
        onToggle(layer.formid, layer.layertype);
    }, [layer.formid, layer.layertype, onToggle]);

    return (
        <div className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 py-0.5">
            <input
                type="checkbox"
                checked={isChecked}
                onChange={handleChange}
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
            />
            <span className="truncate cursor-pointer" onClick={handleChange}>
                {layer.layername}
            </span>
        </div>
    );
});

LayerItem.displayName = "LayerItem";

const LayerSidebar = ({ onLayerToggle, checkedLayers = [] }) => {
    const [layers, setLayers] = useState([]);
    const [expandedDivisions, setExpandedDivisions] = useState({});
    const [mainExpanded, setMainExpanded] = useState(true);

    useEffect(() => {
        const fetchLayers = async () => {
            try {
                const response = await fetch("/api/list_layer", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                });

                if (!response.ok) {
                    console.error(`Failed to fetch layers: ${response.status}`);
                    setLayers([]);
                    return;
                }

                const data = await response.json();
                setLayers(data || []);
            } catch (error) {
                console.error("Failed to fetch layers:", error);
                setLayers([]);
            }
        };
        fetchLayers();
    }, []);

    const toggleDivision = useCallback((divisionId) => {
        setExpandedDivisions((prev) => ({
            ...prev,
            [divisionId]: !prev[divisionId],
        }));
    }, []);

    const layersByDivision = DIVISIONS.map((div) => ({
        ...div,
        layers: layers.filter((layer) => getDivisionId(layer.division) === div.id),
    })).filter((div) => div.layers.length > 0);

    // Convert checkedLayers to a Set for O(1) lookup
    const checkedSet = new Set(checkedLayers.map(String));

    return (
        <div className="p-3">
            <button
                onClick={() => setMainExpanded(!mainExpanded)}
                className="flex items-center gap-2 w-full text-left font-semibold text-gray-700 hover:text-orange-600 transition-colors py-2"
            >
                {mainExpanded ? <IoChevronDown /> : <IoChevronForward />}
                ชั้นข้อมูลแผนที่
            </button>

            {mainExpanded && (
                <div className="pl-2 space-y-1">
                    {layersByDivision.map((division) => (
                        <div key={division.id} className="border-l-2 border-gray-200 pl-2">
                            <button
                                onClick={() => toggleDivision(division.id)}
                                className="flex items-center gap-2 w-full text-left text-sm text-gray-600 hover:text-orange-500 py-1 transition-colors"
                            >
                                {expandedDivisions[division.id] ? (
                                    <IoChevronDown className="text-xs" />
                                ) : (
                                    <IoChevronForward className="text-xs" />
                                )}
                                <span className="truncate">{division.name}</span>
                            </button>

                            {expandedDivisions[division.id] && (
                                <div className="pl-4 space-y-1">
                                    {division.layers.map((layer) => (
                                        <LayerItem
                                            key={layer.formid}
                                            layer={layer}
                                            isChecked={checkedSet.has(String(layer.formid))}
                                            onToggle={onLayerToggle}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LayerSidebar;
