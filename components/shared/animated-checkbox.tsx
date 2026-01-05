"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedCheckboxProps {
  checked: boolean
  onChange: () => void
  disabled?: boolean
  className?: string
}

export function AnimatedCheckbox({
  checked,
  onChange,
  disabled = false,
  className,
}: AnimatedCheckboxProps) {
  return (
    <motion.button
      type="button"
      onClick={onChange}
      disabled={disabled}
      whileTap={{ scale: 0.9 }}
      className={cn(
        "relative flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        checked
          ? "border-violet-500 bg-gradient-to-br from-violet-500 to-cyan-500"
          : "border-white/30 bg-transparent hover:border-white/50",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <svg
        className="h-3 w-3"
        viewBox="0 0 12 12"
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path
          d="M2 6L5 9L10 3"
          stroke="white"
          initial={false}
          animate={{
            pathLength: checked ? 1 : 0,
            opacity: checked ? 1 : 0,
          }}
          transition={{
            pathLength: { duration: 0.2, ease: "easeOut" },
            opacity: { duration: 0.1 },
          }}
        />
      </svg>

      {/* Ripple effect on check */}
      {checked && (
        <motion.div
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute inset-0 rounded-md bg-violet-500"
        />
      )}
    </motion.button>
  )
}

// Alternative circular checkbox with more dramatic animation
export function CircularCheckbox({
  checked,
  onChange,
  disabled = false,
  className,
}: AnimatedCheckboxProps) {
  return (
    <motion.button
      type="button"
      onClick={onChange}
      disabled={disabled}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={cn(
        "relative flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
        checked
          ? "border-transparent bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 shadow-lg shadow-violet-500/30"
          : "border-white/20 bg-white/[0.02] hover:border-white/40 hover:bg-white/[0.05]",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <motion.svg
        className="h-3.5 w-3.5"
        viewBox="0 0 14 14"
        fill="none"
        initial={false}
      >
        <motion.path
          d="M2.5 7L5.5 10L11.5 4"
          stroke="white"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{
            pathLength: checked ? 1 : 0,
          }}
          transition={{
            pathLength: {
              duration: 0.3,
              ease: "easeInOut",
            },
          }}
          style={{
            pathLength: checked ? 1 : 0,
          }}
        />
      </motion.svg>

      {/* Success burst animation */}
      {checked && (
        <>
          <motion.div
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500"
          />
          {/* Particle effects */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos((i * Math.PI * 2) / 6) * 20,
                y: Math.sin((i * Math.PI * 2) / 6) * 20,
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 0.4, delay: i * 0.02 }}
              className="absolute h-1 w-1 rounded-full bg-violet-400"
            />
          ))}
        </>
      )}
    </motion.button>
  )
}
