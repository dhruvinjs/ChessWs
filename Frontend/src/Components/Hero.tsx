import { Play, UserPlus } from "lucide-react";
import { HeroChessBoard } from "./HeroChessBoard";
import { Button } from "./Button";
import { useNavigate } from "react-router-dom";
import { useStatsQuery } from "../hooks/useGame";
import { FloatingPieces } from "./FloatingPieces";
import { useUserQuery } from "../hooks/useUserQuery";
import { LoadingScreen } from "./LoadingScreen";

export function Hero() {
  const { data: user, isLoading: isUserLoading } = useUserQuery();

  // ✅ Fetch all stats (guest and room games)
  const { isLoading: isStatsLoading, data: stats } = useStatsQuery();

  const nav = useNavigate();
  const handleLogin = () => {
    if (user?.isGuest || !user) {
      nav("/login"); // ✅ redirect if not logged in
      return;
    }
    nav("/room"); // or your join room route
  };

  if (isUserLoading) {
    return <LoadingScreen />; // show a loading state until user info is ready
  }
  return (
    <section className="min-h-screen pt-10 pb-16 bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-black dark:via-gray-900 dark:to-amber-950 overflow-hidden relative transition-colors duration-300">
      {/* Background gradients & floating pieces */}
      <FloatingPieces />

      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center min-h-[80vh]">
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-slate-900 dark:text-white">Play</span>
                <span className="block bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 dark:from-amber-400 dark:via-orange-400 dark:to-red-400 bg-clip-text text-transparent animate-pulse">
                  Chess
                </span>
                <span className="text-slate-800 dark:text-slate-200">
                  Anywhere
                </span>
                <span className="block text-slate-800 dark:text-slate-200">
                  AnyTime
                </span>
              </h1>
            </div>
            {/* Description */}
            <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              The simplest way to play chess online. Challenge the AI, host a
              private room for friends, or jump into a match instantly.
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                {" "}
                No accounts, no fuss.
              </span>
            </p>
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                variant="primary"
                size="lg"
                text="Quick Match"
                onClick={() => nav("/game")}
                icon={<Play className="h-6 w-6" />}
              />
              <Button
                variant="outline"
                size="lg"
                text="Sign In"
                onClick={handleLogin}
                icon={<UserPlus className="h-6 w-6" />}
              />
            </div>
            {/* Stats */}
            <div className="">
              <div className="grid grid-cols-2 gap-12 max-w-sm">
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-2">
                    {isStatsLoading
                      ? "Loading..."
                      : stats?.guestGamesCount?.toLocaleString() || "0"}
                  </div>
                  <div className="text-base lg:text-lg text-slate-600 dark:text-slate-400 font-medium">
                    Guest Games Played
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-2">
                    {isStatsLoading
                      ? "Loading..."
                      : stats?.roomsCount?.toLocaleString() || "0"}
                  </div>
                  <div className="text-base lg:text-lg text-slate-600 dark:text-slate-400 font-medium">
                    Rooms Hosted
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="mt-16 lg:mt-0 lg:col-span-6">
            <HeroChessBoard />
          </div>
        </div>
      </div>
    </section>
  );
}
