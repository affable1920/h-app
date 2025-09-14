import { create } from "zustand";
import api from "../utilities/api";
import type { Doc } from "../types/doc";

type QueryParams = {
  max?: number;
  currPage?: number;
  searchQuery?: string;
};

interface DocStore {
  doctors: Doc[];
  get: (query: QueryParams, signal?: AbortSignal) => Promise<void>;
}

const endpoint = "/doctors";

const useDocStore = create<DocStore>((set) => ({
  doctors: [],

  async get(query, signal) {
    try {
      const { data: docs = [] } = await api.get(endpoint, {
        params: { ...query },
        signal: signal,
      });

      set({ doctors: docs });
    } catch (ex) {
      console.log(ex);
      throw ex;
    }
  },
}));

export default useDocStore;
