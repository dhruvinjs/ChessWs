import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Navbar } from '../Components/Navbar';
import { useUserQuery } from '../hooks/useUserQuery';
import { LoadingScreen } from '../Components/LoadingScreen';

export function PublicLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user, isLoading } = useUserQuery();


  useEffect(() => {
    if (isLoading) return;

    const authPages = ['/login', '/register','/'];
    const isOnAuthPage = authPages.includes(location.pathname);

    if (user && !user.isGuest && isOnAuthPage) {
      navigate('/home', { replace: true });
    }
    // console.log(user)
  }, [user, isLoading, location.pathname, navigate]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
    </div>
  );
}
