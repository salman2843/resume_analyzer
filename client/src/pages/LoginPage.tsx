import { AxiosError } from "axios";
import { LockKeyhole, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type LocationState = {
  from?: {
    pathname?: string;
  };
};

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || "Unable to sign in";
  }

  return "Unable to sign in";
}

export default function LoginPage() {
  const { loginUser, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from?.pathname || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await loginUser({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-6 py-12">
      <form className="w-full rounded-lg border border-neutral-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold text-neutral-950">Sign in</h1>
        <p className="mt-2 text-sm text-neutral-500">Continue to your resume analysis workspace.</p>

        <label className="mt-6 block text-sm font-medium text-neutral-700" htmlFor="email">
          Email
        </label>
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3">
          <Mail size={16} className="text-neutral-400" />
          <input
            className="h-11 w-full bg-transparent text-sm outline-none"
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <label className="mt-4 block text-sm font-medium text-neutral-700" htmlFor="password">
          Password
        </label>
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3">
          <LockKeyhole size={16} className="text-neutral-400" />
          <input
            className="h-11 w-full bg-transparent text-sm outline-none"
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}

        <button
          className="mt-6 h-11 w-full rounded-lg bg-neutral-950 text-sm font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>

        <p className="mt-5 text-center text-sm text-neutral-500">
          New here?{" "}
          <Link className="font-semibold text-emerald-700 hover:text-emerald-800" to="/register">
            Create an account
          </Link>
        </p>
      </form>
    </section>
  );
}
