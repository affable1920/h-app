import { create } from "zustand";

interface QueryStore {
  limit: number;
  currPage: number;
  searchQuery?: string;
  totalCount: number | null;

  setLimit: (max: number) => void;
  setCurrPage: (cp: number) => void;
  setSearchQuery: (sq: string) => void;
}

const useQueryStore = create<QueryStore>((set) => ({
  limit: 5,
  currPage: 1,
  searchQuery: "",
  totalCount: null,

  setLimit: (max: number) => set((store) => ({ ...store, limit: max })),
  setCurrPage: (cp: number) => set((store) => ({ ...store, currPage: cp })),
  setSearchQuery: (sq: string) =>
    set((store) => ({ ...store, currPage: 1, searchQuery: sq })),
}));

export default useQueryStore;
