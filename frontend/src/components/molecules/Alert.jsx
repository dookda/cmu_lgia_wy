import PropTypes from 'prop-types';
import { Text, Icon } from '../atoms';
import { IoCheckmarkCircle, IoWarning, IoCloseCircle, IoInformationCircle } from 'react-icons/io5';

const Alert = ({
  children,
  variant = 'info',
  onClose,
  className = '',
  ...props
}) => {
  const variants = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-600',
      icon: IoCheckmarkCircle,
      iconColor: 'success',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-600',
      icon: IoWarning,
      iconColor: 'warning',
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-600',
      icon: IoCloseCircle,
      iconColor: 'error',
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-600',
      icon: IoInformationCircle,
      iconColor: 'info',
    },
  };

  const config = variants[variant] || variants.info;
  const IconComponent = config.icon;

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 border rounded-lg ${config.container} ${className}`}
      role="alert"
      {...props}
    >
      <Icon color={config.iconColor} size="lg">
        <IconComponent />
      </Icon>
      <Text size="sm" className="flex-1">
        {children}
      </Text>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current hover:opacity-70 transition-opacity"
          aria-label="Close alert"
        >
          <Icon size="sm">
            <IoCloseCircle />
          </Icon>
        </button>
      )}
    </div>
  );
};

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['success', 'warning', 'error', 'info']),
  onClose: PropTypes.func,
  className: PropTypes.string,
};

export default Alert;
