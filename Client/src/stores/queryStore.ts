import { create } from "zustand";

type StoreState = {
  max: number;
  currPage: number;
  totalCount: number | null;
  searchQuery: string | null;
};

type StoreActions = {
  setmax: (max: number) => void;
  setCurrPage: (cp: number) => void;
  setSearchQuery: (sq: string) => void;
};

const useQueryingStore = create<StoreState & StoreActions>((set) => ({
  max: 8,
  currPage: 1,
  searchQuery: null,
  totalCount: null,

  setmax: (max: number) => set((store) => ({ ...store, max: max })),
  setCurrPage: (cp: number) => set((store) => ({ ...store, currPage: cp })),
  setSearchQuery: (sq: string) => {
    set((store) => ({ ...store, currPage: 1, searchQuery: sq }));
  },
}));

export default useQueryingStore;
