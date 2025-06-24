"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme() // Use resolvedTheme instead of theme
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Button
      variant="ghost"
      size="icon"
      className="px-4"
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
    >
      {mounted && (resolvedTheme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}