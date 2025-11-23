import React, { useState } from "react";
import { Button } from "../Button";

interface DifficultyLevel {
  value: "EASY" | "MEDIUM" | "HARD";
  label: string;
  description: string;
}

interface GameSetupProps {
  onStartGame: (difficulty: "EASY" | "MEDIUM" | "HARD", playerColor: "w" | "b") => void;
  isConnected: boolean;
}

const difficultyLevels: DifficultyLevel[] = [
  {
    value: "EASY",
    label: "Easy",
    description: "Good for beginners"
  },
  {
    value: "MEDIUM", 
    label: "Medium",
    description: "Balanced challenge"
  },
  {
    value: "HARD",
    label: "Hard",
    description: "For experienced players"
  }
];

export const ComputerGameSetup: React.FC<GameSetupProps> = ({ onStartGame, isConnected }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [selectedColor, setSelectedColor] = useState<"w" | "b">("w");

  const handleStartGame = () => {
    if (!isConnected) return;
    onStartGame(selectedDifficulty, selectedColor);
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Play vs Computer
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Choose your settings and start a new game
        </p>
      </div>

      {/* Difficulty Selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Difficulty Level
        </h3>
        <div className="space-y-2">
          {difficultyLevels.map((level) => (
            <label
              key={level.value}
              className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedDifficulty === level.value
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <input
                type="radio"
                name="difficulty"
                value={level.value}
                checked={selectedDifficulty === level.value}
                onChange={(e) => setSelectedDifficulty(e.target.value as "EASY" | "MEDIUM" | "HARD")}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-800 dark:text-white">
                  {level.label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {level.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Choose Your Color
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`flex flex-col items-center p-4 rounded-lg border cursor-pointer transition-colors ${
              selectedColor === "w"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <input
              type="radio"
              name="color"
              value="w"
              checked={selectedColor === "w"}
              onChange={(e) => setSelectedColor(e.target.value as "w" | "b")}
              className="sr-only"
            />
            <div className="text-4xl mb-2">♔</div>
            <div className="font-medium text-gray-800 dark:text-white">
              White
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              You play first
            </div>
          </label>

          <label
            className={`flex flex-col items-center p-4 rounded-lg border cursor-pointer transition-colors ${
              selectedColor === "b"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <input
              type="radio"
              name="color"
              value="b"
              checked={selectedColor === "b"}
              onChange={(e) => setSelectedColor(e.target.value as "w" | "b")}
              className="sr-only"
            />
            <div className="text-4xl mb-2">♚</div>
            <div className="font-medium text-gray-800 dark:text-white">
              Black
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Computer plays first
            </div>
          </label>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-600 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-yellow-700 dark:text-yellow-300">
              Connecting to game server...
            </span>
          </div>
        </div>
      )}

      {/* Start Button */}
      <Button
        variant="primary"
        size="lg"
        text={isConnected ? "🎮 Start Game" : "Connecting..."}
        onClick={handleStartGame}
        disabled={!isConnected}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
      />
    </div>
  );
};