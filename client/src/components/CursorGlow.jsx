import { useEffect, useState } from 'react'

export default function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 })
  const [visible, setVisible] = useState(false)
  const [isCoarse, setIsCoarse] = useState(true)

  useEffect(() => {
    setIsCoarse(window.matchMedia('(pointer: coarse)').matches)
    const move = (e) => { setPos({ x: e.clientX, y: e.clientY }); setVisible(true) }
    const leave = () => setVisible(false)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseleave', leave)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseleave', leave)
    }
  }, [])

  if (isCoarse) return null

  return (
    <div
      className="fixed pointer-events-none z-[9999] w-72 h-72 rounded-full transition-opacity duration-300"
      style={{background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)',
        left: pos.x - 144,
        top: pos.y - 144,
        opacity: visible ? 1 : 0,}}
    />
  )
}
