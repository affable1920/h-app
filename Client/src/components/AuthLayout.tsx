import useAuthStore from "@/stores/authStore";
import { Stethoscope, User2, Hospital, CircleQuestionMark } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function AuthLayout() {
  const user = useAuthStore((s) => s.user);
  const [active, setActive] = useState("patient");

  if (user) {
    return <Navigate to="/dir/doctors" />;
  }

  const types = [
    { label: "doctor", icon: Stethoscope },
    { label: "patient", icon: User2 },
    { label: "clinic", icon: Hospital },
    { label: "guest", icon: CircleQuestionMark },
  ];

  return (
    <main className="py-24">
      <section className="max-w-sm mx-auto">
        <motion.div
          className="flex items-center justify-between gap-4 mb-8 bg-gray-100 
        border-2 border-gray-300/40 rounded-lg overflow-hidden shadow-lg shadow-slate-400/10"
        >
          {types.map((type) => (
            <motion.button
              className={`capitalize text-sm cursor-pointer flex items-center p-2 gap-2 ${type.label === active ? "bg-blue-500 font-semibold text-white rounded-[inherit] shadow-md" : ""}`}
              key={type.label}
              onClick={() => setActive(type.label)}
            >
              {type.label}
              <type.icon size={14} />
            </motion.button>
          ))}
        </motion.div>
        <Outlet context={{ active }} />
      </section>
    </main>
  );
}
