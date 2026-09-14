import { CalculationType } from './category-rules-storage'

export interface ProductCreateDraftRow {
  id: string
  name: string
  categoryId: string
  calculationType?: CalculationType | ''
  unitId?: string
  price: number | null
  costPrice: number | null
  damageFee: number | null
  lossFee: number | null
  quantityAdded: number
  minimumStock: number | null
  addedDate: Date
  // Backwards compatibility
  isAccessory?: boolean
  accessoryUnitId?: string
}

export const createInitialDraftRows = (
  defaultCategoryId: string = '',
  defaultUnitId: string = '',
  defaultCalcType: CalculationType | '' = ''
): ProductCreateDraftRow[] => {
  const rows: ProductCreateDraftRow[] = []
  for (let i = 0; i < 10; i++) {
    rows.push({
      id: `draft-row-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      name: '',
      categoryId: defaultCategoryId,
      calculationType: defaultCalcType,
      unitId: defaultUnitId,
      price: null,
      costPrice: null,
      damageFee: null,
      lossFee: null,
      quantityAdded: 0,
      minimumStock: null,
      addedDate: new Date(),
      isAccessory: false,
      accessoryUnitId: defaultUnitId,
    })
  }
  return rows
}
