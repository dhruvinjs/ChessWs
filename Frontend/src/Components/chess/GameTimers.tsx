// GameTimers.tsx - Reusable memoized timer component
import { memo } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { Timer } from './Timer';

interface GameTimersProps {
  layout?: 'vertical' | 'horizontal';
}

const GameTimersComponent = ({ layout = 'vertical' }: GameTimersProps) => {
  // ONLY subscribe to the high-frequency state (timers)
  const whiteTimer = useGameStore((state) => state.whiteTimer);
  const blackTimer = useGameStore((state) => state.blackTimer);

  const containerClass =
    layout === 'horizontal'
      ? 'flex flex-col sm:flex-row items-center gap-2'
      : 'mb-6 space-y-3';

  return (
    <div className={containerClass}>
      <Timer time={whiteTimer} label="White" />
      <Timer time={blackTimer} label="Black" />
    </div>
  );
};

// Memoize the wrapper to ensure it only re-renders when its own subscribed state changes
export const GameTimers = memo(GameTimersComponent);
