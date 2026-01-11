// import { memo } from 'react';
// import { useGameStore } from '../../stores/useGameStore';
// import { GameMessages } from '../../types/chess';
// import { GameControls } from './GameControls';
// import { GameTimers } from './GameTimers';

// // ✅ Separate component for turn indicator (low-frequency updates)
// const TurnIndicatorComponent = () => {
//   const fen = useGameStore((state) => state.fen);
//   const gameStatus = useGameStore((state) => state.gameStatus);

//   const turn = fen.split(' ')[1];
//   const isGameOver = gameStatus === GameMessages.GAME_OVER;
//   const turnText = isGameOver
//     ? 'Game Over'
//     : `${turn === 'w' ? 'White' : 'Black'}'s Turn`;

//   return (
//     <div className="flex items-center gap-2">
//       <div
//         className={`w-3 h-3 rounded-full ${
//           turn === 'w' ? 'bg-white' : 'bg-slate-900'
//         }`}
//       />
//       <p className="text-sm text-slate-300 font-medium">{turnText}</p>
//     </div>
//   );
// };

// const TurnIndicator = memo(TurnIndicatorComponent);

// // ✅ Main GameHeader - composed of isolated components
// export function GameHeader() {
//   return (
//     <div className="w-full flex flex-col gap-6">
//       {/* Top row: Timers and Turn */}
//       <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-between gap-4 w-full text-center sm:text-left">
//         {/* Timers - Updates every second */}
//         {/* <GameTimers layout="horizontal" /> */}

//         {/* Turn Indicator - Updates only on moves */}
//         <TurnIndicator />
//       </div>

//       {/* Bottom row: Controls - Never updates from timers */}
//       <GameControls />
//     </div>
//   );
// }
