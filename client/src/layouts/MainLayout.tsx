import { FileText, LogOut, UserRound } from "lucide-react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function MainLayout() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logoutUser();
    navigate("/");
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-neutral-950">
            <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-700 text-white">
              <FileText size={18} />
            </span>
            ResumeIQ
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            {user ? (
              <>
                <Link className="font-medium text-neutral-700 hover:text-neutral-950" to="/dashboard">
                  Dashboard
                </Link>
                <span className="hidden items-center gap-2 text-neutral-500 sm:flex">
                  <UserRound size={16} />
                  {user.name}
                </span>
                <button
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  type="button"
                  onClick={handleLogout}
                  aria-label="Log out"
                  title="Log out"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link className="font-medium text-neutral-700 hover:text-neutral-950" to="/login">
                  Login
                </Link>
                <Link
                  className="rounded-lg bg-neutral-950 px-4 py-2 font-semibold text-white hover:bg-neutral-800"
                  to="/register"
                >
                  Start free
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <Outlet />
    </main>
  );
}
