import { create } from "zustand";

interface QueryStore {
  max: number;
  currPage: number;
  searchQuery: string;

  setMax: (max: number) => void;
  setCurrPage: (cp: number) => void;
  setSearchQuery: (sq: string) => void;
}

const useQueryStore = create<QueryStore>((set) => ({
  max: 5,
  currPage: 1,
  searchQuery: "",

  setMax: (max: number) => set((store) => ({ ...store, max })),
  setCurrPage: (cp: number) => set((store) => ({ ...store, currPage: cp })),
  setSearchQuery: (sq: string) =>
    set((store) => ({ ...store, currPage: 1, searchQuery: sq })),
}));

export default useQueryStore;
