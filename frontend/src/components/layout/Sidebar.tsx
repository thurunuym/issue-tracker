import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Ticket, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { toggleSidebar } from '../../features/ui/uiSlice';
import cn from '../../utils/cn';

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const permissions = useAppSelector((state) => state.auth.permissions);

  const hasUserView = permissions.includes('user:view');

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
    { label: 'Issues', path: '/issues', icon: <Ticket className="h-4.5 w-4.5" /> },
  ];

  if (hasUserView) {
    navItems.push({
      label: 'Admin Users',
      path: '/admin/users',
      icon: <Users className="h-4.5 w-4.5" />,
    });
  }

  return (
    <aside
      className={cn(
        'relative z-35 flex flex-col border-r border-gray-150 bg-white text-gray-700 dark:border-gray-800 dark:bg-gray-901 transition-all duration-200',
        sidebarOpen ? 'w-60' : 'w-16'
      )}
    >
      <div className="flex-1 overflow-y-auto px-2 py-4">
        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all cursor-pointer group',
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/35 dark:text-blue-300'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-850 dark:hover:text-gray-100'
                )
              }
            >
              <div className="flex-shrink-0 text-gray-500 group-hover:text-current">{item.icon}</div>
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex justify-end p-2 border-t border-gray-150 dark:border-gray-800">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-850 text-gray-500 hover:text-gray-900 cursor-pointer"
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
