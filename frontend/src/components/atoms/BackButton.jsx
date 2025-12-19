import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';

/**
 * BackButton - A consistent back navigation component
 * 
 * @param {string} label - Button text (default: "หน้าหลัก")
 * @param {string} to - Specific destination (optional, defaults to "/")
 * @param {string} fallback - Fallback path if no history (default: "/")
 * @param {string} variant - "card" | "default" | "minimal" | "button" | "iconOnly"
 * @param {string} className - Additional CSS classes
 */
const BackButton = ({
    label = 'หน้าหลัก',
    to = '/',
    fallback = '/',
    variant = 'card',
    className = ''
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (to) {
            navigate(to);
        } else if (window.history.length > 2) {
            navigate(-1);
        } else {
            navigate(fallback);
        }
    };

    // Style variants
    const variants = {
        // Primary card style - left-aligned with light gray background
        card: 'inline-flex items-center gap-3 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-xl transition-all',
        // Simple link style
        default: 'flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors py-2 group',
        // Compact link style
        minimal: 'flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors text-sm',
        // Gray button style
        button: 'flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors',
        // Icon only
        iconOnly: 'p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors',
    };

    const baseClass = variants[variant] || variants.card;

    if (variant === 'iconOnly') {
        return (
            <button
                onClick={handleClick}
                className={`${baseClass} ${className}`}
                title={label}
                aria-label={label}
            >
                <IoArrowBack className="text-xl" />
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            className={`${baseClass} ${className}`}
        >
            <IoArrowBack className={`text-lg ${variant === 'default' ? 'group-hover:-translate-x-1 transition-transform' : ''}`} />
            <span className={variant === 'card' ? 'font-medium' : ''}>{label}</span>
        </button>
    );
};

export default BackButton;
