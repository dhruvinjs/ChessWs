/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "../Button";
import { Card } from "../Card";
import { ConfirmDialog } from "../ConfirmDialog";
import { computerGameApi } from "../../api/api";

// Unicode representations for piece icons
const PIECE_WHITE = "♔";
const PIECE_BLACK = "♚";

interface DifficultyLevel {
  value: "EASY" | "MEDIUM" | "HARD";
  label: string;
  description: string;
}

interface PendingSetup {
  difficulty: "EASY" | "MEDIUM" | "HARD";
  playerColor: "w" | "b";
}

const difficultyLevels: DifficultyLevel[] = [
  {
    value: "EASY",
    label: "Pawn (Easy)",
    description: "Good for beginners, plays simple moves.",
  },
  {
    value: "MEDIUM",
    label: "Knight (Medium)",
    description: "Balanced challenge, uses basic tactics.",
  },
  {
    value: "HARD",
    label: "Queen (Hard)",
    description: "For experienced players, strategic and aggressive.",
  },
];

export const ComputerGameSetup: React.FC = () => {
  const navigate = useNavigate();

  // Local setup state
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "EASY" | "MEDIUM" | "HARD"
  >("MEDIUM");
  const [selectedColor, setSelectedColor] = useState<"w" | "b">("w");

  // Game Management State
  const [isCreating, setIsCreating] = useState(false);
  const [showExistingDialog, setShowExistingDialog] = useState(false);
  const [existingGameId, setExistingGameId] = useState<number | null>(null);
  const [pendingSetup, setPendingSetup] = useState<PendingSetup | null>(null);

  // --- Logic Functions ---

  const handleContinueExisting = () => {
    // console.log("👉 Continuing existing game:", existingGameId);
    setShowExistingDialog(false);
    setExistingGameId(null);
    setPendingSetup(null);

    // 🎯 FIX: Navigate to the game page - WebSocket will restore the game
    navigate("/computer/game");
  };

  const handleQuitAndStartNew = async () => {
    if (!existingGameId || !pendingSetup) {
      toast.error("Error starting new game.");
      return;
    }

    // console.log("🔄 Quitting existing game and starting new:", existingGameId);
    setShowExistingDialog(false);
    setIsCreating(true);

    try {
      // A. Quit the existing game
      await computerGameApi.cancelComputerGame(existingGameId);
      // console.log("✅ Existing game cancelled");

      // B. Small delay for cleanup
      await new Promise((resolve) => setTimeout(resolve, 500));

      // C. Create new game
      const response = await computerGameApi.createComputerGame(
        pendingSetup.difficulty,
        pendingSetup.playerColor
      );


      if (response.success === true) {
        navigate("/computer/game");
      } else {
        toast.error(response.message || "Failed to create new game");
      }
    } catch (error: any) {
      console.error("Failed to quit and create:", error);
      toast.error(error.response?.data?.message || "Failed to create game");
    } finally {
      setIsCreating(false);
      setExistingGameId(null);
      setPendingSetup(null);
    }
  };

  const handleStartGame = async () => {
    if (isCreating) return;

    setIsCreating(true);
    const difficulty = selectedDifficulty;
    const playerColor = selectedColor;

    setPendingSetup({ difficulty, playerColor });

    try {
      console.log("🎮 Creating game:", { difficulty, playerColor });
      const response = await computerGameApi.createComputerGame(
        difficulty,
        playerColor
      );


      if (response.success === true) {
        navigate("/computer/game");
        setPendingSetup(null);
      } else if (response.success === false && response.computerGameId) {
        // Scenario B: Existing game found - show dialog
        // console.log("⚠️ Existing game found:", response.computerGameId);
        setExistingGameId(response.computerGameId);
        setShowExistingDialog(true);
        // toast.error(response.message || "You have an active game");
      } else {
        // Scenario C: Unexpected response
        // console.error("❌ Unexpected response:", response);
        toast.error(response.message || "Failed to create game");
        setPendingSetup(null);
      }
    } catch (error: any) {
      // console.error("Failed to create game:", error);
      toast.error(
        error.response?.data?.message || "Failed to connect or create game"
      );
      setPendingSetup(null);
    } finally {
      // Only stop creating state if dialog is not showing
      if (!showExistingDialog) {
        setIsCreating(false);
      }
    }
  };

  return (
    <Card className="lg:max-w-lg space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
          Play vs Computer 🤖
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Set up your battle parameters.
        </p>
      </div>

      {/* Loading Indicator */}
      {isCreating && !showExistingDialog && (
        <div className="p-4 bg-orange-50 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-600 rounded-lg shadow-inner">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
              Creating Game... Please wait.
            </span>
          </div>
        </div>
      )}

      {/* Difficulty Selection */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
          Difficulty Level
        </h3>
        <div className="space-y-3">
          {difficultyLevels.map((level) => (
            <label
              key={level.value}
              className={`flex items-center p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer shadow-sm 
                ${
                  selectedDifficulty === level.value
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 ring-4 ring-amber-500/20 dark:ring-amber-500/10"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }
              `}
            >
              <input
                type="radio"
                name="difficulty"
                value={level.value}
                checked={selectedDifficulty === level.value}
                onChange={(e) =>
                  setSelectedDifficulty(
                    e.target.value as "EASY" | "MEDIUM" | "HARD"
                  )
                }
                className="mr-4 h-5 w-5 text-amber-600 border-gray-300 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <div className="flex-1">
                <div className="font-semibold text-lg text-gray-800 dark:text-white">
                  {level.label}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {level.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
          Choose Your Color
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* White Color Card */}
          <label
            className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg 
              ${
                selectedColor === "w"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-4 ring-blue-500/20 dark:ring-blue-500/10"
                  : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }
            `}
          >
            <input
              type="radio"
              name="color"
              value="w"
              checked={selectedColor === "w"}
              onChange={(e) => setSelectedColor(e.target.value as "w" | "b")}
              className="sr-only"
            />
            <div
              className={`text-5xl mb-3 ${
                selectedColor === "w"
                  ? "text-blue-600"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {PIECE_WHITE}
            </div>
            <div className="font-extrabold text-lg text-gray-900 dark:text-white">
              White
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 whitespace-nowrap">
              You play first!
            </div>
          </label>

          {/* Black Color Card */}
          <label
            className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg
              ${
                selectedColor === "b"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-4 ring-blue-500/20 dark:ring-blue-500/10"
                  : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }
            `}
          >
            <input
              type="radio"
              name="color"
              value="b"
              checked={selectedColor === "b"}
              onChange={(e) => setSelectedColor(e.target.value as "w" | "b")}
              className="sr-only"
            />
            <div
              className={`text-5xl mb-3 ${
                selectedColor === "b"
                  ? "text-blue-600"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {PIECE_BLACK}
            </div>
            <div className="font-extrabold text-lg text-gray-900 dark:text-white">
              Black
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 whitespace-nowrap">
              Computer plays first!
            </div>
          </label>
        </div>
      </div>

      {/* Start Button */}
      <Button
        variant="primary"
        size="lg"
        text={
          isCreating
            ? "Creating Game..."
            : `🎮 Start as ${selectedColor === "w" ? "White" : "Black"}`
        }
        onClick={handleStartGame}
        disabled={isCreating}
        className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-[1.01] transition-all duration-300 font-extrabold text-lg tracking-wide disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none disabled:transform-none"
      />

      {/* Existing Game Dialog */}
      <ConfirmDialog
        isOpen={showExistingDialog}
        onClose={handleQuitAndStartNew}
        onConfirm={handleContinueExisting}
        title="Active Game Found"
        message="You already have an active game. Do you want to continue it or quit and start a new one?"
        confirmText="Continue Game"
        cancelText="Quit & Start New"
      />
    </Card>
  );
};
