import PropTypes from 'prop-types';
import { IoWarning, IoCheckmarkCircle, IoInformationCircle, IoClose } from 'react-icons/io5';

const ConfirmModal = ({
    isOpen,
    title = 'ยืนยัน',
    message,
    variant = 'warning',
    confirmText = 'ยืนยัน',
    cancelText = 'ยกเลิก',
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    const variants = {
        warning: {
            icon: IoWarning,
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            confirmBtn: 'bg-yellow-500 hover:bg-yellow-600',
        },
        danger: {
            icon: IoWarning,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            confirmBtn: 'bg-red-500 hover:bg-red-600',
        },
        success: {
            icon: IoCheckmarkCircle,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            confirmBtn: 'bg-green-500 hover:bg-green-600',
        },
        info: {
            icon: IoInformationCircle,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            confirmBtn: 'bg-blue-500 hover:bg-blue-600',
        },
    };

    const config = variants[variant] || variants.warning;
    const IconComponent = config.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${config.iconBg}`}>
                            <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    </div>
                    <button
                        onClick={onCancel}
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
                <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-colors font-medium ${config.confirmBtn}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

ConfirmModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    title: PropTypes.string,
    message: PropTypes.string.isRequired,
    variant: PropTypes.oneOf(['warning', 'danger', 'success', 'info']),
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default ConfirmModal;
