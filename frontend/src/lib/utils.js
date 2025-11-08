import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function getInitial(value, fallback = "?") {
  const normalizedFallback = (fallback ?? "?").toString().trim().charAt(0) || "?"
  const derived = (value ?? "").toString().trim().charAt(0)
  return derived ? derived.toUpperCase() : normalizedFallback.toUpperCase()
}
