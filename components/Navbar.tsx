import LinksDropdown from "./LinksDropdown";
import ThemeToggle from "./ThemeToggle";
import UserProfileDropdown from "./UserProfileDropdown";

function Navbar() {
  return (
    <nav className="glass-nav px-2 sm:px-4 xl:px-8 py-2 flex items-center justify-between sticky top-0 z-20">
      <LinksDropdown />
      <div className="flex items-center gap-x-4">
        <ThemeToggle />
        <UserProfileDropdown />
      </div>
    </nav>
  );
}

export default Navbar;
