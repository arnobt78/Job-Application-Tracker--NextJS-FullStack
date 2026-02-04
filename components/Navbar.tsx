import LinksDropdown from './LinksDropdown';
import ThemeToggle from './ThemeToggle';
import UserProfileDropdown from './UserProfileDropdown';

function Navbar() {
  return (
    <nav className='bg-muted py-4 sm:px-16 lg:px-24 px-4 flex items-center justify-between'>
      <div>
        <LinksDropdown />
      </div>
      <div className='flex items-center gap-x-4'>
        <ThemeToggle />
        <UserProfileDropdown />
      </div>
    </nav>
  );
}
export default Navbar;
