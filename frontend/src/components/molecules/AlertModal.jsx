import PropTypes from 'prop-types';
import { IoCheckmarkCircle, IoWarning, IoCloseCircle, IoInformationCircle, IoClose } from 'react-icons/io5';

const AlertModal = ({
    isOpen,
    title,
    message,
    variant = 'info',
    buttonText = 'ตกลง',
    onClose,
}) => {
    if (!isOpen) return null;

    const variants = {
        success: {
            icon: IoCheckmarkCircle,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            button: 'bg-green-500 hover:bg-green-600',
        },
        warning: {
            icon: IoWarning,
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            button: 'bg-yellow-500 hover:bg-yellow-600',
        },
        error: {
            icon: IoCloseCircle,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            button: 'bg-red-500 hover:bg-red-600',
        },
        info: {
            icon: IoInformationCircle,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            button: 'bg-blue-500 hover:bg-blue-600',
        },
    };

    const config = variants[variant] || variants.info;
    const IconComponent = config.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${config.iconBg}`}>
                            <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">{title || 'แจ้งเตือน'}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <IoClose className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-4">
                    <p className="text-gray-600">{message}</p>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className={`w-full px-4 py-2.5 text-white rounded-lg transition-colors font-medium ${config.button}`}
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

AlertModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    title: PropTypes.string,
    message: PropTypes.string.isRequired,
    variant: PropTypes.oneOf(['success', 'warning', 'error', 'info']),
    buttonText: PropTypes.string,
    onClose: PropTypes.func.isRequired,
};

export default AlertModal;
