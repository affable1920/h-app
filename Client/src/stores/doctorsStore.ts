import { create } from "zustand";
import api from "../utilities/api";
import type { Doc } from "../types/doc";
import useQueryStore from "./queryStore";

type QueryParams = {
  max?: number;
  limit?: number;
  currPage?: number;
  searchQuery?: string;
};

interface DocStore {
  doctors: Doc[];
  getDoctors: (query: QueryParams, signal?: AbortSignal) => Promise<void>;
}

const endpoint = "/doctors";

const useDocStore = create<DocStore>((set) => ({
  doctors: [],

  async getDoctors(query, signal) {
    try {
      const { data = {} } = await api.get(endpoint, {
        params: { ...query },
        signal: signal,
      });

      set({ doctors: data.doctors });
      useQueryStore.setState({ totalCount: data?.total_count });
    } catch (ex) {
      console.log(ex);
      throw ex;
    }
  },
}));

export default useDocStore;
