import { useRef, useEffect } from "react";
import { Button, Card, Input } from "../Components";
import { toast } from "react-hot-toast";
import { useThemeStore } from "../stores/useThemeStore";
import { useLoginMutation } from "../hooks/useAuth";

export function Login() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

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

  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

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
          <Input
            type="password"
            placeholder="Password"
            inputRef={passwordRef}
            required
            className={inputStyles}
          />

          <Button
            size="lg"
            text={isPending ? "Logging in..." : "Login"}
            variant="primary"
            loading={isPending}
            className="w-full bg-gradient-to-r from-indigo-500 to-amber-500 hover:from-indigo-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg"
          />
        </form>
      </Card>
    </section>
  );
}
