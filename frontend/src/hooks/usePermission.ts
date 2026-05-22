import { useAppSelector } from '../app/store';

export const usePermission = (permission: string): boolean => {
  const permissions = useAppSelector((state) => state.auth.permissions);
  return permissions.includes(permission);
};

export default usePermission;
