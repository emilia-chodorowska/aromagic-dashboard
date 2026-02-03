import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type FontType = 'system' | 'poppins' | 'sanfrancisco'

interface FontContextType {
  font: FontType
  setFont: (font: FontType) => void
}

const FontContext = createContext<FontContextType | undefined>(undefined)

export function FontProvider({ children }: { children: ReactNode }) {
  const [font, setFontState] = useState<FontType>(() => {
    const saved = localStorage.getItem('font-preference')
    return (saved as FontType) || 'system'
  })

  const setFont = (newFont: FontType) => {
    setFontState(newFont)
    localStorage.setItem('font-preference', newFont)
  }

  useEffect(() => {
    document.body.classList.remove('font-poppins', 'font-sanfrancisco')
    if (font === 'poppins') {
      document.body.classList.add('font-poppins')
    } else if (font === 'sanfrancisco') {
      document.body.classList.add('font-sanfrancisco')
    }
  }, [font])

  return (
    <FontContext.Provider value={{ font, setFont }}>
      {children}
    </FontContext.Provider>
  )
}

export function useFont() {
  const context = useContext(FontContext)
  if (!context) {
    throw new Error('useFont must be used within a FontProvider')
  }
  return context
}
