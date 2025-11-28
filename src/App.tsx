// App.tsx
import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Members } from './components/Members';
import { Sessions } from './components/Sessions';
import { Tontines } from './components/Tontines';
import { Aids } from './components/Aids';
import { Loans } from './components/Loans';
import { CaisseScolaire } from './components/CaisseScolaire.tsx';
import { Finances } from './components/Finances';
import { CaisseOrdinaire } from './components/CaisseOrdinaire';
import { Login } from './components/Login';
import { ThemeToggle } from './components/ThemeToggle';
import { ThemeProvider } from 'next-themes';
import { authService } from './lib/appwrite-service';

export type PageType = 'dashboard' | 'members' | 'sessions' | 'tontines' | 'Scolaire'  | 'Ordinaire' | 'loans' | 'finances' | 'donations';
export type UserRole = 'admin' | 'tresorier' | null;

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>(null);

  const handleLogin = (role: 'admin' | 'tresorier') => {
    setUserRole(role);
  };

  const handleLogout = async () => {
    try {
      const isLoggedIn = await authService.isLoggedIn();
      if (isLoggedIn) {
        await authService.logout();
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion Appwrite:', error);
    } finally {
      setUserRole(null);
      setCurrentPage('dashboard');
    }
  };

  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard userRole={userRole} />;
      case 'members':
        return <Members userRole={userRole} />;
      case 'sessions':
        return <Sessions userRole={userRole} />;
      case 'tontines':
        return <Tontines userRole={userRole} />;
      case 'aids':
        return <Aids userRole={userRole} />;
      case 'loans':
        return <Loans userRole={userRole} />;
      case 'scolaire':
        return <CaisseScolaire userRole={userRole} />;
      case 'finances':
        return <Finances userRole={userRole} />;
      case 'ordinaire':
        return <CaisseOrdinaire userRole={userRole} />;
      default:
        return <Dashboard userRole={userRole} />;
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
        <Sidebar 
          currentPage={currentPage} 
          onPageChange={setCurrentPage}
          userRole={userRole}
          onLogout={handleLogout}
        />
        <main className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
            {renderPage()}
          </div>
        </main>
        
        {/* Bouton de gestion des thèmes */}
        <ThemeToggle />
      </div>
    </ThemeProvider>
  );
}