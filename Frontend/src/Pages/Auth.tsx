import { useRef, useState, useEffect } from "react";
import { Button, Card, Input } from "../Components";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { useThemeStore } from "../stores/useThemeStore";

export type ChessLevel = "BEGINNER" | "INTERMEDIATE" | "PRO";

export function Auth() {
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const confirmPasswordref = useRef<HTMLInputElement>(null);

  const [isSignup, setIsSignUp] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<ChessLevel | "">("");
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);

  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  const handleLogin = () => {
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    console.log("Login:", { email, password });
  };

  const handleSignIn = () => {
    setConfirmPasswordError(false);
    const email = emailRef.current?.value;
    const name = nameRef.current?.value;
    const chessLevel = selectedLevel;
    const password = passwordRef.current?.value;
    const confirmPassword = confirmPasswordref.current?.value;

    if (!email || !name || !chessLevel || !password || !confirmPassword) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError(true);
      toast.error("Passwords do not match.");
      return;
    }

    console.log("Register:", { name, email, password, chessLevel });
  };

  const levels: ChessLevel[] = ["BEGINNER", "INTERMEDIATE", "PRO"];

  const inputStyles =
    "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 focus:outline-none text-slate-900 dark:text-slate-100 w-full transition-colors";

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-amber-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 transition-colors duration-500">
      {/* background decorative glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-300/20 to-amber-300/20 dark:from-indigo-700/20 dark:to-amber-600/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-gradient-to-br from-indigo-400/15 to-amber-300/15 dark:from-indigo-800/25 dark:to-amber-700/25 rounded-full blur-3xl animate-pulse"></div>

      <Card
        title={isSignup ? "Create Your Account" : "Welcome Back"}
        subtitle={
          isSignup
            ? "Join the arena and challenge the best minds."
            : "Log in to continue your chess journey."
        }
        className="relative text-white text-center z-10 max-w-md w-full p-8 rounded-3xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200/70 dark:border-slate-700/70 shadow-2xl backdrop-blur-md transition-all duration-500 hover:shadow-[0_0_40px_rgba(99,102,241,0.2)]"
      >
        <form className="space-y-6">
          {isSignup && (
            <>
              <Input
                type="text"
                placeholder="Username"
                inputRef={nameRef}
                required
                minLength={3}
                maxLength={20}
                className={inputStyles}
              />
              <Input
                type="email"
                placeholder="Email"
                inputRef={emailRef}
                required
                className={inputStyles}
              />
            </>
          )}

          {!isSignup && (
            <Input
              type="email"
              placeholder="Email"
              inputRef={emailRef}
              required
              className={inputStyles}
            />
          )}

          <Input
            type="password"
            placeholder="Password"
            inputRef={passwordRef}
            required
            className={inputStyles}
          />

          {isSignup && (
            <>
              <Input
                type="password"
                placeholder="Confirm Password"
                inputRef={confirmPasswordref}
                required
                className={inputStyles}
              />
              {confirmPasswordError && (
                <p className="text-red-500 text-sm">Passwords do not match.</p>
              )}

              <div className="pt-2">
                <p className="text-slate-700 dark:text-slate-300 mb-3 font-semibold">
                  Select your skill level:
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {levels.map((level) => (
                    <motion.button
                      key={level}
                      type="button"
                      onClick={() => setSelectedLevel(level)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                        selectedLevel === level
                          ? "bg-gradient-to-r from-indigo-500 to-amber-500 text-white shadow-lg"
                          : "bg-slate-200/80 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200 hover:bg-slate-300/70 dark:hover:bg-slate-600"
                      }`}
                    >
                      {level}
                    </motion.button>
                  ))}
                </div>
              </div>
            </>
          )}

          <Button
            onClick={isSignup ? handleSignIn : handleLogin}
            size="lg"
            text={isSignup ? "Register" : "Login"}
            variant="primary"
            className="w-full !mt-8 bg-gradient-to-r from-indigo-500 to-amber-500 hover:from-indigo-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg transition-all"
          />
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-700 dark:text-slate-400">
            {isSignup
              ? "Already have an account?"
              : "Don't have an account yet?"}{" "}
            <button
              onClick={() => {
                setIsSignUp(!isSignup);
                setConfirmPasswordError(false);
              }}
              className="font-semibold text-amber-600 dark:text-amber-400 hover:underline"
            >
              {isSignup ? "Log In" : "Register"}
            </button>
          </p>
        </div>

        <p className="mt-8 text-xs text-slate-500 dark:text-slate-500">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </Card>
    </section>
  );
}
