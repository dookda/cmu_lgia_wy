import PropTypes from 'prop-types';

const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
  hoverable = false,
  ...props
}) => {
  const baseStyles = 'bg-white rounded-2xl';

  const variants = {
    default: 'shadow-md',
    elevated: 'shadow-2xl',
    outline: 'border border-gray-200',
    glass: 'glass shadow-lg',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const hoverClass = hoverable ? 'hover:shadow-lg transition-shadow cursor-pointer' : '';
  const variantClass = variants[variant] || variants.default;
  const paddingClass = paddings[padding] || paddings.md;

  return (
    <div
      className={`${baseStyles} ${variantClass} ${paddingClass} ${hoverClass} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'elevated', 'outline', 'glass']),
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
  onClick: PropTypes.func,
  hoverable: PropTypes.bool,
};

export default Card;
