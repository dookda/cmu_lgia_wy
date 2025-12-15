import PropTypes from 'prop-types';
import { Text } from '../atoms';

const Spinner = ({
  size = 'md',
  color = 'primary',
  message,
  fullScreen = false,
  className = '',
  ...props
}) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  const colors = {
    primary: 'border-orange-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-500 border-t-transparent',
  };

  const sizeClass = sizes[size] || sizes.md;
  const colorClass = colors[color] || colors.primary;

  const spinner = (
    <div
      className={`spinner rounded-full ${sizeClass} ${colorClass} ${className}`}
      role="status"
      aria-label="Loading"
      {...props}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        {spinner}
        {message && (
          <Text size="sm" color="secondary" className="mt-4">
            {message}
          </Text>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {spinner}
      {message && (
        <Text size="sm" color="secondary">
          {message}
        </Text>
      )}
    </div>
  );
};

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'white', 'gray']),
  message: PropTypes.string,
  fullScreen: PropTypes.bool,
  className: PropTypes.string,
};

export default Spinner;
