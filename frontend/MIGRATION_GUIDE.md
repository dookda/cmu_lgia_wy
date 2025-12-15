# Migration Guide - Atomic Design System

This guide helps you migrate existing components to use the new atomic design system.

## Overview

The atomic design system provides:
- ✅ Reusable components (atoms, molecules)
- ✅ Design tokens in `index.css`
- ✅ Consistent styling and behavior
- ✅ Better maintainability
- ✅ Type safety with PropTypes

## Migration Checklist

### Phase 1: Preparation ✅ COMPLETED

- [x] Create design token system in `index.css`
- [x] Create atom components (Button, Input, Card, etc.)
- [x] Create molecule components (Alert, Logo, UserInfo, etc.)
- [x] Create documentation and examples

### Phase 2: Component Migration (RECOMMENDED)

Follow this order for refactoring:

#### Step 1: Pages
- [ ] Migrate `Login.jsx`
  - Replace with `Login.refactored.jsx` (already created)
  - Test login functionality
  - Verify styling matches original

#### Step 2: Organisms
- [ ] Migrate `Navbar.jsx`
  - Replace with `Navbar.refactored.jsx` (already created)
  - Test authentication flow
  - Verify responsive behavior

- [ ] Refactor `LayerSidebar.jsx`
  - Use `CollapsibleSection` molecule
  - Use `Checkbox` atom
  - Extract layer tree into separate molecule

- [ ] Refactor `LayerFilterPanel.jsx`
  - Use `Select` atom for dropdowns
  - Use `Card` atom for container
  - Use `FormGroup` molecule

- [ ] Keep `Map.jsx` as-is (MapLibre specific)

#### Step 3: Create New Templates
- [ ] Create `MainLayout.jsx` template
- [ ] Create `AuthLayout.jsx` template

### Phase 3: Testing & Validation

- [ ] Visual regression testing
- [ ] Accessibility testing
- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing

## Step-by-Step Migration Process

### Example: Migrating a Component

**1. Identify Replaceable Elements**

Look for patterns that match atomic components:

```jsx
// ❌ Manual implementation
<button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg">
  Click
</button>

// ✅ Use Button atom
import { Button } from '@/components/atoms';
<Button variant="primary">Click</Button>
```

**2. Replace Repeated Patterns**

```jsx
// ❌ Before
<div className="bg-white rounded-2xl shadow-2xl p-8">
  <h1 className="text-2xl font-bold text-gray-800">Title</h1>
  <p className="text-gray-500 text-sm">Subtitle</p>
</div>

// ✅ After
import { Card, Text } from '@/components/atoms';

<Card variant="elevated" padding="lg">
  <Text variant="h3">Title</Text>
  <Text size="sm" color="secondary">Subtitle</Text>
</Card>
```

**3. Extract Reusable Sections**

If a section appears in multiple places, create a molecule:

```jsx
// ❌ Repeated in multiple files
<div className="flex items-center gap-3">
  <img src="/img/LOGO.png" className="w-12 h-12 rounded-full" />
  <div>
    <h1 className="text-white font-bold">ระบบภูมิสารสนเทศชุมชน</h1>
    <p className="text-orange-100 text-xs">LGIA</p>
  </div>
</div>

// ✅ Use Logo molecule
import { Logo } from '@/components/molecules';
<Logo size="md" showText />
```

**4. Update Imports**

```jsx
// Before
import { useState } from 'react';

// After
import { useState } from 'react';
import { Button, Input, Card } from '@/components/atoms';
import { Alert, FormGroup } from '@/components/molecules';
```

**5. Test Thoroughly**

- Check visual appearance
- Test all interactions
- Verify responsive behavior
- Test accessibility

## Component Mapping Reference

### Common Patterns

| Old Pattern | New Component | Example |
|-------------|---------------|---------|
| `<button className="bg-gradient...">` | `<Button variant="primary">` | Login button |
| `<div className="bg-white rounded-2xl shadow-2xl p-8">` | `<Card variant="elevated" padding="lg">` | Login card |
| `<input className="w-full px-4 py-3 border...">` | `<Input fullWidth />` | Form inputs |
| `<div className="bg-red-50 border...">` | `<Alert variant="error">` | Error messages |
| Form spacing divs | `<FormGroup spacing="md">` | Form layouts |
| Manual logo code | `<Logo />` | Header logos |
| User info display | `<UserInfo />` | Navbar user section |

### Styling Migration

| Old Tailwind Classes | New Approach | Notes |
|---------------------|--------------|-------|
| `bg-gradient-to-r from-orange-500 to-amber-500` | `gradient-primary` class or `Button variant="primary"` | Uses design tokens |
| `px-4 py-3 rounded-lg` | Component props: `size="md"` | Consistent sizing |
| `text-2xl font-bold text-gray-800` | `<Text variant="h3">` | Typography system |
| Manual shadow classes | `Card variant="elevated"` | Consistent shadows |

## Best Practices During Migration

### DO ✅

1. **Test incrementally** - Migrate one component at a time
2. **Keep both versions** - Use `.refactored.jsx` suffix during testing
3. **Verify functionality** - Ensure behavior matches original
4. **Update tests** - Adjust tests for new component structure
5. **Use PropTypes** - Leverage type checking
6. **Follow atomic hierarchy** - Respect component dependencies

### DON'T ❌

1. **Don't rush** - Take time to test each migration
2. **Don't skip documentation** - Update component docs
3. **Don't break accessibility** - Maintain ARIA attributes
4. **Don't ignore design tokens** - Use tokens consistently
5. **Don't create new atoms without reason** - Use existing atoms first

## Migration Timeline (Recommended)

### Week 1: Login & Navbar
- Migrate Login page
- Migrate Navbar organism
- Test authentication flow

### Week 2: Layer Components
- Refactor LayerSidebar
- Refactor LayerFilterPanel
- Test layer functionality

### Week 3: Templates & Cleanup
- Create layout templates
- Remove `.refactored.jsx` files
- Update documentation

### Week 4: Polish & Testing
- Visual regression testing
- Accessibility audit
- Performance testing
- Deploy to staging

## Troubleshooting

### Common Issues

**Issue: Styling doesn't match**
- Solution: Check if you're using the correct variant prop
- Solution: Verify design tokens are loaded

**Issue: Props not working**
- Solution: Check PropTypes warnings in console
- Solution: Refer to component documentation

**Issue: Component not found**
- Solution: Ensure proper import path
- Solution: Check barrel exports in index.js

**Issue: Functionality broken**
- Solution: Verify all event handlers are passed correctly
- Solution: Check that state management hasn't changed

## Rollback Plan

If migration causes issues:

1. Keep original files as backups
2. Use git to track changes
3. Can quickly revert to previous version
4. Test in development before production

## Success Criteria

Migration is successful when:

- ✅ All functionality works identically
- ✅ Visual appearance matches original
- ✅ No console errors or warnings
- ✅ Accessibility maintained or improved
- ✅ Code is more maintainable
- ✅ Component reusability increased

## Support

For questions during migration:
1. Check [COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md) for component docs
2. Review refactored examples
3. Test in development environment first
4. Document any issues encountered

---

**Remember**: Migration is gradual. Don't try to refactor everything at once!
