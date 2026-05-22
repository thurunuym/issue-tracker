import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Mail, Calendar, Power, AlertTriangle } from 'lucide-react';
import usersApi from '../services/usersApi';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export const Users: React.FC = () => {
  const queryClient = useQueryClient();

  // Load user directory list
  const { data, isLoading, error } = useQuery({
    queryKey: ['usersList'],
    queryFn: () => usersApi.getUsers(),
  });

  const usersList = data?.users || [];

  // Mutation to commit administrative account updates
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => usersApi.updateUser(id, payload),
    onSuccess: (updatedUser) => {
      toast.success(`Account configuration updated for ${updatedUser.name || 'user'}.`);
      queryClient.invalidateQueries({ queryKey: ['usersList'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Administrative update failed.');
    },
  });

  const handleToggleActivate = (userId: string, currentStatus: boolean) => {
    const activeUserId = localStorage.getItem('userId') || '';
    if (userId === activeUserId && currentStatus === true) {
      toast.error("Security Alert: You cannot deactivate your own administrative account.");
      return;
    }

    updateMutation.mutate({
      id: userId,
      payload: { isActive: !currentStatus },
    });
  };

  const handleRoleChange = (userId: string, newRoleName: string) => {
    const activeUserId = localStorage.getItem('userId') || '';
    if (userId === activeUserId && newRoleName === 'user') {
      toast.error("Action Blocked: Demoting your own admin account would lock you out of admin tools.");
      return;
    }

    updateMutation.mutate({
      id: userId,
      payload: { role: newRoleName },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-gray-400 font-medium font-sans">Index-searching users directory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-700 dark:bg-red-950/25 dark:text-red-350 rounded-xl max-w-2xl mx-auto">
        <AlertTriangle className="h-10 w-10 text-red-600 mx-auto mb-3" />
        <h3 className="font-bold text-lg">Administrative Access Denied</h3>
        <p className="text-sm mt-1">
          This portal contains fine-grained user parameters and is restricted to System Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left p-1 animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-8">
          User Directory & Access Controls
        </h1>
        <p className="text-sm text-gray-550 dark:text-gray-400 mt-0.5">
          View developers profiles, promote roles, and switch account locks
        </p>
      </div>

      {usersList.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white border border-gray-150 rounded-xl dark:bg-gray-901">
          No users recorded in system database registers.
        </div>
      ) : (
        <div className="overflow-hidden bg-white border border-gray-150 rounded-xl dark:bg-gray-901 dark:border-gray-800 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-150 dark:border-gray-800 text-xs font-semibold text-gray-550 dark:text-gray-400 uppercase tracking-widest">
                  <th className="px-5 py-4">User Details</th>
                  <th className="px-5 py-4">Security Role</th>
                  <th className="px-5 py-4">Last Logon</th>
                  <th className="px-5 py-4">Access Status</th>
                  <th className="px-5 py-4 text-right">Account Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 dark:divide-gray-800 text-sm">
                {usersList.map((usr: any) => {
                  const isActive = usr.isActive !== false;
                  return (
                    <tr key={usr._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3.5">
                          <Avatar src={usr.avatar} name={usr.name} size="md" />
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-gray-150 leading-5">
                              {usr.name}
                            </div>
                            <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 mt-0.5 space-x-1">
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-[180px]">{usr.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <select
                            value={usr.role || 'user'}
                            onChange={(e) => handleRoleChange(usr._id, e.target.value)}
                            disabled={updateMutation.isPending}
                            className="text-xs bg-gray-50 text-gray-850 py-1 px-2.5 rounded-md border border-gray-150 dark:bg-gray-900 dark:text-white dark:border-gray-700 outline-none select-none font-semibold cursor-pointer"
                          >
                            <option value="user">User/Developer</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-650 dark:text-gray-400">
                        {usr.lastLoginAt ? (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            <span>{new Date(usr.lastLoginAt).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 font-mono italic">Never logged inside tracker</span>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-805 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-355 dark:border-emerald-800'
                              : 'bg-red-50 text-red-700 border-red-150 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'
                          }`}
                        >
                          {isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <Button
                          variant={isActive ? 'danger' : 'success'}
                          size="sm"
                          onClick={() => handleToggleActivate(usr._id, isActive)}
                          isLoading={updateMutation.isPending}
                          className="text-xs px-2.5 py-1 rounded inline-flex items-center"
                        >
                          <Power className="h-3.5 w-3.5 mr-1" />
                          {isActive ? 'Lock Account' : 'Unlock Account'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
