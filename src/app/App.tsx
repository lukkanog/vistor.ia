import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { AccountStorage } from './account-storage';
import { router } from './routes';

export default function App() {
  useEffect(() => {
    const syncUserViewTheme = () => {
      document.documentElement.dataset.userView = AccountStorage.getSelectedView();
    };

    syncUserViewTheme();
    return AccountStorage.subscribe(syncUserViewTheme);
  }, []);

  return <RouterProvider router={router} />;
}
