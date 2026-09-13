export interface ProductCreateDraftRow {
  id: string
  name: string
  isAccessory: boolean
  categoryId: string
  accessoryUnitId: string
  price: number | null
  costPrice: number | null
  damageFee: number | null
  lossFee: number | null
  quantityAdded: number
  minimumStock: number | null
  addedDate: Date
}

export const createInitialDraftRows = (
  defaultCategoryId: string = '',
  defaultUnitId: string = ''
): ProductCreateDraftRow[] => {
  const rows: ProductCreateDraftRow[] = []
  for (let i = 0; i < 10; i++) {
    rows.push({
      id: `draft-row-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      name: '',
      isAccessory: false,
      categoryId: defaultCategoryId,
      accessoryUnitId: defaultUnitId,
      price: null,
      costPrice: null,
      damageFee: null,
      lossFee: null,
      quantityAdded: 0,
      minimumStock: null,
      addedDate: new Date(),
    })
  }
  return rows
}
