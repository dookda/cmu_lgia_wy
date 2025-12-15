# Component Directory

This directory contains all React components organized using the **Atomic Design** methodology.

## Structure

```
components/
├── atoms/          # Basic UI building blocks
├── molecules/      # Simple component combinations
├── organisms/      # Complex UI sections
└── templates/      # Page layout structures (coming soon)
```

## Quick Import Reference

### Atoms

```jsx
import {
  Button,
  Input,
  Card,
  Checkbox,
  Text,
  Select,
  Icon
} from './atoms';
```

### Molecules

```jsx
import {
  Alert,
  Logo,
  UserInfo,
  CollapsibleSection,
  FormGroup,
  Spinner
} from './molecules';
```

### Organisms

```jsx
import Navbar from './organisms/Navbar';
import Map from './organisms/Map';
import LayerSidebar from './organisms/LayerSidebar';
import LayerFilterPanel from './organisms/LayerFilterPanel';
```

## Guidelines

1. **Atoms** should not import from molecules or organisms
2. **Molecules** can only import from atoms
3. **Organisms** can import from atoms and molecules
4. **Always use design tokens** from `src/index.css`
5. **Define PropTypes** for all components

See [COMPONENT_LIBRARY.md](../../COMPONENT_LIBRARY.md) for detailed documentation.
