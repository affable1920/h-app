import useAuthStore from "@/stores/authStore";
import { motion } from "motion/react";
import { Navigate } from "react-router-dom";

export default function AuthLayout() {
  const user = useAuthStore((s) => s.user);

  if (user) {
    return <Navigate to="/dir/doctors" />;
  }

  return (
    <main className="py-24">
      <section className="max-w-sm mx-auto">
        <motion.div
          className="flex items-center justify-between gap-4 mb-8 bg-gray-100 
        border-2 border-gray-300/40 rounded-lg overflow-hidden shadow-lg shadow-slate-400/10"
        ></motion.div>
      </section>
    </main>
  );
}
