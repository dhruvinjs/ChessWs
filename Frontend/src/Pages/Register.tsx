import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '../Components';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { ChessLevel } from '../types/chess';
import { useRegisterMutation } from '../hooks/useAuth';

export function Register() {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const [selectedLevel, setSelectedLevel] = useState<ChessLevel | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');

  const { mutate: register, isPending } = useRegisterMutation();

  const levels: ChessLevel[] = ['BEGINNER', 'INTERMEDIATE', 'PRO'];

  // Updated Validation: Special character nikal diya hai
  const validations = {
    length: password.length >= 8,
    hasNumber: /\d/.test(password),
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    const name = nameRef.current?.value;
    const email = emailRef.current?.value;
    const confirmPassword = confirmPasswordRef.current?.value;

    if (!name || !email || !password || !confirmPassword || !selectedLevel) {
      toast.error('Opps! Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!validations.length || !validations.hasNumber) {
      toast.error('Password requirements not met');
      return;
    }

    register({ name, email, password, chessLevel: selectedLevel });
  };

  return (
    <div className="min-h-screen w-full flex items-stretch bg-white dark:bg-gray-950">
      
      {/* LEFT SIDE: Branding - Hidden on mobile, Flex on Desktop */}
      <div className="hidden lg:flex w-1/2 relative bg-indigo-600 items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 opacity-90" />
        
        {/* Animated Background Shapes */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" 
        />
        
        <div className="relative z-10 text-white max-w-lg">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h1 className="text-7xl font-black leading-tight tracking-tighter">
              Join the <br/><span className="text-amber-400">Elite.</span>
            </h1>
            <p className="text-xl text-indigo-100 font-medium leading-relaxed">
              Create your profile and challenge the best minds in the world of chess.
            </p>
          </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE: Form Section - Fully Responsive */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-16 bg-slate-50 dark:bg-gray-950">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[420px] space-y-8"
        >
          {/* Header */}
          <div className="text-center lg:text-left space-y-2">
            
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Get Started
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Start your grandmaster journey today.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Input
                  inputRef={nameRef}
                  placeholder="Full Name"
                  type="text"
                  className="w-full rounded-xl py-3.5 px-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <Input
                  inputRef={emailRef}
                  placeholder="Email Address"
                  type="email"
                  className="w-full rounded-xl py-3.5 px-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    inputRef={passwordRef}
                    placeholder="Password"
                    type={showPassword ? 'text' : 'password'}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl py-3.5 px-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 pr-12 focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Validation - Special Char Removed */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap gap-x-6 gap-y-2">
                  <ValidationItem met={validations.length} text="8+ Characters" />
                  <ValidationItem met={validations.hasNumber} text="1+ Number" />
                </div>
              </div>

              <div className="relative">
                <Input
                  inputRef={confirmPasswordRef}
                  placeholder="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full rounded-xl py-3.5 px-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 pr-12 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Experience Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {levels.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSelectedLevel(level)}
                    className={`py-3 rounded-xl font-bold text-[10px] uppercase transition-all duration-200 border ${
                      selectedLevel === level
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-indigo-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              text={isPending ? 'Working...' : 'Register'}
              variant="primary"
              loading={isPending}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all"
            />
          </form>

          <p className="text-center font-semibold text-slate-500 dark:text-slate-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:underline font-bold">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function ValidationItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 text-[11px] font-bold transition-colors ${met ? 'text-emerald-500' : 'text-slate-400'}`}>
      <div className={`h-1.5 w-1.5 rounded-full ${met ? 'bg-emerald-500' : 'bg-slate-300'}`} />
      <span>{text}</span>
    </div>
  );
}