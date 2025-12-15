# Quick Reference - Atomic Design System

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                         PAGES                                │
│  (Home.jsx, Login.jsx)                                      │
│  Full pages with real content and data                      │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                       TEMPLATES                              │
│  (Coming soon: MainLayout, AuthLayout)                      │
│  Page-level structure and layout patterns                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                       ORGANISMS                              │
│  Navbar, Map, LayerSidebar, LayerFilterPanel               │
│  Complex UI sections combining molecules + atoms            │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                       MOLECULES                              │
│  Alert, Logo, UserInfo, CollapsibleSection                  │
│  FormGroup, Spinner                                         │
│  Simple groups of atoms working together                    │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                         ATOMS                                │
│  Button, Input, Card, Checkbox, Text, Select, Icon         │
│  Basic building blocks - smallest UI elements               │
└─────────────────────────────────────────────────────────────┘
```

## Import Quick Reference

```jsx
// Atoms - Basic elements
import { Button, Input, Card, Checkbox, Text, Select, Icon } from '@/components/atoms';

// Molecules - Component combinations
import { Alert, Logo, UserInfo, CollapsibleSection, FormGroup, Spinner } from '@/components/molecules';

// Organisms - Complex sections
import Navbar from '@/components/organisms/Navbar';
import Map from '@/components/organisms/Map';
```

## Component Cheat Sheet

### Button Variants
```jsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>
<Button variant="danger">Danger</Button>
<Button variant="success">Success</Button>
```

### Button Sizes
```jsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
```

### Card Variants
```jsx
<Card variant="default">Default Card</Card>
<Card variant="elevated">Elevated Card</Card>
<Card variant="outline">Outlined Card</Card>
<Card variant="glass">Glass Card</Card>
```

### Text Variants
```jsx
<Text variant="h1">Heading 1</Text>
<Text variant="h2">Heading 2</Text>
<Text variant="body">Body Text</Text>
<Text variant="bodySmall">Small Text</Text>
<Text variant="caption">Caption</Text>
```

### Alert Types
```jsx
<Alert variant="success">Success message</Alert>
<Alert variant="warning">Warning message</Alert>
<Alert variant="error">Error message</Alert>
<Alert variant="info">Info message</Alert>
```

## Common Patterns

### Login Form Pattern
```jsx
import { Card, Input, Button } from '@/components/atoms';
import { FormGroup, Alert, Logo } from '@/components/molecules';

<Card variant="elevated" padding="lg">
  <Logo size="xl" />
  {error && <Alert variant="error">{error}</Alert>}
  <FormGroup spacing="md">
    <Input label="Username" fullWidth required />
    <Input label="Password" type="password" fullWidth required />
    <Button variant="primary" fullWidth loading={loading}>Login</Button>
  </FormGroup>
</Card>
```

### Data Display Card Pattern
```jsx
import { Card, Text } from '@/components/atoms';

<Card variant="default" padding="lg" hoverable>
  <Text variant="h4" className="mb-2">Title</Text>
  <Text color="secondary">Description text here</Text>
</Card>
```

### Collapsible List Pattern
```jsx
import { CollapsibleSection } from '@/components/molecules';
import { Checkbox } from '@/components/atoms';

<CollapsibleSection title="Options" defaultOpen>
  <div className="space-y-2">
    <Checkbox label="Option 1" />
    <Checkbox label="Option 2" />
    <Checkbox label="Option 3" />
  </div>
</CollapsibleSection>
```

### Loading State Pattern
```jsx
import { Spinner } from '@/components/molecules';

{loading ? (
  <Spinner size="lg" message="Loading data..." fullScreen />
) : (
  <div>Your content here</div>
)}
```

## Design Token Usage

### In JSX (Tailwind)
```jsx
<div className="p-4 rounded-lg shadow-md bg-white">
  Content
</div>
```

### In Custom CSS
```css
.my-element {
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  background: var(--color-surface-primary);
  color: var(--color-text-primary);
}
```

### Utility Classes
```jsx
<div className="gradient-primary">Gradient background</div>
<div className="glass">Glassmorphism effect</div>
<div className="scrollbar-thin">Custom scrollbar</div>
<div className="fade-in">Fade in animation</div>
```

## Color Reference

### Primary Colors
- `--color-primary-500` - Main orange
- `--color-primary-600` - Main amber

### Semantic Colors
- `--color-success` - Green for success states
- `--color-warning` - Yellow for warnings
- `--color-error` - Red for errors
- `--color-info` - Blue for information

### Neutral Colors
- `--color-neutral-50` to `--color-neutral-950` - Gray scale

## Spacing Scale

```
--spacing-1   4px    (0.25rem)
--spacing-2   8px    (0.5rem)
--spacing-3   12px   (0.75rem)
--spacing-4   16px   (1rem)
--spacing-6   24px   (1.5rem)
--spacing-8   32px   (2rem)
--spacing-12  48px   (3rem)
--spacing-16  64px   (4rem)
```

## Typography Scale

```
--font-size-xs    12px
--font-size-sm    14px
--font-size-base  16px
--font-size-lg    18px
--font-size-xl    20px
--font-size-2xl   24px
--font-size-3xl   30px
--font-size-4xl   36px
--font-size-5xl   48px
```

## Common Props Reference

### All Form Components (Input, Select, Checkbox)
- `label` - Label text
- `fullWidth` - Take full container width
- `disabled` - Disable interaction
- `error` - Error message (Input, Select)
- `required` - Mark as required

### All Interactive Components (Button, Icon, Card with onClick)
- `onClick` - Click handler
- `disabled` - Disable interaction
- `className` - Additional CSS classes

### Layout Components (Card, FormGroup)
- `padding` - Padding size (none, sm, md, lg, xl)
- `spacing` - Spacing between children (FormGroup)
- `className` - Additional CSS classes

## File Locations

```
frontend/
├── src/
│   ├── components/
│   │   ├── atoms/           # Basic building blocks
│   │   ├── molecules/       # Component combinations
│   │   ├── organisms/       # Complex sections
│   │   └── README.md        # Component guide
│   ├── index.css            # Design tokens
│   └── pages/               # Full pages
├── COMPONENT_LIBRARY.md     # Full documentation
├── MIGRATION_GUIDE.md       # Migration instructions
├── ATOMIC_DESIGN_SUMMARY.md # Implementation summary
└── QUICK_REFERENCE.md       # This file
```

## Next Steps

1. ✅ Review [COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md) for full API docs
2. ✅ Check [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for refactoring existing code
3. ✅ Start using atoms/molecules in new features
4. ✅ Test refactored examples (`.refactored.jsx` files)

## Tips

💡 **Start Small**: Use atoms in new features before refactoring old code
💡 **Compose Up**: Build organisms from molecules, molecules from atoms
💡 **Use Tokens**: Always prefer design tokens over hardcoded values
💡 **Stay Consistent**: Follow the prop naming conventions
💡 **Test Often**: Test components as you build them

---

**Quick Help**
- Need component API? → [COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md)
- Need to refactor? → [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
- Need overview? → [ATOMIC_DESIGN_SUMMARY.md](ATOMIC_DESIGN_SUMMARY.md)
- Need examples? → See `.refactored.jsx` files
