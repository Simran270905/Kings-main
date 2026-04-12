// FILTER CONFIG (UI DRIVEN)
export const filterConfig = [
  {
    id: 'price',
    name: 'Price',
    type: 'range',
  },
  {
    id: 'availability',
    name: 'Availability',
    type: 'checkbox',
    options: [{ value: 'inStock', label: 'In Stock Only' }],
  },
  {
    id: 'category',
    name: 'Category',
    type: 'checkbox',
    options: [
      { value: 'bracelet', label: 'Bracelet' },
      { value: 'chain', label: 'Chain' },
      { value: 'ring', label: 'Ring' },
      { value: 'kada', label: 'Kada' },
    ],
  },
  {
    id: 'material',
    name: 'Material',
    type: 'checkbox',
    options: [
      { value: 'gold', label: 'Gold' },
      { value: 'silver', label: 'Silver' },
      { value: 'diamond', label: 'Diamond' },
      { value: 'rudraksha', label: 'Rudraksha' },
    ],
  },
]

// FILTER FUNCTION
export const applyFilters = (products, filters) => {
  return products.filter((p) => {
    const priceMatch =
      p.price >= filters.price.min &&
      p.price <= filters.price.max

    const stockMatch =
      !filters.availability.inStock || p.inStock

    const categoryMatch =
      filters.category.length === 0 ||
      filters.category.includes(p.category)

    const materialMatch =
      filters.material.length === 0 ||
      filters.material.includes(p.material)

    return (
      priceMatch &&
      stockMatch &&
      categoryMatch &&
      materialMatch
    )
  })
}
