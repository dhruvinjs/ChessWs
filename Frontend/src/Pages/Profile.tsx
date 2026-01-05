import { useState, useMemo, useRef } from "react";
import {
  User,
  Trophy,
  Clock,
  Target,
  Star,
  Edit3,
  Monitor,
  Users,
  TrendingDown,
  Handshake,
  X,
  Minus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input } from "../Components";
import { authApis, ProfileResponse } from "../api/api";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

type GameFilter = "all" | "computer" | "room" | "guest";

export function Profile() {
  const queryClient = useQueryClient();

  // Fetch profile data directly with useQuery
  const {
    data: profileData,
    isLoading,
    isError,
  } = useQuery<ProfileResponse>({
    queryKey: ["profile"],
    queryFn: () => authApis.getProfile(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: authApis.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [gameFilter, setGameFilter] = useState<GameFilter>("all");
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  // Use refs for form inputs instead of state
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const toggleCardFlip = (index: number) => {
    setFlippedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Get the userProfile from response
  const userProfile = profileData?.userProfile;

  // Compute stats from profile data
  const stats = useMemo(() => {
    if (!userProfile?.stats) {
      return [
        {
          front: {
            label: "Games Played",
            value: "0",
            icon: <Target className="w-5 h-5" />,
          },
          back: null,
        },
        {
          front: {
            label: "Win Rate",
            value: "0%",
            icon: <Trophy className="w-5 h-5" />,
          },
          back: {
            label: "Loss Rate",
            value: "0%",
            icon: <TrendingDown className="w-5 h-5" />,
          },
        },
        {
          front: {
            label: "Total Wins",
            value: "0",
            icon: <Star className="w-5 h-5" />,
          },
          back: {
            label: "Total Losses",
            value: "0",
            icon: <TrendingDown className="w-5 h-5" />,
          },
        },
        {
          front: {
            label: "Time Played",
            value: "0h",
            icon: <Clock className="w-5 h-5" />,
          },
          back: {
            label: "Total Draws",
            value: "0",
            icon: <Handshake className="w-5 h-5" />,
          },
        },
      ];
    }

    const { computer, room } = userProfile.stats;
    const guest = userProfile.stats.guest || {
      total: 0,
      won: 0,
      lost: 0,
      drawn: 0,
    };
    const totalGames = computer.total + room.total + guest.total;
    const totalWins = computer.won + room.won + guest.won;
    const totalLosses = computer.lost + room.lost + guest.lost;
    const totalDraws = computer.drawn + room.drawn + guest.drawn;
    const winRate =
      totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
    const lossRate =
      totalGames > 0 ? Math.round((totalLosses / totalGames) * 100) : 0;

    return [
      {
        front: {
          label: "Games Played",
          value: totalGames.toLocaleString(),
          icon: <Target className="w-5 h-5" />,
        },
        back: null, // No flip for this card
      },
      {
        front: {
          label: "Win Rate",
          value: `${winRate}%`,
          icon: <Trophy className="w-5 h-5" />,
        },
        back: {
          label: "Loss Rate",
          value: `${lossRate}%`,
          icon: <TrendingDown className="w-5 h-5" />,
        },
      },
      {
        front: {
          label: "Total Wins",
          value: totalWins.toLocaleString(),
          icon: <Star className="w-5 h-5" />,
        },
        back: {
          label: "Total Losses",
          value: totalLosses.toLocaleString(),
          icon: <TrendingDown className="w-5 h-5" />,
        },
      },
      {
        front: {
          label: "Time Played",
          value: userProfile.totalTimePlayed || "0h",
          icon: <Clock className="w-5 h-5" />,
        },
        back: {
          label: "Total Draws",
          value: totalDraws.toLocaleString(),
          icon: <Handshake className="w-5 h-5" />,
        },
      },
    ];
  }, [userProfile]);

  // Compute recent games from profile data
  const recentGames = useMemo(() => {
    if (!userProfile?.recentGames) return [];

    const games: Array<{
      opponent: string;
      opponentLevel?: string;
      result: string;
      type: "Computer" | "Room" | "Guest";
      time: string;
      createdAt: Date;
    }> = [];

    // Add computer games won
    if (gameFilter === "all" || gameFilter === "computer") {
      userProfile.recentGames.computerGamesWon?.forEach((game) => {
        games.push({
          opponent: `Computer (${game.computerDifficulty})`,
          result: game.draw ? "Draw" : "Win",
          type: "Computer",
          time: formatTimeAgo(new Date(game.createdAt)),
          createdAt: new Date(game.createdAt),
        });
      });

      // Add computer games lost
      userProfile.recentGames.computerGamesLost?.forEach((game) => {
        games.push({
          opponent: `Computer (${game.computerDifficulty})`,
          result: game.draw ? "Draw" : "Loss",
          type: "Computer",
          time: formatTimeAgo(new Date(game.createdAt)),
          createdAt: new Date(game.createdAt),
        });
      });

      // Add computer games in progress
      userProfile.recentGames.computerGamesInProgress?.forEach((game) => {
        games.push({
          opponent: `Computer (${game.computerDifficulty})`,
          result: "In Progress",
          type: "Computer",
          time: formatTimeAgo(new Date(game.createdAt)),
          createdAt: new Date(game.createdAt),
        });
      });
    }

    // Add room games won
    if (gameFilter === "all" || gameFilter === "room") {
      userProfile.recentGames.roomGamesWon?.forEach((game) => {
        games.push({
          opponent: game.loser?.name || "Unknown",
          opponentLevel: game.loser?.chessLevel,
          result: game.draw ? "Draw" : "Win",
          type: "Room",
          time: formatTimeAgo(new Date(game.createdAt)),
          createdAt: new Date(game.createdAt),
        });
      });

      // Add room games lost
      userProfile.recentGames.roomGamesLost?.forEach((game) => {
        games.push({
          opponent: game.loser?.name || "Unknown",
          opponentLevel: game.loser?.chessLevel,
          result: game.draw ? "Draw" : "Loss",
          type: "Room",
          time: formatTimeAgo(new Date(game.createdAt)),
          createdAt: new Date(game.createdAt),
        });
      });
    }

    // Add guest games
    if (gameFilter === "all" || gameFilter === "guest") {
      userProfile.recentGames.guestGamesWon?.forEach((game) => {
        games.push({
          opponent: "Guest Player",
          result: "Win",
          type: "Guest",
          time: formatTimeAgo(new Date(game.createdAt)),
          createdAt: new Date(game.createdAt),
        });
      });

      userProfile.recentGames.guestGamesLost?.forEach((game) => {
        games.push({
          opponent: "Guest Player",
          result: "Loss",
          type: "Guest",
          time: formatTimeAgo(new Date(game.createdAt)),
          createdAt: new Date(game.createdAt),
        });
      });

      userProfile.recentGames.guestGamesDrawn?.forEach((game) => {
        games.push({
          opponent: "Guest Player",
          result: "Draw",
          type: "Guest",
          time: formatTimeAgo(new Date(game.createdAt)),
          createdAt: new Date(game.createdAt),
        });
      });
    }

    // Sort by createdAt date (most recent first) and take first 10
    return games
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);
  }, [userProfile, gameFilter]);

  const handleSave = () => {
    const name = nameRef.current?.value;
    const email = emailRef.current?.value;

    if (!name && !email) {
      toast.error("Please enter at least one field to update");
      return;
    }

    const payload: { name?: string; email?: string } = {};
    if (name && name !== userProfile?.user.name) payload.name = name;
    if (email && email !== userProfile?.user.email) payload.email = email;

    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      return;
    }

    updateProfileMutation.mutate(payload);
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // Redirect unauthorized users to login
  if (!userProfile || isError) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Header */}
        <div className="border border-slate-200 dark:border-slate-700 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-xl p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-900 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                <User className="w-16 h-16" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Email"
                    inputRef={emailRef}
                    value={userProfile.user.email}
                    required
                  />
                  <Input
                    type="text"
                    placeholder="Username"
                    inputRef={nameRef}
                    value={userProfile.user.name}
                    required
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    {userProfile?.user?.name || "Guest"}
                  </h1>
                  <p className="text-lg text-slate-600 dark:text-slate-400">
                    {userProfile?.user?.email || ""}
                  </p>
                  <p className="mt-1 text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
                    {userProfile?.user?.chessLevel || "BEGINNER"}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSave}
                    text={
                      updateProfileMutation.isPending
                        ? "Saving..."
                        : "Save Changes"
                    }
                    disabled={updateProfileMutation.isPending}
                  />
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setIsEditing(false)}
                    text="Cancel"
                    disabled={updateProfileMutation.isPending}
                  />
                </>
              ) : (
                <Button
                  variant="outline"
                  size="md"
                  onClick={startEditing}
                  text="Edit Profile"
                  icon={<Edit3 className="w-4 h-4" />}
                />
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="border border-slate-200 dark:border-slate-700 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Statistics
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">
              ✨ Tap the glowing cards to reveal more stats
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const isFlipped = flippedCards[index];
              const hasBack = stat.back !== null;

              return (
                <div
                  key={index}
                  className="perspective-1000"
                  style={{ perspective: "1000px" }}
                >
                  <motion.div
                    onClick={() => hasBack && toggleCardFlip(index)}
                    className={`relative w-full h-32 ${
                      hasBack ? "cursor-pointer" : ""
                    }`}
                    initial={false}
                    animate={{ rotateY: isFlipped && hasBack ? 180 : 0 }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    whileHover={hasBack ? { scale: 1.05 } : {}}
                    whileTap={hasBack ? { scale: 0.98 } : {}}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Front Face */}
                    <div
                      className="absolute inset-0 text-center p-4 rounded-xl border bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <div className="text-indigo-600 dark:text-indigo-400 mb-2">
                        {stat.front.icon}
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                        {stat.front.value}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {stat.front.label}
                      </div>
                      {hasBack && (
                        <motion.div
                          className="absolute top-2 right-2"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <div className="w-2 h-2 rounded-full bg-indigo-400 dark:bg-indigo-500" />
                        </motion.div>
                      )}
                    </div>

                    {/* Back Face */}
                    {hasBack && (
                      <div
                        className="absolute inset-0 text-center p-4 rounded-xl border bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-slate-700 border-red-200 dark:border-red-800 flex flex-col items-center justify-center"
                        style={{
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                        }}
                      >
                        <div className="text-red-600 dark:text-red-400 mb-2">
                          {stat.back.icon}
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                          {stat.back.value}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {stat.back.label}
                        </div>
                        <motion.div
                          className="absolute top-2 right-2"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <div className="w-2 h-2 rounded-full bg-red-400 dark:bg-red-500" />
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Games */}
        <div className="border border-slate-200 dark:border-slate-700 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Recent Games
            </h2>
            {/* Game Type Filter Tabs */}
            <div className="relative flex bg-slate-200/50 dark:bg-slate-700/50 p-1 rounded-xl border border-slate-300 dark:border-slate-600">
              {(["all", "computer", "room", "guest"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setGameFilter(filter)}
                  className={`relative z-10 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    gameFilter === filter
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-600/50"
                  }`}
                >
                  {filter === "computer" && <Monitor className="w-4 h-4" />}
                  {filter === "room" && <Users className="w-4 h-4" />}
                  {filter === "guest" && <User className="w-4 h-4" />}
                  {filter === "all"
                    ? "All"
                    : filter === "computer"
                    ? "Computer"
                    : filter === "room"
                    ? "Room"
                    : "Guest"}
                </button>
              ))}
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={gameFilter}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {recentGames.length === 0 ? (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                  No games played yet. Start playing to see your history!
                </p>
              ) : (
                recentGames.map((game, index) => {
                  // Determine styling based on result
                  const resultConfig = {
                    Win: {
                      bgClass:
                        "bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10",
                      borderClass: "border-green-200 dark:border-green-800/50",
                      textClass: "text-green-600 dark:text-green-400",
                      iconBgClass: "bg-green-100 dark:bg-green-900/30",
                      icon: <Trophy className="w-5 h-5" />,
                      label: "Victory",
                    },
                    Loss: {
                      bgClass:
                        "bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10",
                      borderClass: "border-red-200 dark:border-red-800/50",
                      textClass: "text-red-600 dark:text-red-400",
                      iconBgClass: "bg-red-100 dark:bg-red-900/30",
                      icon: <X className="w-5 h-5" />,
                      label: "Defeat",
                    },
                    Draw: {
                      bgClass:
                        "bg-gradient-to-r from-amber-50 to-yellow-100/50 dark:from-amber-900/20 dark:to-yellow-800/10",
                      borderClass: "border-amber-200 dark:border-amber-800/50",
                      textClass: "text-amber-600 dark:text-amber-400",
                      iconBgClass: "bg-amber-100 dark:bg-amber-900/30",
                      icon: <Minus className="w-5 h-5" />,
                      label: "Draw",
                    },
                    "In Progress": {
                      bgClass:
                        "bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10",
                      borderClass: "border-blue-200 dark:border-blue-800/50",
                      textClass: "text-blue-600 dark:text-blue-400",
                      iconBgClass: "bg-blue-100 dark:bg-blue-900/30",
                      icon: <Clock className="w-5 h-5" />,
                      label: "In Progress",
                    },
                  };

                  const config =
                    resultConfig[game.result as keyof typeof resultConfig] ||
                    resultConfig["In Progress"];

                  return (
                    <motion.div
                      key={`${gameFilter}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className={`flex items-center justify-between p-4 rounded-xl hover:shadow-md transition-all border ${config.bgClass} ${config.borderClass}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 dark:from-indigo-700 dark:to-indigo-900 rounded-full flex items-center justify-center text-white font-bold">
                          {game.opponent[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            vs {game.opponent}
                            {game.opponentLevel && (
                              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                {game.opponentLevel}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {game.time} • {game.type}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-full ${config.iconBgClass} ${config.textClass}`}
                        >
                          {config.icon}
                        </div>
                        <div className={`font-bold ${config.textClass}`}>
                          {config.label}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "Just now";
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}
