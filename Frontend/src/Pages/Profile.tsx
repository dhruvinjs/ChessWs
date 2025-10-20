import { useState, useEffect } from "react";
import { User, Trophy, Clock, Target, Star, Edit3, Camera } from "lucide-react";
import { Button, Input } from "../Components";
import { useThemeStore } from "../stores/useThemeStore";
import { useUserStore } from "../stores/useUserStore";
import { AnimatedChessPieces } from "../Components/AnimatedChessPieces";

export function Profile() {
  const { initTheme } = useThemeStore();
  const { user, isGuest } = useUserStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "Guest",
    username: user?.id || "guest_user",
    email: "guest@example.com",
    rating: 1200,
    country: "Unknown",
    chessLevel: user?.chessLevel || "BEGINNER",
  });

  // Stats (temporary mock)
  const stats = [
    { label: "Games Played", value: "1,247", icon: <Target className="w-5 h-5" /> },
    { label: "Win Rate", value: "68%", icon: <Trophy className="w-5 h-5" /> },
    { label: "Best Rating", value: "1,923", icon: <Star className="w-5 h-5" /> },
    { label: "Time Played", value: "342h", icon: <Clock className="w-5 h-5" /> },
  ];

  // Recent games (keep as is)
  const recentGames = [
    { opponent: "AlexChess99", result: "Win", rating: "+12", time: "2 hours ago" },
    { opponent: "QueenGambit", result: "Loss", rating: "-8", time: "5 hours ago" },
    { opponent: "KnightRider", result: "Win", rating: "+15", time: "1 day ago" },
    { opponent: "PawnStorm", result: "Draw", rating: "+2", time: "2 days ago" },
  ];

  const handleSave = () => setIsEditing(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 py-8">
      <AnimatedChessPieces/>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Header */}
        <div className="border border-slate-200 dark:border-slate-700 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-xl p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-900 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                <User className="w-16 h-16" />
              </div>
              <button className="absolute bottom-2 right-2 bg-white dark:bg-slate-700 p-2 rounded-full shadow-lg hover:shadow-xl transition-all">
                <Camera className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={profileData.email}
                    required
                  />
                  <Input
                    type="text"
                    placeholder="Username"
                    value={profileData.name}
                    required
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    {profileData.name}
                  </h1>
                  <p className="text-lg text-slate-600 dark:text-slate-400">
                    {profileData.email}
                  </p>
                  <p className="mt-1 text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
                    {profileData.chessLevel}
                  </p>
                </div>
              )}

              {/* Rating */}
              
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <Button variant="primary" size="md" onClick={handleSave} text="Save Changes" />
                  <Button variant="outline" size="md" onClick={() => setIsEditing(false)} text="Cancel" />
                </>
              ) : (
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsEditing(true)}
                  text="Edit Profile"
                  icon={<Edit3 className="w-4 h-4" />}
                />
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="border border-slate-200 dark:border-slate-700 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Statistics
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-4 bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-700 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="text-indigo-600 dark:text-indigo-400 mb-2 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Games */}
        <div className="border border-slate-200 dark:border-slate-700 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Recent Games
          </h2>
          <div className="space-y-4">
            {recentGames.map((game, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800/80 rounded-xl hover:shadow-md transition-all border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 dark:from-indigo-700 dark:to-indigo-900 rounded-full flex items-center justify-center text-white font-bold">
                    {game.opponent[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      vs {game.opponent}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {game.time}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-bold ${
                      game.result === "Win"
                        ? "text-green-600"
                        : game.result === "Loss"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {game.result}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {game.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
