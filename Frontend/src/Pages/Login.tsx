import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Input } from "../Components";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Eye, EyeOff,  Trophy, Zap } from "lucide-react";
import { useLoginMutation } from "../hooks/useAuth";

export function Login() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: login, isPending } = useLoginMutation();

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
    <div className="min-h-screen w-full flex items-stretch bg-white dark:bg-gray-950">
      
      {/* LEFT SIDE: Branding - Hidden on mobile, Flex on Desktop */}
      <div className="hidden lg:flex w-1/2 relative bg-indigo-600 items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-900 opacity-95" />
        
        {/* Animated Background Element */}
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px]" 
        />
        
        <div className="relative z-10 text-white max-w-lg text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-7xl font-black leading-tight tracking-tighter">
                Welcome <br/><span className="text-amber-400">Back.</span>
              </h1>
              <p className="text-xl text-indigo-100 font-medium leading-relaxed opacity-90">
                Log in to continue your climb to the top. Your opponents are waiting.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="h-10 w-10 rounded-xl bg-amber-400/20 flex items-center justify-center">
                  <Trophy className="text-amber-400 h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Resume Progress</p>
                  <p className="text-xs text-indigo-200">Pick up right where you left off.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="h-10 w-10 rounded-xl bg-indigo-400/20 flex items-center justify-center">
                  <Zap className="text-indigo-300 h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Fast Matchmaking</p>
                  <p className="text-xs text-indigo-200">Connect with players in seconds.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE: Form Section - Fully Responsive */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50 dark:bg-gray-950">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[400px] space-y-10"
        >
          {/* Header */}
          <div className="text-center lg:text-left space-y-3">
           
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Sign In
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Enter your credentials to access your account.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <Input
                  required={true}
                  inputRef={emailRef}
                  placeholder="name@example.com"
                  type="email"
                  className="w-full rounded-xl py-4 px-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Password
                  </label>
                  
                </div>
                <div className="relative">
                  <Input
                  required={true}
                    inputRef={passwordRef}
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    className="w-full rounded-xl py-4 px-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 pr-12 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              text={isPending ? 'Signing in...' : 'Sign In'}
              variant="primary"
              loading={isPending}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all text-base"
            />
          </form>

          <div className="pt-4 text-center">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              New to the ChessVerse?{' '}
              <Link to="/register" className="text-indigo-600 hover:underline font-bold decoration-2 underline-offset-4">
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}