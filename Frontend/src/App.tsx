    import { BrowserRouter, Route, Routes } from "react-router-dom";
    import { Landing, Room, About, ChessGame, Login, Home, NotFound } from "./Pages";
    import { ToastProvider } from "./Components/ToastMessages";
    import { Register } from "./Pages/Register";
    import { PublicLayout } from "./Layout/PublicLayout";
    import { ProtectedLayout } from "./Layout/ProtectedLayout";
    import { Profile } from "./Pages/Profile";
    import { useUserQuery } from "./hooks/useUserQuery"; 
    import { LoadingScreen } from "./Components/LoadingScreen";
import { RoomChessPage } from "./Pages/RoomChessPage";
import { useAppSetup } from "./hooks/useAppTheme";

    export function App() {
      useAppSetup()
      const { data: user, isLoading, isError, error } = useUserQuery();

      // ✅ Don't auto-connect here - let individual game pages handle their own connections
      // This prevents conflicts between guest mode and room mode connections

      if (isLoading) return <LoadingScreen />;

      if (isError) {
        return (
          <div
            className="flex flex-col items-center justify-center h-screen gap-4 
                      bg-gradient-to-b from-slate-50 to-white 
                      dark:from-slate-900 dark:to-slate-800 
                      border-t border-slate-200 dark:border-slate-700"
          >
            <p className="text-slate-800 dark:text-slate-100 text-lg font-semibold">
              Error fetching user: {error?.message || "Unknown error"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 
                        text-white font-medium transition-colors duration-150"
            >
              Retry
            </button>
          </div>
        );
      }

      if (!user) return <LoadingScreen />;

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
            </Route>


            <Route path="*" element={<NotFound />} />
          </Routes>

          <ToastProvider />
        </BrowserRouter>
      );
    }
