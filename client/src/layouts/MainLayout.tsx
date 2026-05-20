import { BarChart3, ChevronDown, FileText, LayoutDashboard, LogOut, MessageSquareText, SearchCheck, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function MainLayout() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const appLinks = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "Analysis", to: "/analysis", icon: BarChart3 },
    { label: "Interview", to: "/interview-practice", icon: MessageSquareText },
    { label: "Job Match", to: "/job-match", icon: SearchCheck }
  ];

  function handleLogoutConfirm() {
    logoutUser();
    setIsLogoutConfirmOpen(false);
    setIsProfileOpen(false);
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
                <div className="hidden items-center gap-1 lg:flex">
                  {appLinks.map((item) => (
                    <NavLink
                      key={item.to}
                      className={({ isActive }) =>
                        `inline-flex h-10 items-center gap-2 rounded-lg px-3 font-semibold ${
                          isActive ? "bg-neutral-950 text-white" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                        }`
                      }
                      to={item.to}
                    >
                      <item.icon size={15} />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
                <div className="relative">
                  <button
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950"
                    type="button"
                    onClick={() => setIsProfileOpen((current) => !current)}
                    aria-expanded={isProfileOpen}
                    aria-haspopup="menu"
                  >
                    <span className="flex size-7 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                      <UserRound size={15} />
                    </span>
                    <span className="hidden max-w-36 truncate sm:inline">{user.name}</span>
                    <ChevronDown size={16} className={isProfileOpen ? "rotate-180 transition" : "transition"} />
                  </button>

                  {isProfileOpen ? (
                    <div
                      className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-neutral-200 bg-white py-2 shadow-lg"
                      role="menu"
                    >
                      <div className="border-b border-neutral-100 px-3 pb-2 pt-1">
                        <p className="truncate text-sm font-semibold text-neutral-950">{user.name}</p>
                        <p className="truncate text-xs text-neutral-500">{user.email}</p>
                      </div>
                      <div className="mt-1 lg:hidden">
                        {appLinks.map((item) => (
                          <Link
                            key={item.to}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950"
                            to={item.to}
                            role="menuitem"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <item.icon size={16} />
                            {item.label}
                          </Link>
                        ))}
                      </div>
                      <button
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-red-700 hover:bg-red-50"
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setIsProfileOpen(false);
                          setIsLogoutConfirmOpen(true);
                        }}
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  ) : null}
                </div>
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

      {isLogoutConfirmOpen ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-neutral-950/40 px-4">
          <div
            className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-5 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-neutral-950" id="logout-dialog-title">
                  Logout?
                </h2>
                <p className="mt-1 text-sm text-neutral-500">You will need to sign in again to open your dashboard.</p>
              </div>
              <button
                className="inline-flex size-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                aria-label="Close logout confirmation"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                className="h-10 rounded-lg border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="h-10 rounded-lg bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800"
                type="button"
                onClick={handleLogoutConfirm}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
