import PropTypes from 'prop-types';
import { forwardRef } from 'react';

const Checkbox = forwardRef(({
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
  labelClassName = '',
  ...props
}, ref) => {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="checkbox-primary"
        {...props}
      />
      {label && (
        <span className={`text-sm text-gray-700 select-none ${labelClassName}`}>
          {label}
        </span>
      )}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

Checkbox.propTypes = {
  label: PropTypes.node,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  labelClassName: PropTypes.string,
};

export default Checkbox;
