import { create } from "zustand";
import api from "../services/ApiClient";
import useQueryingStore from "./queryStore";
import { persist } from "zustand/middleware";
import type { operations } from "@/types/api";
import type { Doctor } from "../types/Doctor";

type Params = operations["get_doctors"]["parameters"]["query"];
type DoctorResponse =
  operations["get_doctors"]["responses"]["200"]["content"]["application/json"];

type StoreState = {
  doctors: Doctor[];
  currDoctor: Doctor | null;
};

type StoreActions = {
  setCurrDoc?: (id: string) => void;
  getDoctors: (query: Params, signal?: AbortSignal) => Promise<void>;
  getDoctorById: (id: string, signal?: AbortSignal) => Promise<void>;
};

const endpoint = "/doctors";

const useDoctorsStore = create<StoreState & StoreActions>()(
  persist(
    (set, get) => ({
      currDoctor: null,
      doctors: [],

      async getDoctors(query, signal) {
        try {
          const { data: doctors = [], total_count } =
            await api.get<DoctorResponse>(endpoint, {
              params: { ...query },
              signal,
            });

          set({ doctors });
          useQueryingStore.setState({ totalCount: total_count });
        } catch (ex) {
          console.log(ex);
          throw ex;
        }
      },

      async getDoctorById(id, signal) {
        try {
          const doctor = await api.get<Doctor>(`${endpoint}/${id}`, { signal });
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

export default useDoctorsStore;
