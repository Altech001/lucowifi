
'use client';

import { create } from 'zustand';

type PromotionsState = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export const usePromotions = create<PromotionsState>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
}));
