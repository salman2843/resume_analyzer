import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import notFoundResume from "../assets/not-found-resume.svg";
import { useAuth } from "../context/AuthContext";

export default function NotFoundPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div>
        <p className="text-sm font-semibold uppercase text-[#2563eb]">Page not found</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
          This resume page is not in the stack.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-600 sm:text-base">
          The link may be wrong, moved, or no longer available. Head back to a known workspace page and continue from there.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 text-sm font-semibold text-white hover:bg-neutral-800"
            to={user ? "/dashboard" : "/"}
          >
            <LayoutDashboard size={16} />
            {user ? "Open dashboard" : "Go home"}
          </Link>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            type="button"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            Go back
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <img className="h-auto w-full" src={notFoundResume} alt="Resume document illustration for a missing page" />
      </div>
    </section>
  );
}
