import { createContext, useContext, useState, useCallback } from 'react'

const NavContext = createContext({})

export function NavProvider({ children }) {
  const [nav, setNavState] = useState({ title: null, backTo: null, action: null })

  const setNav = useCallback((opts) => {
    setNavState(opts ?? { title: null, backTo: null, action: null })
  }, [])

  return <NavContext.Provider value={{ ...nav, setNav }}>{children}</NavContext.Provider>
}

export function useNav() {
  return useContext(NavContext)
}
