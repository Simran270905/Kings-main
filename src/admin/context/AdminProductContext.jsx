import { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react'
import adminApi from '../utils/adminApiService'

export const AdminProductContext = createContext(null)

export const useAdminProduct = () => {
const context = useContext(AdminProductContext)
if (!context) {
throw new Error('useAdminProduct must be used within an AdminProductProvider')
}
return context
}

export const AdminProductProvider = ({ children }) => {
const [products, setProducts] = useState([])
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)
const [lastFetch, setLastFetch] = useState(null)

const debounceRef = useRef(null)
const initializedRef = useRef(false)

useEffect(() => {
const handler = () => {
if (debounceRef.current) clearTimeout(debounceRef.current)
debounceRef.current = setTimeout(() => {
fetchProducts(true)
}, 1000)
}

window.addEventListener('adminProductUpdated', handler)

return () => {
  window.removeEventListener('adminProductUpdated', handler)
  if (debounceRef.current) clearTimeout(debounceRef.current)
}

}, [])

const fetchProducts = async (silent = false) => {
try {
if (!silent) setLoading(true)
setError(null)

  const res = await adminApi.getProducts()

  let list = []
  if (res?.data?.products) list = res.data.products
  else if (Array.isArray(res?.data)) list = res.data
  else if (Array.isArray(res)) list = res

  setProducts(Array.isArray(list) ? list : [])
  setLastFetch(new Date())
} catch (err) {
  setError(err.message)
  setProducts([])
} finally {
  if (!silent) setLoading(false)
}
}

useEffect(() => {
if (!initializedRef.current) {
initializedRef.current = true
fetchProducts()
}
}, [])

const refreshProducts = () => fetchProducts()

const getTotalStock = (p) => {
if (!p) return 0
if (Array.isArray(p.sizes)) {
return p.sizes.reduce((sum, s) => sum + (s.stock || 0), 0)
}
return p.stock || 0
}

const getStockStatus = (p) => {
const total = getTotalStock(p)
if (total <= 0) return 'out'
if (total <= 10) return 'low'
return 'ok'
}

const getLowStockCount = useMemo(() => {
return products.filter(p => getStockStatus(p) === 'low').length
}, [products])

const getOutOfStockCount = () => {
return products.filter(p => getStockStatus(p) === 'out').length
}

const getTotalProductsCount = useMemo(() => products.length, [products])

return (
<AdminProductContext.Provider
value={{
products,
loading,
error,
lastFetch,
fetchProducts,
refreshProducts,
getTotalStock,
getStockStatus,
getLowStockCount,
getOutOfStockCount,
getTotalProductsCount
}}
>
{children}
</AdminProductContext.Provider>
)
}

export default AdminProductProvider
