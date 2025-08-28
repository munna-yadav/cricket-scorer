import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HomeScreen } from './components/HomeScreen';
import { WatchMatch } from './components/WatchMatch';
import { StartGame } from './components/StartGame';
import { PlayMatch } from './components/game/PlayMatch';
import { MatchComplete } from './components/MatchComplete';
import { GameProvider } from './contexts/GameContext';
import { useMatches } from './hooks/useMatches';
import { createMatch } from './services/matchService';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { AdminPage } from './components/admin/AdminPage';
import { LoginPage } from './components/admin/LoginPage';
import { isAdmin } from './services/authService';
import { MatchBrowser } from './components/MatchBrowser';

// Admin protection wrapper component
function AdminRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    async function checkAdminStatus() {
      const adminStatus = await isAdmin();
      setIsAuthenticated(adminStatus);
    }
    
    checkAdminStatus();
  }, []);
  
  if (isAuthenticated === null) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? <>{children}</> : <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} onBack={() => window.location.href = '/'} />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Home route */}
        <Route path="/" element={<HomeScreen />} />

        {/* Match creation and play routes */}
        <Route path="/start" element={<StartGame />} />
        <Route path="/match/:matchId" element={
          <GameProvider>
            <PlayMatch />
          </GameProvider>
        } />
        <Route path="/match/:matchId/completed" element={
          <GameProvider>
            <MatchComplete />
          </GameProvider>
        } />

        {/* Watch matches route */}
        <Route path="/watch" element={<MatchBrowser />} />
        <Route path="/watch/:matchId" element={
          <GameProvider>
            <PlayMatch isSpectatorMode={true} />
          </GameProvider>
        } />
        <Route path="/watch/:matchId/completed" element={
          <GameProvider>
            <MatchComplete isSpectatorMode={true} />
          </GameProvider>
        } />

        {/* Admin route */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminPage onBack={() => window.location.href = '/'} />
          </AdminRoute>
        } />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;