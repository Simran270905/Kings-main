'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react'
import {
  XMarkIcon,
  ChevronDownIcon,
  FunnelIcon,
} from '@heroicons/react/20/solid'

import ProductCard from './ProductCard'
import { applyFilters } from '../../components/Product/FilterData'
import { useProduct } from '../../context/ProductContext'

// SORT OPTIONS
const sortOptions = [
  { name: 'Price: Low to High', value: 'low' },
  { name: 'Price: High to Low', value: 'high' },
]

// FILTER OPTIONS
const categories = ['bracelet', 'chain']
const materials = ['gold', 'silver', 'diamond', 'rudraksha']

export default function Product() {
  const { products: allProducts = [] } = useProduct()

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState(false)

  // FILTER STATE
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(100000)
  const [inStock, setInStock] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedMaterials, setSelectedMaterials] = useState([])
  const [sort, setSort] = useState(null)
  const [filtersApplied, setFiltersApplied] = useState(false)

  // APPLY FILTERS
  let filteredProducts = applyFilters(allProducts, {
    price: { min: minPrice, max: maxPrice },
    availability: { inStock },
    category: selectedCategories,
    material: selectedMaterials,
  })

  // SORT
  if (sort === 'low') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price)
  }
  if (sort === 'high') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price)
  }

  const productsToShow = filtersApplied ? filteredProducts : allProducts

  const resetFilters = () => {
    setMinPrice(0)
    setMaxPrice(100000)
    setInStock(false)
    setSelectedCategories([])
    setSelectedMaterials([])
    setSort(null)
    setFiltersApplied(false)
  }

  return (
    <div className="bg-white">
      {/* ================= MOBILE FILTER ================= */}
      <Dialog
        open={mobileFiltersOpen}
        onClose={setMobileFiltersOpen}
        className="lg:hidden"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/25" />
        <DialogPanel className="fixed right-0 top-0 h-full w-80 bg-white p-6 z-50">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Filters</h2>
            <button onClick={() => setMobileFiltersOpen(false)}>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <FilterContent
            {...{
              setMinPrice,
              setMaxPrice,
              inStock,
              setInStock,
              selectedCategories,
              setSelectedCategories,
              selectedMaterials,
              setSelectedMaterials,
              resetFilters,
              setFiltersApplied,
            }}
          />
        </DialogPanel>
      </Dialog>

      {/* ================= PAGE ================= */}
      <main className="px-6 lg:px-20">
        {/* HEADER */}
        <div className="flex justify-between items-center py-6 border-b">
          <h1 className="text-4xl font-bold text-[#ae0b0b]">
            New Arrivals
          </h1>

          <div className="flex items-center gap-4">
            {/* SORT */}
            <Menu>
              <MenuButton className="flex items-center text-sm">
                Sort <ChevronDownIcon className="h-5 w-5 ml-1" />
              </MenuButton>
              <MenuItems className="absolute right-0 bg-white shadow mt-2">
                {sortOptions.map((o) => (
                  <MenuItem key={o.value}>
                    <button
                      className="px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => {
                        setSort(o.value)
                        setFiltersApplied(true)
                      }}
                    >
                      {o.name}
                    </button>
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>

            {/* DESKTOP FILTER BUTTON */}
            <button
              onClick={() => setDesktopFiltersOpen(!desktopFiltersOpen)}
              className={`hidden lg:flex items-center gap-1 border px-3 py-1 rounded text-sm
                ${desktopFiltersOpen ? 'bg-gray-100 font-medium' : ''}
              `}
            >
              <FunnelIcon className="h-4 w-4" />
              Filters
            </button>

            {/* MOBILE FILTER BUTTON */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden"
            >
              <FunnelIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <section className="py-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* DESKTOP FILTER */}
            {desktopFiltersOpen && (
              <aside className="hidden lg:block space-y-6 border p-4 rounded">
                <FilterContent
                  {...{
                    setMinPrice,
                    setMaxPrice,
                    inStock,
                    setInStock,
                    selectedCategories,
                    setSelectedCategories,
                    selectedMaterials,
                    setSelectedMaterials,
                    resetFilters,
                    setFiltersApplied,
                  }}
                />
              </aside>
            )}

            {/* PRODUCT GRID */}
            <section
              className={
                desktopFiltersOpen
                  ? 'lg:col-span-4'
                  : 'lg:col-span-5'
              }
            >
              <div
                className={`
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  md:grid-cols-3
                  gap-6
                  transition-all duration-300
                  ${
                    desktopFiltersOpen
                      ? 'lg:grid-cols-4'
                      : 'lg:grid-cols-5'
                  }
                `}
              >
                {productsToShow.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  )
}

/* ================= FILTER CONTENT ================= */
function FilterContent({
  setMinPrice,
  setMaxPrice,
  inStock,
  setInStock,
  selectedCategories,
  setSelectedCategories,
  selectedMaterials,
  setSelectedMaterials,
  resetFilters,
  setFiltersApplied,
}) {
  return (
    <>
      <div>
        <h3 className="font-medium mb-2">Price</h3>
        <input
          type="number"
          placeholder="Min Price"
          className="w-full border p-2 mb-2"
          onChange={(e) => {
            setMinPrice(+e.target.value)
            setFiltersApplied(true)
          }}
        />
        <input
          type="number"
          placeholder="Max Price"
          className="w-full border p-2"
          onChange={(e) => {
            setMaxPrice(+e.target.value)
            setFiltersApplied(true)
          }}
        />
      </div>

      <label className="flex gap-2 items-center">
        <input
          type="checkbox"
          checked={inStock}
          onChange={() => {
            setInStock(!inStock)
            setFiltersApplied(true)
          }}
        />
        In Stock Only
      </label>

      <div>
        <h3 className="font-medium mb-2">Category</h3>
        {categories.map((cat) => (
          <label key={cat} className="flex gap-2 capitalize">
            <input
              type="checkbox"
              checked={selectedCategories.includes(cat)}
              onChange={() => {
                setSelectedCategories((prev) =>
                  prev.includes(cat)
                    ? prev.filter((c) => c !== cat)
                    : [...prev, cat]
                )
                setFiltersApplied(true)
              }}
            />
            {cat}
          </label>
        ))}
      </div>

      <div>
        <h3 className="font-medium mb-2">Material</h3>
        {materials.map((mat) => (
          <label key={mat} className="flex gap-2 capitalize">
            <input
              type="checkbox"
              checked={selectedMaterials.includes(mat)}
              onChange={() => {
                setSelectedMaterials((prev) =>
                  prev.includes(mat)
                    ? prev.filter((m) => m !== mat)
                    : [...prev, mat]
                )
                setFiltersApplied(true)
              }}
            />
            {mat}
          </label>
        ))}
      </div>

      <button
        onClick={resetFilters}
        className="text-sm text-red-600"
      >
        Reset Filters
      </button>
    </>
  )
}
