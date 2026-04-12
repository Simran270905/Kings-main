import { useContext } from 'react'
import { CartContext } from './CartContext'

export function useCart() {
  console.log('🛒 useCart hook called')
  const context = useContext(CartContext)
  
  if (!context) {
    console.error('🛒 useCart error: CartContext not found')
    throw new Error('useCart must be used within CartProvider')
  }
  
  console.log('🛒 useCart context available:', !!context.addToCart)
  return context
}
