import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="border-b border-primary bg-surface-level-1">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
        <Link
          className="text-base font-semibold tracking-tight text-primary no-underline hover:text-secondary"
          to="/"
        >
          AUBG Commerce
        </Link>
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-primary bg-surface-level-0 px-3 py-2 sm:flex">
              <span className="max-w-[18rem] truncate text-sm text-primary">
                {user?.email}
              </span>
              <Badge>{user?.role}</Badge>
            </div>
            <Button onClick={() => void logout()} size="sm" variant="ghost">
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button render={<Link to="/login" />} size="sm" variant="ghost">
              Login
            </Button>
            <Button render={<Link to="/register" />} size="sm">
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
