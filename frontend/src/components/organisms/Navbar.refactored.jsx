// REFACTORED VERSION - Example of using atomic components
// This demonstrates how to refactor the existing Navbar.jsx using the atomic design system
// To use this version, rename to Navbar.jsx and replace the current file

import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../atoms';
import { Logo, UserInfo } from '../molecules';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="gradient-primary shadow-lg">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo Section - Using Logo molecule */}
        <Link to="/" className="hover:opacity-90 transition-opacity">
          <Logo size="md" showText variant="horizontal" />
        </Link>

        {/* User Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Using UserInfo molecule */}
              <UserInfo username={user.username} role={user.role} align="right" />

              {/* Using Button atom */}
              <Button variant="ghost" size="md" onClick={logout}>
                ออกจากระบบ
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="secondary" size="md">
                เข้าสู่ระบบ
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

/*
BENEFITS OF THIS REFACTORED VERSION:

1. ✅ Reduced code complexity - Logo and UserInfo extracted
2. ✅ Reusable components - Logo and UserInfo can be used elsewhere
3. ✅ Consistent styling - Uses Button atom for consistent button styles
4. ✅ Better maintainability - Changes to Logo affect all instances
5. ✅ Type safety - PropTypes ensure correct usage
6. ✅ Design token usage - Consistent with design system

MIGRATION STEPS:

1. Test this refactored version alongside the original
2. Verify all functionality works identically
3. Replace original Navbar.jsx with this version
4. Update any tests if needed
5. Repeat pattern for other organisms

*/
