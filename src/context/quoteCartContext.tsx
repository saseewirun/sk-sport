'use client'

import React, { createContext, useContext, useEffect, useReducer } from 'react'

export const QUOTE_CART_STORAGE_KEY = 'sksport-quote-cart'

export interface QuoteCartItem {
  id: string
  slug: string
  title: string
  subtitle?: string
  category?: string
  image?: string
  quantity: number
  mode: 'quote'
}

interface QuoteCartState {
  items: QuoteCartItem[]
}

type QuoteCartAction =
  | { type: 'ADD_ITEM'; payload: Omit<QuoteCartItem, 'quantity' | 'mode'> & { quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_QUOTE_CART' }

interface QuoteCartContextValue {
  items: QuoteCartItem[]
  totalQuoteItems: number
  addItem: (item: Omit<QuoteCartItem, 'quantity' | 'mode'> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearQuoteCart: () => void
}

function quoteCartReducer(state: QuoteCartState, action: QuoteCartAction): QuoteCartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { quantity = 1, ...itemData } = action.payload
      const existing = state.items.find((i) => i.id === itemData.id)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === itemData.id
              ? {
                  ...i,
                  ...itemData,
                  mode: 'quote' as const,
                  quantity: i.quantity + quantity,
                }
              : i,
          ),
        }
      }
      return { items: [...state.items, { ...itemData, mode: 'quote' as const, quantity }] }
    }

    case 'REMOVE_ITEM':
      return { items: state.items.filter((i) => i.id !== action.payload.id) }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload
      if (quantity <= 0) {
        return { items: state.items.filter((i) => i.id !== id) }
      }
      return {
        items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
      }
    }

    case 'CLEAR_QUOTE_CART':
      return { items: [] }

    default:
      return state
  }
}

function normalizeQuoteCartItem(raw: unknown): QuoteCartItem | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  if (typeof o.id !== 'string' || typeof o.slug !== 'string' || typeof o.title !== 'string') {
    return null
  }
  const quantity = Number(o.quantity)
  if (!Number.isFinite(quantity) || quantity < 1) return null
  if (o.mode != null && o.mode !== 'quote') return null
  const item: QuoteCartItem = {
    id: o.id,
    slug: o.slug,
    title: o.title,
    mode: 'quote',
    quantity,
  }
  if (typeof o.subtitle === 'string') item.subtitle = o.subtitle
  if (typeof o.category === 'string') item.category = o.category
  if (typeof o.image === 'string') item.image = o.image
  return item
}

function loadFromStorage(): QuoteCartState {
  if (typeof window === 'undefined') return { items: [] }
  try {
    const raw = window.localStorage.getItem(QUOTE_CART_STORAGE_KEY)
    if (!raw) return { items: [] }
    const parsed = JSON.parse(raw) as { items?: unknown }
    if (!Array.isArray(parsed?.items)) return { items: [] }
    const items = parsed.items
      .map((row) => normalizeQuoteCartItem(row))
      .filter((i): i is QuoteCartItem => i !== null)
    return { items }
  } catch {
    return { items: [] }
  }
}

function saveToStorage(state: QuoteCartState): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(QUOTE_CART_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage quota or private mode
  }
}

const QuoteCartContext = createContext<QuoteCartContextValue | null>(null)

export function QuoteCartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(quoteCartReducer, { items: [] }, loadFromStorage)

  useEffect(() => {
    saveToStorage(state)
  }, [state])

  const addItem = (item: Omit<QuoteCartItem, 'quantity' | 'mode'> & { quantity?: number }) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
  }

  const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: { id } })

  const updateQuantity = (id: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })

  const clearQuoteCart = () => dispatch({ type: 'CLEAR_QUOTE_CART' })

  const totalQuoteItems = state.items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <QuoteCartContext.Provider
      value={{
        items: state.items,
        totalQuoteItems,
        addItem,
        removeItem,
        updateQuantity,
        clearQuoteCart,
      }}
    >
      {children}
    </QuoteCartContext.Provider>
  )
}

export function useQuoteCart(): QuoteCartContextValue {
  const ctx = useContext(QuoteCartContext)
  if (!ctx) {
    throw new Error('useQuoteCart must be used inside <QuoteCartProvider>')
  }
  return ctx
}
