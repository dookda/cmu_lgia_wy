import PropTypes from 'prop-types';
import { Text } from '../atoms';

const UserInfo = ({
  username,
  role,
  align = 'right',
  size = 'md',
  className = '',
  ...props
}) => {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

  const sizes = {
    sm: {
      username: 'text-xs',
      role: 'text-xs',
    },
    md: {
      username: 'text-sm',
      role: 'text-xs',
    },
    lg: {
      username: 'text-base',
      role: 'text-sm',
    },
  };

  const sizeConfig = sizes[size] || sizes.md;

  return (
    <div className={`${alignClass} ${className}`} {...props}>
      <Text
        size={sizeConfig.username}
        weight="medium"
        color="white"
        className="mb-0.5"
      >
        {username}
      </Text>
      <Text
        size={sizeConfig.role}
        className="text-yellow-200"
      >
        {role}
      </Text>
    </div>
  );
};

UserInfo.propTypes = {
  username: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  align: PropTypes.oneOf(['left', 'center', 'right']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default UserInfo;
