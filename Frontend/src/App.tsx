import { BrowserRouter, Route, Routes } from 'react-router-dom';
import {
  Landing,
  Room,
  About,
  ChessGame,
  Login,
  Home,
  NotFound,
} from './Pages';
import { ToastProvider } from './Components/ToastMessages';
import { Register } from './Pages/Register';
import { PublicLayout } from './Layout/PublicLayout';
import { ProtectedLayout } from './Layout/ProtectedLayout';
import { Profile } from './Pages/Profile';
import { useUserQuery } from './hooks/useUserQuery';
import { LoadingScreen } from './Components/LoadingScreen';
import { RoomChessPage } from './Pages/RoomChessPage';
import { ComputerChessPage } from './Pages/ComputerChessPage';
import { useAppSetup } from './hooks/useAppTheme';
import { ComputerGameSetupPage } from './Pages/ComputerGameSetupPage';

export function App() {
  useAppSetup();
  const { isLoading } = useUserQuery();

  // ✅ Show loading screen while fetching user data
  if (isLoading) {
    return <LoadingScreen />;
  }

  // ✅ If there's an error OR no user data, still render the app
  // The layouts will handle authentication and redirects
  // This prevents white screen for unauthorized users

  return (
    <BrowserRouter>
      <Routes>
        {/* 🔓 Public Layout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* 🔒 Protected Layout */}
        <Route element={<ProtectedLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/game" element={<ChessGame />} />
          <Route path="/room" element={<Room />} />
          <Route path="/room/:roomId" element={<RoomChessPage />} />
          <Route path="/computer" element={<ComputerGameSetupPage />} />
          <Route path="/computer/game/" element={<ComputerChessPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastProvider />
    </BrowserRouter>
  );
}
