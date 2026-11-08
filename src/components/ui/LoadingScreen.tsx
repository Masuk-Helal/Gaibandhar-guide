"use client";

import { AnimatePresence, motion } from "framer-motion";

export function LoadingScreen({ visible, label = "Initializing geography" }: { visible: boolean; label?: string }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#02040c]"
        >
          <div className="relative mb-8 h-16 w-16">
            <span className="absolute inset-0 animate-[spin_3s_linear_infinite] rounded-full border border-cyan-400/20 border-t-cyan-400" />
            <span className="absolute inset-2 animate-[spin_2s_linear_infinite_reverse] rounded-full border border-amber-300/20 border-b-amber-300/70" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_18px_4px_rgba(34,211,238,0.6)]" />
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/50">{label}</p>
          <div className="mt-4 h-px w-40 overflow-hidden bg-white/10">
            <motion.div
              className="h-full w-1/2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
              animate={{ x: ["-100%", "300%"] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
