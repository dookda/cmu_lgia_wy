import PropTypes from 'prop-types';
import { useState } from 'react';
import { Icon, Text } from '../atoms';
import { IoChevronDown, IoChevronForward } from 'react-icons/io5';

const CollapsibleSection = ({
  title,
  children,
  defaultOpen = false,
  onToggle,
  className = '',
  headerClassName = '',
  contentClassName = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  return (
    <div className={className} {...props}>
      <button
        onClick={handleToggle}
        className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors rounded ${headerClassName}`}
      >
        <Icon size="sm" color="secondary">
          {isOpen ? <IoChevronDown /> : <IoChevronForward />}
        </Icon>
        <Text size="sm" weight="medium" className="flex-1 text-left">
          {title}
        </Text>
      </button>
      {isOpen && (
        <div className={`mt-1 ${contentClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
};

CollapsibleSection.propTypes = {
  title: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  defaultOpen: PropTypes.bool,
  onToggle: PropTypes.func,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  contentClassName: PropTypes.string,
};

export default CollapsibleSection;
