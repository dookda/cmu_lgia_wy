import React, { useState } from 'react';
import { IoExpand, IoClose } from 'react-icons/io5';

/**
 * Check if a string is a valid base64 image
 * @param {string} value - The value to check
 * @returns {boolean} - True if the value is a base64 image string
 */
export const isBase64Image = (value) => {
    if (!value || typeof value !== 'string') return false;

    // Check for data URL format with image mime type
    if (value.startsWith('data:image/')) {
        return true;
    }

    // Check for raw base64 that could be an image (common patterns)
    // Base64 images typically start with these patterns when decoded
    const base64Patterns = [
        '/9j/',  // JPEG
        'iVBOR', // PNG
        'R0lGO', // GIF
        'UklGR', // WEBP
        'Qk0',   // BMP
    ];

    // Only check if it looks like base64 (long string with base64 chars)
    if (value.length > 100 && /^[A-Za-z0-9+/=]+$/.test(value.substring(0, 100))) {
        for (const pattern of base64Patterns) {
            if (value.startsWith(pattern)) {
                return true;
            }
        }
    }

    return false;
};

/**
 * Get the proper image src for a base64 value
 * @param {string} value - The base64 value
 * @returns {string} - The proper data URL for the image
 */
export const getBase64ImageSrc = (value) => {
    if (!value) return '';

    // Already a data URL
    if (value.startsWith('data:image/')) {
        return value;
    }

    // Detect image type from base64 content
    if (value.startsWith('/9j/')) {
        return `data:image/jpeg;base64,${value}`;
    } else if (value.startsWith('iVBOR')) {
        return `data:image/png;base64,${value}`;
    } else if (value.startsWith('R0lGO')) {
        return `data:image/gif;base64,${value}`;
    } else if (value.startsWith('UklGR')) {
        return `data:image/webp;base64,${value}`;
    } else if (value.startsWith('Qk0')) {
        return `data:image/bmp;base64,${value}`;
    }

    // Default to JPEG if unknown
    return `data:image/jpeg;base64,${value}`;
};

/**
 * AttributeValue component - renders attribute values with special handling for images
 */
const AttributeValue = ({ value, type, className = '' }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Handle date type
    if (type === 'date' && value && value !== '-') {
        try {
            return (
                <span className={className}>
                    {new Date(value).toLocaleDateString('th-TH')}
                </span>
            );
        } catch {
            return <span className={className}>{value}</span>;
        }
    }

    // Handle base64 images
    if (isBase64Image(value)) {
        const imageSrc = getBase64ImageSrc(value);

        return (
            <>
                <div className="relative group">
                    <img
                        src={imageSrc}
                        alt="Attribute image"
                        className="max-w-full max-h-48 rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setIsModalOpen(true)}
                    />
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="ขยายใหญ่"
                    >
                        <IoExpand className="text-sm" />
                    </button>
                </div>

                {/* Full-size image modal */}
                {isModalOpen && (
                    <div
                        className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <div className="relative max-w-[90vw] max-h-[90vh]">
                            <img
                                src={imageSrc}
                                alt="Attribute image (full size)"
                                className="max-w-full max-h-[90vh] rounded-lg"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
                            >
                                <IoClose className="text-xl" />
                            </button>
                        </div>
                    </div>
                )}
            </>
        );
    }

    // Default text rendering
    return <span className={className}>{value || '-'}</span>;
};

export default AttributeValue;
