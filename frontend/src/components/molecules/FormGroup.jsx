import PropTypes from 'prop-types';

const FormGroup = ({
  children,
  spacing = 'md',
  className = '',
  ...props
}) => {
  const spacings = {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
  };

  const spacingClass = spacings[spacing] || spacings.md;

  return (
    <div className={`${spacingClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

FormGroup.propTypes = {
  children: PropTypes.node.isRequired,
  spacing: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default FormGroup;
