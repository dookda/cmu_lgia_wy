# LGIA Component Library - Atomic Design System

This document provides a comprehensive guide to the LGIA (Local Geo-Info Application) component library, which follows the **Atomic Design** methodology for building reusable, scalable UI components.

## Table of Contents

1. [Atomic Design Principles](#atomic-design-principles)
2. [Design Token System](#design-token-system)
3. [Component Categories](#component-categories)
4. [Usage Examples](#usage-examples)
5. [Best Practices](#best-practices)

---

## Atomic Design Principles

The component library is organized into five levels:

### 1. **Atoms**
The smallest, most basic building blocks (buttons, inputs, text, icons)

### 2. **Molecules**
Simple combinations of atoms (form groups, alerts, user info cards)

### 3. **Organisms**
Complex UI sections combining molecules and atoms (navbar, sidebar, map)

### 4. **Templates**
Page-level layouts defining structure (coming soon)

### 5. **Pages**
Specific instances of templates with real content (Home, Login)

---

## Design Token System

All design tokens are defined in [src/index.css](src/index.css) using CSS custom properties within the `@theme` directive (Tailwind CSS v4).

### Color Tokens

```css
/* Primary Brand Colors */
--color-primary-500  /* Main orange */
--color-primary-600  /* Main amber */

/* Neutral Colors */
--color-neutral-50 to --color-neutral-950

/* Semantic Colors */
--color-success, --color-warning, --color-error, --color-info
```

### Typography Tokens

```css
/* Font Sizes */
--font-size-xs (12px) to --font-size-5xl (48px)

/* Font Weights */
--font-weight-light to --font-weight-extrabold

/* Line Heights */
--line-height-tight, --line-height-normal, etc.
```

### Spacing Tokens

```css
--spacing-1 (4px) to --spacing-32 (128px)
```

### Other Tokens

- **Shadows**: `--shadow-xs` to `--shadow-2xl`
- **Border Radius**: `--radius-sm` to `--radius-3xl`
- **Transitions**: `--transition-fast` to `--transition-slower`
- **Z-Index**: `--z-index-dropdown`, `--z-index-modal`, etc.
- **Layout**: `--layout-sidebar-width`, `--layout-navbar-height`, etc.

### Using Tokens

```jsx
// In Tailwind classes, tokens are automatically available
<div className="shadow-lg rounded-2xl" />

// In custom CSS
.custom-class {
  background: var(--color-primary-500);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
}
```

---

## Component Categories

### Atoms

Located in [src/components/atoms/](src/components/atoms/)

#### Button

```jsx
import { Button } from '@/components/atoms';

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

// Variants: primary, secondary, ghost, outline, danger, success
// Sizes: sm, md, lg, xl
// Props: fullWidth, disabled, loading, type
```

#### Input

```jsx
import { Input } from '@/components/atoms';

<Input
  label="Username"
  placeholder="Enter username"
  error={errors.username}
  fullWidth
  onChange={(e) => setValue(e.target.value)}
/>
```

#### Card

```jsx
import { Card } from '@/components/atoms';

<Card variant="elevated" padding="lg">
  <h2>Card Content</h2>
</Card>

// Variants: default, elevated, outline, glass
// Padding: none, sm, md, lg, xl
```

#### Text

```jsx
import { Text } from '@/components/atoms';

<Text variant="h1" color="brand" weight="bold">
  Heading Text
</Text>

// Variants: h1-h6, body, bodySmall, caption, overline
// Colors: primary, secondary, white, brand, success, warning, error, info
```

#### Checkbox

```jsx
import { Checkbox } from '@/components/atoms';

<Checkbox
  label="Accept terms"
  checked={isChecked}
  onChange={(e) => setChecked(e.target.checked)}
/>
```

#### Select

```jsx
import { Select } from '@/components/atoms';

<Select
  label="Choose option"
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' }
  ]}
  fullWidth
/>
```

#### Icon

```jsx
import { Icon } from '@/components/atoms';
import { IoHome } from 'react-icons/io5';

<Icon size="lg" color="brand">
  <IoHome />
</Icon>
```

### Molecules

Located in [src/components/molecules/](src/components/molecules/)

#### Alert

```jsx
import { Alert } from '@/components/molecules';

<Alert variant="error" onClose={handleClose}>
  An error occurred!
</Alert>

// Variants: success, warning, error, info
```

#### Logo

```jsx
import { Logo } from '@/components/molecules';

<Logo size="md" showText variant="horizontal" />

// Sizes: sm, md, lg, xl
// Variants: horizontal, vertical
```

#### UserInfo

```jsx
import { UserInfo } from '@/components/molecules';

<UserInfo
  username="john.doe"
  role="Admin"
  align="right"
  size="md"
/>
```

#### CollapsibleSection

```jsx
import { CollapsibleSection } from '@/components/molecules';

<CollapsibleSection title="Section Title" defaultOpen>
  <p>Collapsible content here</p>
</CollapsibleSection>
```

#### FormGroup

```jsx
import { FormGroup } from '@/components/molecules';
import { Input, Select } from '@/components/atoms';

<FormGroup spacing="md">
  <Input label="Name" />
  <Input label="Email" type="email" />
  <Select label="Country" options={countries} />
</FormGroup>
```

#### Spinner

```jsx
import { Spinner } from '@/components/molecules';

<Spinner size="lg" message="Loading..." fullScreen />

// Sizes: sm, md, lg, xl
// Colors: primary, white, gray
```

### Organisms

Located in [src/components/organisms/](src/components/organisms/)

Current organisms:
- **Navbar** - Main navigation bar with logo and user info
- **Map** - MapLibre GL map with layer support
- **LayerSidebar** - Hierarchical layer tree
- **LayerFilterPanel** - Dynamic filtering interface

---

## Usage Examples

### Example 1: Building a Login Form

```jsx
import { Card, Input, Button, Text } from '@/components/atoms';
import { FormGroup, Alert, Logo } from '@/components/molecules';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
      <Card variant="elevated" padding="lg" className="w-full max-w-md">
        <div className="text-center mb-6">
          <Logo size="xl" variant="vertical" />
          <Text variant="h3" className="mt-4">เข้าสู่ระบบ</Text>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <FormGroup spacing="md">
          <Input
            label="ชื่อผู้ใช้"
            fullWidth
            value={credentials.username}
            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
          />
          <Input
            label="รหัสผ่าน"
            type="password"
            fullWidth
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
          />
          <Button variant="primary" fullWidth type="submit">
            เข้าสู่ระบบ
          </Button>
        </FormGroup>
      </Card>
    </div>
  );
};
```

### Example 2: Creating a Custom Organism

```jsx
// src/components/organisms/FeatureCard.jsx
import { Card, Text, Button, Icon } from '@/components/atoms';
import { IoStar } from 'react-icons/io5';

const FeatureCard = ({ title, description, onLearnMore }) => {
  return (
    <Card variant="default" padding="lg" hoverable>
      <div className="flex items-start gap-3">
        <Icon size="xl" color="brand">
          <IoStar />
        </Icon>
        <div className="flex-1">
          <Text variant="h4" className="mb-2">{title}</Text>
          <Text color="secondary" className="mb-4">{description}</Text>
          <Button variant="secondary" size="sm" onClick={onLearnMore}>
            Learn More
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FeatureCard;
```

### Example 3: Using CollapsibleSection with Checkboxes

```jsx
import { CollapsibleSection } from '@/components/molecules';
import { Checkbox } from '@/components/atoms';

const LayerGroup = ({ layers, selectedLayers, onToggle }) => {
  return (
    <CollapsibleSection title="Map Layers" defaultOpen>
      <div className="space-y-2 pl-6">
        {layers.map(layer => (
          <Checkbox
            key={layer.id}
            label={layer.name}
            checked={selectedLayers.includes(layer.id)}
            onChange={() => onToggle(layer.id)}
          />
        ))}
      </div>
    </CollapsibleSection>
  );
};
```

---

## Best Practices

### 1. **Component Composition**
Build complex UIs by composing smaller, reusable components:

```jsx
// Good ✅
<Card>
  <Text variant="h3">Title</Text>
  <FormGroup>
    <Input label="Name" />
    <Button>Submit</Button>
  </FormGroup>
</Card>

// Avoid ❌
// Creating a new component for every small variation
```

### 2. **Use Design Tokens**
Always use design tokens instead of hardcoded values:

```jsx
// Good ✅
<div style={{ padding: 'var(--spacing-4)' }} />
<div className="text-sm text-gray-700" />

// Avoid ❌
<div style={{ padding: '16px' }} />
<div style={{ fontSize: '14px', color: '#374151' }} />
```

### 3. **Consistent Prop Names**
Follow established prop naming conventions:

- `variant` for style variations
- `size` for sizing options
- `fullWidth` for 100% width
- `disabled`, `loading` for states
- `className` for custom styling

### 4. **Accessibility**
Always include accessibility attributes:

```jsx
<Button aria-label="Close dialog" />
<Icon role="img" aria-label="Warning icon" />
<Input required aria-describedby="error-message" />
```

### 5. **Component Hierarchy**
Follow the atomic design hierarchy:

- **Atoms**: No imports from molecules/organisms
- **Molecules**: Can import atoms only
- **Organisms**: Can import atoms and molecules
- **Pages**: Can import from all levels

### 6. **PropTypes**
Always define PropTypes for components:

```jsx
import PropTypes from 'prop-types';

ComponentName.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary']),
  onClick: PropTypes.func,
};
```

### 7. **Barrel Exports**
Use index files for clean imports:

```jsx
// Good ✅
import { Button, Input, Card } from '@/components/atoms';

// Avoid ❌
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Card from '@/components/atoms/Card';
```

### 8. **Utility Classes**
Use provided utility classes from index.css:

```jsx
<div className="gradient-primary" /> {/* Primary gradient */}
<div className="glass" /> {/* Glassmorphism effect */}
<div className="scrollbar-thin" /> {/* Custom scrollbar */}
<div className="fade-in" /> {/* Fade animation */}
```

---

## Project Structure

```
frontend/src/
├── components/
│   ├── atoms/              # Basic building blocks
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Checkbox.jsx
│   │   ├── Text.jsx
│   │   ├── Select.jsx
│   │   ├── Icon.jsx
│   │   └── index.js        # Barrel export
│   ├── molecules/          # Simple combinations
│   │   ├── Alert.jsx
│   │   ├── Logo.jsx
│   │   ├── UserInfo.jsx
│   │   ├── CollapsibleSection.jsx
│   │   ├── FormGroup.jsx
│   │   ├── Spinner.jsx
│   │   └── index.js
│   ├── organisms/          # Complex sections
│   │   ├── Navbar.jsx
│   │   ├── Map.jsx
│   │   ├── LayerSidebar.jsx
│   │   └── LayerFilterPanel.jsx
│   └── templates/          # Page layouts (coming soon)
├── pages/                  # Full pages
│   ├── Home.jsx
│   └── Login.jsx
├── context/                # State management
│   └── AuthContext.jsx
├── hooks/                  # Custom hooks (coming soon)
├── services/               # API services (coming soon)
└── index.css               # Design tokens & global styles
```

---

## Adding New Components

### Creating a New Atom

1. Create the component file in `src/components/atoms/`
2. Define PropTypes
3. Use design tokens and consistent prop names
4. Export from `src/components/atoms/index.js`

```jsx
// src/components/atoms/Badge.jsx
import PropTypes from 'prop-types';

const Badge = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'bg-orange-500 text-white',
    secondary: 'bg-gray-200 text-gray-800',
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary']),
  className: PropTypes.string,
};

export default Badge;
```

### Creating a New Molecule

1. Create the component file in `src/components/molecules/`
2. Import only from atoms
3. Combine atoms meaningfully
4. Export from `src/components/molecules/index.js`

---

## Utility Classes Reference

Available in [src/index.css](src/index.css):

| Class | Description |
|-------|-------------|
| `.gradient-primary` | Horizontal orange-to-amber gradient |
| `.gradient-primary-vertical` | Vertical orange-to-amber gradient |
| `.text-gradient-primary` | Gradient text effect |
| `.glass` | Glassmorphism with backdrop blur |
| `.scrollbar-thin` | Custom styled scrollbar |
| `.focus-ring` | Accessible focus outline |
| `.truncate-2` | Truncate text to 2 lines |
| `.truncate-3` | Truncate text to 3 lines |
| `.spinner` | Rotating animation |
| `.fade-in` | Fade in animation |
| `.slide-in-right` | Slide in from right |
| `.slide-in-left` | Slide in from left |

---

## Migration Guide

### Updating Existing Components

When refactoring existing components to use the atomic design system:

**Before:**
```jsx
<button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg">
  Click Me
</button>
```

**After:**
```jsx
import { Button } from '@/components/atoms';

<Button variant="primary">Click Me</Button>
```

**Before:**
```jsx
<div className="bg-white rounded-2xl shadow-2xl p-8">
  {/* content */}
</div>
```

**After:**
```jsx
import { Card } from '@/components/atoms';

<Card variant="elevated" padding="lg">
  {/* content */}
</Card>
```

---

## Resources

- [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com/)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [React Icons](https://react-icons.github.io/react-icons/)
- [PropTypes Documentation](https://reactjs.org/docs/typechecking-with-proptypes.html)

---

## Support

For questions or contributions, please refer to the main project documentation or contact the development team.

**Happy Building! 🚀**
