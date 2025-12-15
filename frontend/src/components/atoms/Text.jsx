import PropTypes from 'prop-types';

const Text = ({
  children,
  variant = 'body',
  size,
  weight,
  color = 'primary',
  align = 'left',
  className = '',
  as: Component = 'p',
  ...props
}) => {
  const variants = {
    h1: 'text-4xl font-bold',
    h2: 'text-3xl font-bold',
    h3: 'text-2xl font-bold',
    h4: 'text-xl font-semibold',
    h5: 'text-lg font-semibold',
    h6: 'text-base font-semibold',
    body: 'text-base',
    bodySmall: 'text-sm',
    caption: 'text-xs',
    overline: 'text-xs uppercase tracking-wide',
  };

  const colors = {
    primary: 'text-gray-800',
    secondary: 'text-gray-500',
    tertiary: 'text-gray-400',
    white: 'text-white',
    brand: 'text-orange-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    info: 'text-blue-600',
  };

  const weights = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
  };

  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
  };

  const aligns = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  const variantClass = variants[variant] || variants.body;
  const colorClass = colors[color] || colors.primary;
  const weightClass = weight ? weights[weight] : '';
  const sizeClass = size ? sizes[size] : '';
  const alignClass = aligns[align] || aligns.left;

  return (
    <Component
      className={`${variantClass} ${colorClass} ${weightClass} ${sizeClass} ${alignClass} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

Text.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body', 'bodySmall', 'caption', 'overline']),
  size: PropTypes.oneOf(['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl']),
  weight: PropTypes.oneOf(['light', 'normal', 'medium', 'semibold', 'bold', 'extrabold']),
  color: PropTypes.oneOf(['primary', 'secondary', 'tertiary', 'white', 'brand', 'success', 'warning', 'error', 'info']),
  align: PropTypes.oneOf(['left', 'center', 'right', 'justify']),
  className: PropTypes.string,
  as: PropTypes.elementType,
};

export default Text;
