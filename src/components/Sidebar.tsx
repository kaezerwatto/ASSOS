import { PageType } from '../App';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  Coins, 
  Heart, 
  GraduationCap, 
  Wallet,
  Gift,
  Menu,
  X,
  LogOut,
  UserCircle
} from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  userRole: 'admin' | 'tresorier';
  onLogout: () => void;
}

export function Sidebar({ currentPage, onPageChange, userRole, onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard' as PageType, label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'members' as PageType, label: 'Membres', icon: Users },
    { id: 'sessions' as PageType, label: 'Séances', icon: CalendarDays },
    { id: 'tontines' as PageType, label: 'Tontines', icon: Coins },
    { id: 'aids' as PageType, label: 'Aides', icon: Heart },
    { id: 'loans' as PageType, label: 'Prêts Scolaires', icon: GraduationCap },
    { id: 'donations' as PageType, label: 'Dons', icon: Gift },
    { id: 'finances' as PageType, label: 'Finances', icon: Wallet },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-indigo-600 text-white"
      >
        {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-gradient-to-b from-indigo-900 to-indigo-950 text-white transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-indigo-800">
          <h1 className="text-2xl tracking-tight text-indigo-100">
            AssoFi
          </h1>
          <p className="text-sm text-indigo-300 mt-1">Finances d'Association</p>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 bg-indigo-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-700 rounded-full">
              <UserCircle className="size-5 text-indigo-200" />
            </div>
            <div>
              <p className="text-sm text-indigo-100">
                {userRole === 'admin' ? 'Administrateur' : 'Trésorier'}
              </p>
              <p className="text-xs text-indigo-300">Connecté</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onPageChange(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'
                    }`}
                  >
                    <Icon className="size-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-indigo-800">
          <Button
            onClick={onLogout}
            variant="ghost"
            className="w-full justify-start text-indigo-200 hover:text-white hover:bg-indigo-800/50"
          >
            <LogOut className="size-5 mr-3" />
            Déconnexion
          </Button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-indigo-800">
          <p className="text-xs text-indigo-300 text-center">
            © 2025 AssoFi - Tous droits réservés
          </p>
        </div>
      </aside>
    </>
  );
}