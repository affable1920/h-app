import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Defined at module scope — stable references, no recreation on render
const childrenVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
  // "exit" on the container just collapses the height.
  // Each child's own exit variant handles their individual animation.
};

const childItemVariant = {
  hidden: { opacity: 0, x: -14 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
  exit: {
    opacity: 0,
    x: -10,
    transition: { duration: 0.15, ease: "easeIn" },
    // easeIn for exits — starts slow, ends fast — feels like something leaving
  },
};

// The chevron rotates to signal open/closed state
const chevronVariant = {
  closed: { rotate: 0 },
  open: { rotate: 90 },
};

const navItems = [
  {
    icon: "⬡",
    label: "Components",
    color: "#7c6aff",
    children: ["Button", "Input", "Modal", "Dropdown", "Toast"],
  },
  {
    icon: "✦",
    label: "Layouts",
    color: "#3ecf8e",
    children: ["Sidebar", "Grid", "Stack", "Container"],
  },
  {
    icon: "◈",
    label: "Data",
    color: "#38bdf8",
    children: ["Table", "Chart", "Timeline", "Kanban", "Calendar"],
  },
];

function NavSection({ icon, label, color, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginBottom: 2 }}>
      {/* ── Trigger button ── */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ background: "#ffffff08" }}
        whileTap={{ scale: 0.985 }}
        transition={{ duration: 0.15 }}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "9px 12px",
          borderRadius: 8,
          border: "none",
          background: open ? color + "12" : "transparent",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 14, color, width: 18, textAlign: "center" }}>
          {icon}
        </span>

        <span
          style={{
            flex: 1,
            fontSize: 13,
            fontWeight: 600,
            color: open ? color : "#c8d0e0",
            fontFamily: "inherit",
          }}
        >
          {label}
        </span>

        {/* Chevron — animates between closed (0°) and open (90°) */}
        <motion.span
          variants={chevronVariant}
          animate={open ? "open" : "closed"}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          style={{
            color: open ? color : "#3a4050",
            fontSize: 10,
            display: "inline-block",
          }}
        >
          ›
        </motion.span>
      </motion.button>

      {/* ── Children list ── */}
      {/*
        AnimatePresence lets the child list play its exit animation before
        being removed from the DOM. Without this wrapper, React would delete
        the element instantly and no exit animation would run.

        mode="wait" isn't needed here since there's no swap — just toggle.
      */}
      <AnimatePresence initial={false}>
        {/*
          initial={false} on AnimatePresence means: don't run the enter animation
          on first render. We only want animation when the user clicks.
        */}
        {open && (
          <motion.div
            key="children"
            initial="hidden"
            animate="visible"
            exit="hidden"
            /*
              "exit" here maps to the "hidden" variant — so on exit, the
              container collapses (height: 0) and children simultaneously
              run their own "exit" variant (opacity 0, x -10).

              The height collapse is handled by animating from height: "auto"
              back to height: 0 in the container itself.
            */
            variants={childrenVariants}
            style={{ overflow: "hidden", paddingLeft: 16 }}
          >
            {/*
              This inner wrapper handles the height animation.
              We animate height: 0 → "auto" on enter, and reverse on exit.
              It's separate from the stagger container so the two don't conflict.
            */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ padding: "4px 0 6px" }}>
                {children.map((child) => (
                  <motion.div
                    key={child}
                    variants={childItemVariant}
                    /*
                      No need to set initial/animate here — the parent
                      variants={childrenVariants} propagates "hidden" / "visible"
                      down automatically. Framer Motion walks the tree.
                    */
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "7px 10px",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    <motion.div
                      whileHover={{ background: "#ffffff0a", x: 2 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        width: "100%",
                        borderRadius: 6,
                        padding: "1px 4px",
                      }}
                    >
                      <span
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          background: color + "80",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 12.5,
                          color: "#7a8494",
                          fontWeight: 500,
                        }}
                      >
                        {child}
                      </span>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#07080a",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "60px 20px",
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      }}
    >
      <div
        style={{
          background: "#0e1014",
          border: "1px solid #1c1f26",
          borderRadius: 14,
          padding: "16px 12px",
          width: 220,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "4px 12px 16px",
            marginBottom: 4,
            borderBottom: "1px solid #1c1f26",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: "linear-gradient(135deg, #7c6aff, #38bdf8)",
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#c8d0e0" }}>
            Workspace
          </span>
        </div>

        <div style={{ padding: "8px 0" }}>
          {navItems.map((item) => (
            <NavSection key={item.label} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}
