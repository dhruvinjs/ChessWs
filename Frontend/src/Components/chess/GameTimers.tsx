// New file: GameTimers.tsx
import { memo } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { Timer } from './Timer'; // Assuming Timer is a sibling component

const GameTimersComponent = () => {
  // ONLY subscribe to the high-frequency state (timers)
  const whiteTimer = useGameStore((state) => state.whiteTimer);
  const blackTimer = useGameStore((state) => state.blackTimer);

  return (
    <div className="mb-6 space-y-3">
      <Timer
        time={whiteTimer}
        label="White"
        />
      <Timer
        time={blackTimer}
        label="Black"
        />
    </div>
  );
};

// Memoize the wrapper to ensure it only re-renders when its own subscribed state changes
export const GameTimers = memo(GameTimersComponent);