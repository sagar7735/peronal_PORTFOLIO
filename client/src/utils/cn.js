// Simple class name merger (no extra deps needed)
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
