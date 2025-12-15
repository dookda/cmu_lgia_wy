import PropTypes from 'prop-types';

const Icon = ({
  children,
  size = 'md',
  color = 'current',
  className = '',
  onClick,
  ...props
}) => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10',
  };

  const colors = {
    current: 'text-current',
    primary: 'text-gray-800',
    secondary: 'text-gray-500',
    white: 'text-white',
    brand: 'text-orange-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    info: 'text-blue-600',
  };

  const sizeClass = sizes[size] || sizes.md;
  const colorClass = colors[color] || colors.current;
  const clickableClass = onClick ? 'cursor-pointer hover:opacity-75 transition-opacity' : '';

  return (
    <span
      className={`inline-flex items-center justify-center ${sizeClass} ${colorClass} ${clickableClass} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </span>
  );
};

Icon.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  color: PropTypes.oneOf(['current', 'primary', 'secondary', 'white', 'brand', 'success', 'warning', 'error', 'info']),
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default Icon;
