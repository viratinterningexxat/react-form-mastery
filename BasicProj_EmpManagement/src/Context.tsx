import React, { createContext, useContext } from 'react';
import { Employee } from './types';

interface AppContextType {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  view: 'dashboard' | 'add' | 'credentials' | 'profile' | 'alerts';
  setView: (view: 'dashboard' | 'add' | 'credentials' | 'profile' | 'alerts') => void;
  handleFetchExternal: () => void;
  handleGenerateMockData: () => void;
  deleteEmployee: (id: string) => void;
  addEmployee: (employee: Employee) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export { AppContext };
export type { AppContextType };

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};