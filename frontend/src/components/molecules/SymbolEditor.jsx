import React from 'react';

/**
 * SymbolEditor Component
 * 
 * Provides controls for editing map feature symbols based on geometry type.
 * Supports point, line, and polygon geometries with appropriate styling options.
 */
const SymbolEditor = ({ geometryType, style, onChange }) => {
    const defaultStyle = {
        // Point styles
        markerType: 'marker',
        shape: 'circle',
        icon: 'fa-map-marker',
        iconColor: 'red',
        radius: 8,
        // Common styles
        color: '#3388ff',
        fillColor: '#3388ff',
        weight: 3,
        opacity: 0.8,
        fillOpacity: 0.5,
        dashArray: '0',
        ...style
    };

    const handleChange = (key, value) => {
        onChange({ ...defaultStyle, ...style, [key]: value });
    };

    // Color presets for marker icons
    const colorPresets = [
        { value: 'red', label: 'สีแดง' },
        { value: 'orange-dark', label: 'สีส้มเข้ม' },
        { value: 'orange', label: 'สีส้ม' },
        { value: 'yellow', label: 'สีเหลือง' },
        { value: 'blue-dark', label: 'สีน้ำเงินเข้ม' },
        { value: 'cyan', label: 'สีฟ้า' },
        { value: 'purple', label: 'สีม่วงเข้ม' },
        { value: 'violet', label: 'สีม่วง' },
        { value: 'pink', label: 'สีชมพู' },
        { value: 'green-dark', label: 'สีเขียวเข้ม' },
        { value: 'green', label: 'สีเขียว' },
        { value: 'green-light', label: 'สีเขียวอ่อน' },
        { value: 'black', label: 'สีดำ' },
        { value: 'white', label: 'สีขาว' },
    ];

    // Icon presets
    const iconPresets = [
        'fa-home', 'fa-building', 'fa-bed', 'fa-university', 'fa-hospital-o',
        'fa-ambulance', 'fa-subway', 'fa-train', 'fa-plane', 'fa-taxi',
        'fa-tree', 'fa-archive', 'fa-coffee', 'fa-cutlery', 'fa-glass',
        'fa-beer', 'fa-shopping-cart', 'fa-shopping-bag', 'fa-shopping-basket',
        'fa-bicycle', 'fa-bus', 'fa-motorcycle', 'fa-road', 'fa-ship',
        'fa-spoon', 'fa-fort-awesome', 'fa-car', 'fa-map-marker', 'fa-map',
        'fa-compass', 'fa-globe', 'fa-anchor', 'fa-industry', 'fa-graduation-cap',
        'fa-life-ring', 'fa-heart', 'fa-hotel', 'fa-map-pin', 'fa-map-signs',
        'fa-paw', 'fa-suitcase', 'fa-ticket'
    ];

    // Line type presets (dash patterns)
    const lineTypes = [
        { value: '0', label: 'เส้นทึบ' },
        { value: '5,5', label: 'เส้นประ 1' },
        { value: '10,5', label: 'เส้นประ 2' },
        { value: '15,5', label: 'เส้นประ 3' },
        { value: '20,5,5,5', label: 'เส้นประ 4' },
    ];

    const normalizedType = geometryType?.toLowerCase() || 'point';

    return (
        <div className="space-y-4">
            {/* Point/Marker Options */}
            {normalizedType === 'point' && (
                <div className="space-y-4">
                    {/* Marker Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            สัญลักษณ์
                        </label>
                        <select
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            value={defaultStyle.markerType}
                            onChange={(e) => handleChange('markerType', e.target.value)}
                        >
                            <option value="marker">Marker</option>
                            <option value="markerIcon">Marker Icon</option>
                            <option value="circleMarker">Circle Marker</option>
                        </select>
                    </div>

                    {/* Marker Icon Section */}
                    {defaultStyle.markerType === 'markerIcon' && (
                        <>
                            {/* Shape */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    รูปทรง
                                </label>
                                <select
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    value={defaultStyle.shape}
                                    onChange={(e) => handleChange('shape', e.target.value)}
                                >
                                    <option value="circle">วงกลม</option>
                                    <option value="square">สี่เหลี่ยม</option>
                                    <option value="star">ดาว</option>
                                    <option value="penta">ห้าเหลี่ยม</option>
                                </select>
                            </div>

                            {/* Icon Color */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    สี
                                </label>
                                <select
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    value={defaultStyle.iconColor}
                                    onChange={(e) => handleChange('iconColor', e.target.value)}
                                >
                                    {colorPresets.map((color) => (
                                        <option key={color.value} value={color.value}>
                                            {color.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Icon Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ไอคอน
                                </label>
                                <div className="grid grid-cols-8 gap-1 p-2 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
                                    {iconPresets.map((icon) => (
                                        <button
                                            key={icon}
                                            type="button"
                                            className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${defaultStyle.icon === icon ? 'bg-primary-100 ring-2 ring-primary-500' : ''
                                                }`}
                                            onClick={() => handleChange('icon', icon)}
                                        >
                                            <i className={`fa ${icon}`}></i>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Circle Marker Section */}
                    {defaultStyle.markerType === 'circleMarker' && (
                        <>
                            {/* Radius */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ขนาด: {defaultStyle.radius}px
                                </label>
                                <input
                                    type="range"
                                    min="5"
                                    max="30"
                                    value={defaultStyle.radius}
                                    onChange={(e) => handleChange('radius', parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            {/* Border Width */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ขนาดเส้นขอบ: {defaultStyle.weight}px
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    value={defaultStyle.weight}
                                    onChange={(e) => handleChange('weight', parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            {/* Border Color */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    สีเส้นขอบ
                                </label>
                                <input
                                    type="color"
                                    value={defaultStyle.color}
                                    onChange={(e) => handleChange('color', e.target.value)}
                                    className="w-full h-10 rounded-lg border-gray-300"
                                />
                            </div>

                            {/* Fill Color */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    สีพื้น
                                </label>
                                <input
                                    type="color"
                                    value={defaultStyle.fillColor}
                                    onChange={(e) => handleChange('fillColor', e.target.value)}
                                    className="w-full h-10 rounded-lg border-gray-300"
                                />
                            </div>

                            {/* Fill Opacity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ความโปร่งใส: {Math.round(defaultStyle.fillOpacity * 100)}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={defaultStyle.fillOpacity}
                                    onChange={(e) => handleChange('fillOpacity', parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Line Options */}
            {normalizedType === 'linestring' && (
                <div className="space-y-4">
                    {/* Line Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ชนิดเส้น
                        </label>
                        <select
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            value={defaultStyle.dashArray}
                            onChange={(e) => handleChange('dashArray', e.target.value)}
                        >
                            {lineTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Line Width */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ขนาดเส้น: {defaultStyle.weight}px
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="15"
                            value={defaultStyle.weight}
                            onChange={(e) => handleChange('weight', parseInt(e.target.value))}
                            className="w-full"
                        />
                    </div>

                    {/* Line Color */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            สีเส้น
                        </label>
                        <input
                            type="color"
                            value={defaultStyle.color}
                            onChange={(e) => handleChange('color', e.target.value)}
                            className="w-full h-10 rounded-lg border-gray-300"
                        />
                    </div>

                    {/* Line Opacity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ความโปร่งใส: {Math.round(defaultStyle.opacity * 100)}%
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={defaultStyle.opacity}
                            onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
                            className="w-full"
                        />
                    </div>
                </div>
            )}

            {/* Polygon Options */}
            {normalizedType === 'polygon' && (
                <div className="space-y-4">
                    {/* Border Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ชนิดเส้นขอบ
                        </label>
                        <select
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            value={defaultStyle.dashArray}
                            onChange={(e) => handleChange('dashArray', e.target.value)}
                        >
                            {lineTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Border Width */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ขนาดเส้นขอบ: {defaultStyle.weight}px
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            value={defaultStyle.weight}
                            onChange={(e) => handleChange('weight', parseInt(e.target.value))}
                            className="w-full"
                        />
                    </div>

                    {/* Border Color */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            สีเส้นขอบ
                        </label>
                        <input
                            type="color"
                            value={defaultStyle.color}
                            onChange={(e) => handleChange('color', e.target.value)}
                            className="w-full h-10 rounded-lg border-gray-300"
                        />
                    </div>

                    {/* Fill Color */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            สีพื้น
                        </label>
                        <input
                            type="color"
                            value={defaultStyle.fillColor}
                            onChange={(e) => handleChange('fillColor', e.target.value)}
                            className="w-full h-10 rounded-lg border-gray-300"
                        />
                    </div>

                    {/* Fill Opacity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ความโปร่งใส: {Math.round(defaultStyle.fillOpacity * 100)}%
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={defaultStyle.fillOpacity}
                            onChange={(e) => handleChange('fillOpacity', parseFloat(e.target.value))}
                            className="w-full"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SymbolEditor;
