import { useRef, useState,  } from "react";
import { Link } from "react-router-dom";
import { Button, Card, Input } from "../Components";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

import { useLoginMutation } from "../hooks/useAuth";

export function Login() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: login, isPending } = useLoginMutation();

  const inputStyles =
    "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 focus:outline-none text-slate-900 dark:text-slate-100 w-full transition-colors";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    login({ email, password });
  };


  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-amber-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <Card title="Welcome Back" subtitle="Log in to continue your chess journey.">
        <form className="space-y-6" onSubmit={handleLogin}>
          <Input
            type="email"
            placeholder="Email"
            inputRef={emailRef}
            required
            className={inputStyles}
          />
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              inputRef={passwordRef}
              required
              className={inputStyles}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          <Button
            size="lg"
            text={isPending ? "Logging in..." : "Login"}
            variant="primary"
            loading={isPending}
            className="w-full bg-gradient-to-r from-indigo-500 to-amber-500 hover:from-indigo-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg"
          />
        </form>
        <div className="mt-6 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold transition-colors "
            >
              Sign up here
            </Link>
          </p>
        </div>
      </Card>
    </section>
  );
}
