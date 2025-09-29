import { create } from "zustand";
import api from "../services/ApiClient";
import type { Doc } from "../types/doc";
import useQueryStore from "./queryStore";
import { persist } from "zustand/middleware";

type QueryParams = {
  max?: number;
  limit?: number;
  currPage?: number;
  searchQuery?: string;
};

interface DocStore {
  doctors: Doc[];
  currDoctor: Doc | null;

  setCurrDoc?: (id: string) => void;

  getDoctorById: (id: string, signal?: AbortSignal) => Promise<void>;
  getDoctors: (query: QueryParams, signal?: AbortSignal) => Promise<void>;
}

type DoctorResponse = {
  doctors: Doc[];
  curr_count: number;
  total_count: number;
};

const endpoint = "/doctors";

const useDocStore = create<DocStore>()(
  persist(
    (set, get) => ({
      currDoctor: null,
      doctors: [],

      async getDoctors(query, signal) {
        try {
          const { doctors, total_count } = await api.get<DoctorResponse>(
            endpoint,
            {
              params: { ...query },
              signal,
            }
          );

          set({ doctors });
          useQueryStore.setState({ totalCount: total_count });
        } catch (ex) {
          console.log(ex);
          throw ex;
        }
      },

      async getDoctorById(id, signal) {
        try {
          const doctor = await api.get<Doc>(`${endpoint}/${id}`, { signal });
          set(() => ({ ...get(), currDoctor: doctor }));
        } catch (ex) {
          console.log(ex);
          throw ex;
        }
      },
    }),
    {
      name: "doc-store-curr-doctor",
      partialize: ({ currDoctor }) => ({ currDoctor }),
    }
  )
);

export default useDocStore;
