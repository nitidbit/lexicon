import { createContext } from 'react'

/** DOM node where `LxEditPanel` is portaled; one per `LxProvider` instance. */
export const LxPortalContext = createContext<HTMLElement | null>(null)
