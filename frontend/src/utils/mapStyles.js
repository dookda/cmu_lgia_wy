/**
 * Shared map styling utilities for consistent feature rendering
 * between Dashboard (LeafletMap) and DataEntry pages
 */

/**
 * Get default style for a line feature
 * @param {Object} styleObj - The saved style object from the database
 * @returns {Object} - Leaflet style object for LineString
 */
export const getLineStyle = (styleObj) => {
    if (!styleObj) {
        return {
            color: '#3388ff',
            weight: 3,
            opacity: 1,
            dashArray: null,
        };
    }

    return {
        color: styleObj.color || '#3388ff',
        weight: styleObj.weight || 3,
        opacity: styleObj.opacity ?? 1,
        dashArray: styleObj.dashArray || null,
    };
};

/**
 * Get default style for a polygon feature
 * @param {Object} styleObj - The saved style object from the database
 * @returns {Object} - Leaflet style object for Polygon
 */
export const getPolygonStyle = (styleObj) => {
    if (!styleObj) {
        return {
            color: '#3388ff',
            fillColor: '#3388ff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.3,
            dashArray: null,
        };
    }

    return {
        color: styleObj.color || '#3388ff',
        fillColor: styleObj.fillColor || '#3388ff',
        weight: styleObj.weight ?? 2,
        opacity: styleObj.opacity ?? 1,
        fillOpacity: styleObj.fillOpacity ?? 0.3,
        dashArray: styleObj.dashArray || null,
    };
};

/**
 * Get style for a feature based on its geometry type
 * @param {string} geometryType - The geometry type (Point, LineString, Polygon, etc.)
 * @param {Object} styleObj - The saved style object from the database
 * @returns {Object} - Leaflet style object
 */
export const getFeatureStyle = (geometryType, styleObj) => {
    const type = String(geometryType).toLowerCase();

    if (type === 'linestring' || type === 'multilinestring') {
        return getLineStyle(styleObj);
    } else if (type === 'polygon' || type === 'multipolygon') {
        return getPolygonStyle(styleObj);
    }

    // For points, return empty (points use markers, not styles)
    return {};
};

/**
 * Get style for a layer based on its layer type (from layer metadata)
 * @param {string} layerType - The layer type (point, linestring, polygon)
 * @param {Object} styleObj - The saved style object from the database
 * @returns {Object} - Leaflet style object
 */
export const getLayerStyle = (layerType, styleObj) => {
    const type = String(layerType).toLowerCase();

    if (type === 'linestring') {
        return getLineStyle(styleObj);
    } else if (type === 'polygon') {
        return getPolygonStyle(styleObj);
    }

    return {};
};

/**
 * Default circle marker style for points
 */
export const getCircleMarkerStyle = (styleObj) => {
    if (!styleObj) {
        return {
            radius: 8,
            fillColor: '#ff6b35',
            color: '#fff',
            weight: 2,
            fillOpacity: 0.7,
        };
    }

    return {
        radius: styleObj.radius || 8,
        fillColor: styleObj.fillColor || '#ff6b35',
        color: styleObj.color || '#fff',
        weight: styleObj.weight ?? 2,
        fillOpacity: styleObj.fillOpacity ?? 0.7,
    };
};
