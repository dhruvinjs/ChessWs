import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, Input } from "../Components";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { ChessLevel } from "../types/chess";
import { useRegisterMutation } from "../hooks/useAuth";

export function Register() {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const [selectedLevel, setSelectedLevel] = useState<ChessLevel | "">("");
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const { mutate: register, isPending } = useRegisterMutation();

  const levels: ChessLevel[] = ["BEGINNER", "INTERMEDIATE", "PRO"];

  const inputStyles =
    "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 focus:outline-none text-slate-900 dark:text-slate-100 w-full transition-colors";

  // Validation helpers
  const getUsernameValidation = (username: string) => ({
    minLength: username.length >= 3,
    maxLength: username.length <= 20,
    validChars: /^[a-zA-Z0-9]+$/.test(username),
  });

  const getPasswordValidation = (password: string) => ({
    minLength: password.length >= 6,
    maxLength: password.length <= 100,
  });

  const usernameValidation = getUsernameValidation(username);
  const passwordValidation = getPasswordValidation(password);
  const isPasswordValid = passwordValidation.minLength && passwordValidation.maxLength;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
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

    // Client-side validation matches backend
    if (!isPasswordValid) {
      toast.error("Please ensure password meets all requirements.");
      return;
    }

    register({
      name,
      email,
      password,
      chessLevel: selectedLevel as ChessLevel,
    });
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-amber-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <Card title="Create Your Account" subtitle="Join the arena and challenge the best minds.">
        <form className="space-y-6" onSubmit={handleRegister}>
          <div className="space-y-2">
            <Input 
              type="text" 
              placeholder="Username" 
              inputRef={nameRef} 
              required 
              minLength={3} 
              maxLength={20} 
              className={inputStyles}
              onChange={(e) => setUsername(e.target.value)}
            />
            {username && (
              <div className="text-sm space-y-1">
                <div className={`flex items-center ${usernameValidation.minLength ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {usernameValidation.minLength ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <X className="w-4 h-4 mr-2" />
                  )}
                  At least 3 characters
                </div>
                <div className={`flex items-center ${usernameValidation.maxLength ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {usernameValidation.maxLength ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <X className="w-4 h-4 mr-2" />
                  )}
                  Maximum 20 characters
                </div>
                <div className={`flex items-center ${usernameValidation.validChars ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {usernameValidation.validChars ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <X className="w-4 h-4 mr-2" />
                  )}
                  Only letters and numbers
                </div>
              </div>
            )}
          </div>
          <Input type="email" placeholder="Email" inputRef={emailRef} required className={inputStyles} />
          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                inputRef={passwordRef}
                required
                className={inputStyles}
                onChange={(e) => setPassword(e.target.value)}
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
            {password && (
              <div className="text-sm space-y-1">
                <div className={`flex items-center ${passwordValidation.minLength ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {passwordValidation.minLength ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <X className="w-4 h-4 mr-2" />
                  )}
                  At least 6 characters
                </div>
                <div className={`flex items-center ${passwordValidation.maxLength ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {passwordValidation.maxLength ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <X className="w-4 h-4 mr-2" />
                  )}
                  Maximum 100 characters
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              inputRef={confirmPasswordRef}
              required
              className={inputStyles}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
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
            onClick={() => handleRegister({} as React.FormEvent)}
            size="lg"
            text={isPending ? "Creating Account..." : "Register"}
            variant="primary"
            loading={isPending}
            className="w-full bg-gradient-to-r from-indigo-500 to-amber-500 hover:from-indigo-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg"
          />
        </form>
        <div className="mt-6 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </Card>
    </section>
  );
}
