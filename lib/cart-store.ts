'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  imageUrl: string
  quantity: number
  stock?: number
}

interface CartState {
  items: CartItem[]
  hasHydrated: boolean
  setHasHydrated: (v: boolean) => void
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clear: () => void
  totalItems: () => number
  subtotal: () => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
      addItem: (item, qty = 1) => {
        const items = get().items ?? []
        const existing = items.find((i) => i?.id === item?.id)
        if (existing) {
          set({
            items: items.map((i) =>
              i?.id === item?.id ? { ...i, quantity: (i?.quantity ?? 0) + qty } : i
            ),
          })
        } else {
          set({ items: [...items, { ...item, quantity: qty }] })
        }
      },
      removeItem: (id) =>
        set({ items: (get().items ?? []).filter((i) => i?.id !== id) }),
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ items: (get().items ?? []).filter((i) => i?.id !== id) })
          return
        }
        set({
          items: (get().items ?? []).map((i) =>
            i?.id === id ? { ...i, quantity } : i
          ),
        })
      },
      clear: () => set({ items: [] }),
      totalItems: () =>
        (get().items ?? []).reduce((s, i) => s + (i?.quantity ?? 0), 0),
      subtotal: () =>
        (get().items ?? []).reduce(
          (s, i) => s + (i?.price ?? 0) * (i?.quantity ?? 0),
          0
        ),
    }),
    {
      name: 'ecomdash-cart',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
