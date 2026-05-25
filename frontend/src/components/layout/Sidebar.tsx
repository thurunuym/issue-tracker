import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Ticket, Users, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { logout } from '../../features/auth/authSlice';
import { toggleSidebar } from '../../features/ui/uiSlice';
import authApi from '../../services/authApi';
import cn from '../../utils/cn';
import toast from 'react-hot-toast';

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const permissions = useAppSelector((state) => state.auth.permissions);

  const hasUserView = permissions.includes('user:view');

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Issues', path: '/issues', icon: Ticket },
  ];

  if (hasUserView) {
    navItems.push({
      label: 'Users',
      path: '/admin/users',
      icon: Users,
    });
  }

  const handleLogout = async () => {
    try {
      await authApi.logout();
      dispatch(logout());
      toast.success('Successfully logged out.');
    } catch (err: any) {
      console.error(err);
      dispatch(logout());
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        'relative z-35 flex flex-col border-r border-gray-150 bg-white dark:border-gray-800 dark:bg-gray-901 transition-all duration-300 ease-in-out',
        sidebarOpen ? 'w-64' : 'w-[68px]'
      )}
    >
      {/* Navigation section label */}
      {sidebarOpen && (
        <div className="px-5 pt-5 pb-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-550">
            Navigation
          </p>
        </div>
      )}

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'group relative flex items-center rounded-xl px-3.5 py-3 text-[15px] font-semibold transition-all duration-150 cursor-pointer',
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                )}
              >
                <Icon className={cn(
                  'h-[20px] w-[20px] flex-shrink-0 transition-colors',
                  active
                    ? 'text-white'
                    : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
                )} />
                {sidebarOpen && (
                  <span className="ml-3 truncate">{item.label}</span>
                )}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-3 hidden group-hover:flex">
                    <div className="rounded-lg bg-gray-901 px-3 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-gray-700 whitespace-nowrap">
                      {item.label}
                    </div>
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom section — Logout + Collapse */}
      <div className="border-t border-gray-150 dark:border-gray-800 px-3 py-3 space-y-1">
        <button
          onClick={handleLogout}
          className={cn(
            'group flex items-center w-full rounded-xl px-3.5 py-3 text-[15px] font-semibold transition-all duration-150 cursor-pointer',
            'text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-500 dark:hover:bg-red-950/30 dark:hover:text-red-400'
          )}
          title="Logout"
        >
          <LogOut className="h-[20px] w-[20px] flex-shrink-0 text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
          {sidebarOpen && <span className="ml-3 truncate">Logout</span>}
          {!sidebarOpen && (
            <div className="absolute left-full ml-3 hidden group-hover:flex">
              <div className="rounded-lg bg-gray-901 px-3 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-gray-700 whitespace-nowrap">
                Logout
              </div>
            </div>
          )}
        </button>

        <button
          onClick={() => dispatch(toggleSidebar())}
          className="flex items-center justify-center w-full rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all cursor-pointer"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
