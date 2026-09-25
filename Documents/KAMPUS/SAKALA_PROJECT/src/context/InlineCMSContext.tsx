'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

export type EditingItem = {
  type: 'bike' | 'product' | 'journal';
  id: string;
  data: Record<string, unknown>;
} | null;

interface InlineCMSContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  editingItem: EditingItem;
  setEditingItem: (item: EditingItem) => void;
  refreshKey: number;
  triggerRefresh: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
  toast: { message: string; type: 'success' | 'error' } | null;
}

const InlineCMSContext = createContext<InlineCMSContextType>({
  isEditMode: false,
  toggleEditMode: () => {},
  editingItem: null,
  setEditingItem: () => {},
  refreshKey: 0,
  triggerRefresh: () => {},
  showToast: () => {},
  toast: null,
});

export function InlineCMSProvider({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const toggleEditMode = useCallback(() => {
    if (!isAdmin) return;
    setIsEditMode((prev) => !prev);
    setEditingItem(null);
  }, [isAdmin]);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Only provide CMS capabilities if user is admin
  if (!isAdmin) {
    return (
      <InlineCMSContext.Provider
        value={{
          isEditMode: false,
          toggleEditMode: () => {},
          editingItem: null,
          setEditingItem: () => {},
          refreshKey: 0,
          triggerRefresh: () => {},
          showToast: () => {},
          toast: null,
        }}
      >
        {children}
      </InlineCMSContext.Provider>
    );
  }

  return (
    <InlineCMSContext.Provider
      value={{
        isEditMode,
        toggleEditMode,
        editingItem,
        setEditingItem,
        refreshKey,
        triggerRefresh,
        showToast,
        toast,
      }}
    >
      {children}
    </InlineCMSContext.Provider>
  );
}

export const useInlineCMS = () => useContext(InlineCMSContext);
