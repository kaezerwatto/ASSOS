import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Members } from './components/Members';
import { Sessions } from './components/Sessions';
import { Tontines } from './components/Tontines';
import { Aids } from './components/Aids';
import { Loans } from './components/Loans';
import { Finances } from './components/Finances';
import { Donations } from './components/Donations';
import { Login } from './components/Login';

export type PageType = 'dashboard' | 'members' | 'sessions' | 'tontines' | 'aids' | 'loans' | 'finances' | 'donations';
export type UserRole = 'admin' | 'tresorier' | null;

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>(null);

  const handleLogin = (role: 'admin' | 'tresorier') => {
    setUserRole(role);
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentPage('dashboard');
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
      case 'finances':
        return <Finances userRole={userRole} />;
      case 'donations':
        return <Donations userRole={userRole} />;
      default:
        return <Dashboard userRole={userRole} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
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
    </div>
  );
}