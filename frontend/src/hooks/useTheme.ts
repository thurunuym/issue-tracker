import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/store';
import { toggleTheme } from '../features/ui/uiSlice';

export const useTheme = () => {
  const theme = useAppSelector((state) => state.ui.theme);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return {
    theme,
    toggleTheme: () => dispatch(toggleTheme()),
  };
};

export default useTheme;
