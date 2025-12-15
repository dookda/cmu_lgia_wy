import PropTypes from 'prop-types';
import { Text } from '../atoms';

const Logo = ({
  src = '/img/LOGO.png',
  alt = 'LGIA Logo',
  size = 'md',
  showText = true,
  variant = 'horizontal',
  className = '',
  ...props
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  const imageClass = sizes[size] || sizes.md;
  const containerClass = variant === 'vertical' ? 'flex-col items-center' : 'flex-row items-center';

  return (
    <div className={`flex gap-3 ${containerClass} ${className}`} {...props}>
      <img
        src={src}
        alt={alt}
        className={`${imageClass} bg-white rounded-full p-1 shadow-md object-contain`}
      />
      {showText && (
        <div className={variant === 'vertical' ? 'text-center' : ''}>
          <Text
            variant="h5"
            color="white"
            className="leading-tight"
          >
            ระบบภูมิสารสนเทศชุมชน
          </Text>
          <Text
            size="xs"
            color="white"
            className="opacity-90"
          >
            LGIA: Local Geo-Info Application
          </Text>
        </div>
      )}
    </div>
  );
};

Logo.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  showText: PropTypes.bool,
  variant: PropTypes.oneOf(['horizontal', 'vertical']),
  className: PropTypes.string,
};

export default Logo;
