import { create } from "zustand";

interface PremiumModdalState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const usePremiumModal = create<PremiumModdalState>((set) => ({
  open: false,
  setOpen: (open: boolean) => set({ open }),
}));

export default usePremiumModal;
