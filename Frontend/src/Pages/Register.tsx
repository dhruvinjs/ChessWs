import { useRef, useState } from "react";
import { Button, Card, Input } from "../Components";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { ChessLevel } from "../types/chess";

export function Register() {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const [selectedLevel, setSelectedLevel] = useState<ChessLevel | "">("");
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);

  const levels: ChessLevel[] = ["BEGINNER", "INTERMEDIATE", "PRO"];

  const inputStyles =
    "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 focus:outline-none text-slate-900 dark:text-slate-100 w-full transition-colors";

  const handleRegister = () => {
    setConfirmPasswordError(false);
    const name = nameRef.current?.value;
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;
    const confirmPassword = confirmPasswordRef.current?.value;

    if (!name || !email || !password || !confirmPassword || !selectedLevel) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError(true);
      toast.error("Passwords do not match.");
      return;
    }

    console.log("Register:", { name, email, password, selectedLevel });
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-amber-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <Card title="Create Your Account" subtitle="Join the arena and challenge the best minds.">
        <form className="space-y-6">
          <Input type="text" placeholder="Username" inputRef={nameRef} required minLength={3} maxLength={20} className={inputStyles} />
          <Input type="email" placeholder="Email" inputRef={emailRef} required className={inputStyles} />
          <Input type="password" placeholder="Password" inputRef={passwordRef} required className={inputStyles} />
          <Input type="password" placeholder="Confirm Password" inputRef={confirmPasswordRef} required className={inputStyles} />
          {confirmPasswordError && <p className="text-red-500 text-sm">Passwords do not match.</p>}

          <div className="pt-2">
            <p className="text-slate-700 dark:text-slate-300 mb-3 font-semibold">Select your skill level:</p>
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

          <Button
            onClick={handleRegister}
            size="lg"
            text="Register"
            variant="primary"
            className="w-full bg-gradient-to-r from-indigo-500 to-amber-500 hover:from-indigo-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg"
          />
        </form>
      </Card>
    </section>
  );
}
