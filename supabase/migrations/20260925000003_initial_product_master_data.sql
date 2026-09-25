-- Promote the current development master data into Supabase as real rows.
-- Safe to rerun: stable IDs + ON CONFLICT updates, no deletes/truncates.

INSERT INTO public.units (id, name, is_active)
VALUES
  ('unit-1', 'แผ่น', true),
  ('unit-2', 'ต้น', true),
  ('unit-3', 'ชุด', true),
  ('unit-4', 'ชิ้น', true),
  ('unit-5', 'กล่อง', true),
  ('unit-6', 'เมตร', true),
  ('unit-7', 'ท่อน', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.product_categories
  (id, name, is_active, calculation_type, calculation_label, default_unit_id, is_default)
VALUES
  ('cat-1', 'แบบคาน', true, 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'unit-1', true),
  ('cat-2', 'แบบเสา', true, 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'unit-2', true),
  ('cat-3', 'นั่งร้าน', true, 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'unit-3', true),
  ('cat-4', 'อุปกรณ์เสริม', true, 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'unit-4', true),
  ('cat-5', 'ทั่วไป', true, 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'unit-4', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  calculation_type = EXCLUDED.calculation_type,
  calculation_label = EXCLUDED.calculation_label,
  default_unit_id = EXCLUDED.default_unit_id,
  is_default = EXCLUDED.is_default,
  updated_at = now();

INSERT INTO public.products
  (id, code, name, category_id, unit_id, type, rent_price, sale_price, stock_quantity, image_url,
   rental_type, daily_price, cost_price, default_damage_fee, default_loss_fee, minimum_stock,
   status, calculation_type, calculation_label, category_rule_id, is_accessory, is_chargeable, requires_return)
VALUES
  ('seed-bk-001', 'BK-001', 'แบบคาน 40x0.50', 'cat-1', 'unit-1', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-1', false, true, true),
  ('seed-bk-002', 'BK-002', 'แบบคาน 40x0.70', 'cat-1', 'unit-1', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-1', false, true, true),
  ('seed-bk-003', 'BK-003', 'แบบคาน 40x0.75', 'cat-1', 'unit-1', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-1', false, true, true),
  ('seed-bk-004', 'BK-004', 'แบบคาน 40x0.80', 'cat-1', 'unit-1', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-1', false, true, true),
  ('seed-bk-005', 'BK-005', 'แบบคาน 40x1.00', 'cat-1', 'unit-1', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-1', false, true, true),
  ('seed-bk-006', 'BK-006', 'แบบคาน 40x1.20', 'cat-1', 'unit-1', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-1', false, true, true),
  ('seed-bk-007', 'BK-007', 'แบบคาน 40x1.25', 'cat-1', 'unit-1', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-1', false, true, true),
  ('seed-bk-008', 'BK-008', 'แบบคาน 40x1.30', 'cat-1', 'unit-1', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-1', false, true, true),
  ('seed-bk-009', 'BK-009', 'แบบคาน 40x1.50', 'cat-1', 'unit-1', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-1', false, true, true),
  ('seed-bk-010', 'BK-010', 'แบบคาน 40x1.60', 'cat-1', 'unit-1', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-1', false, true, true),
  ('seed-bk-011', 'BK-011', 'แบบคาน 40x1.75', 'cat-1', 'unit-1', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-1', false, true, true),
  ('seed-bk-012', 'BK-012', 'แบบคาน 40x1.80', 'cat-1', 'unit-1', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-1', false, true, true),
  ('seed-bk-013', 'BK-013', 'แบบคาน 40x2.00', 'cat-1', 'unit-1', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-1', false, true, true),
  ('seed-bk-014', 'BK-014', 'แบบคาน 40x2.20', 'cat-1', 'unit-1', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-1', false, true, true),
  ('seed-bk-015', 'BK-015', 'แบบคาน 40x2.25', 'cat-1', 'unit-1', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-1', false, true, true),
  ('seed-bk-016', 'BK-016', 'แบบคาน 40x2.50', 'cat-1', 'unit-1', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-1', false, true, true),
  ('seed-bk-017', 'BK-017', 'แบบคาน 40x2.75', 'cat-1', 'unit-1', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-1', false, true, true),
  ('seed-bk-018', 'BK-018', 'แบบคาน 40x3.00', 'cat-1', 'unit-1', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-1', false, true, true),
  ('seed-bk-019', 'BK-019', 'แบบคาน 40x3.25', 'cat-1', 'unit-1', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-1', false, true, true),
  ('seed-bk-020', 'BK-020', 'แบบคาน 40x3.50', 'cat-1', 'unit-1', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-1', false, true, true),
  ('seed-bk-021', 'BK-021', 'แบบคาน 40x3.60', 'cat-1', 'unit-1', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-1', false, true, true),
  ('seed-bk-022', 'BK-022', 'แบบคาน 40x3.75', 'cat-1', 'unit-1', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-1', false, true, true),
  ('seed-bk-023', 'BK-023', 'แบบคาน 40x3.76', 'cat-1', 'unit-1', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-1', false, true, true),
  ('seed-bs-001', 'BS-001', 'แบบเสา 15x15x2.00', 'cat-2', 'unit-2', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-2', false, true, true),
  ('seed-bs-002', 'BS-002', 'แบบเสา 15x15x3.00', 'cat-2', 'unit-2', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-2', false, true, true),
  ('seed-bs-003', 'BS-003', 'แบบเสา 20x20x1.00', 'cat-2', 'unit-2', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-2', false, true, true),
  ('seed-bs-004', 'BS-004', 'แบบเสา 20x20x1.50', 'cat-2', 'unit-2', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-2', false, true, true),
  ('seed-bs-005', 'BS-005', 'แบบเสา 20x20x2.00', 'cat-2', 'unit-2', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-2', false, true, true),
  ('seed-bs-006', 'BS-006', 'แบบเสา 20x20x3.00', 'cat-2', 'unit-2', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-2', false, true, true),
  ('seed-bs-007', 'BS-007', 'แบบเสา 20x20x3.50', 'cat-2', 'unit-2', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-2', false, true, true),
  ('seed-bs-008', 'BS-008', 'แบบเสา 25x25x1.50', 'cat-2', 'unit-2', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-2', false, true, true),
  ('seed-bs-009', 'BS-009', 'แบบเสา 25x25x2.00', 'cat-2', 'unit-2', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-2', false, true, true),
  ('seed-bs-010', 'BS-010', 'แบบเสา 25x25x3.00', 'cat-2', 'unit-2', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-2', false, true, true),
  ('seed-nr-001', 'NR-001', 'นั่งร้าน 1.70(ชุด)', 'cat-3', 'unit-3', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-3', false, true, true),
  ('seed-nr-002', 'NR-002', 'ล้อ 6นิ้ว', 'cat-3', 'unit-3', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-3', false, true, true),
  ('seed-nr-003', 'NR-003', 'ล้อ 8นิ้ว', 'cat-3', 'unit-3', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-3', false, true, true),
  ('seed-nr-004', 'NR-004', 'ขาปรับระดับ', 'cat-3', 'unit-3', 'RENT', 35, 0, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-3', false, true, true),
  ('seed-acc-001', 'ACC-NUT-0410', 'น็อต 4/10"', 'cat-4', 'unit-4', 'RENT', 35, 20, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-4', true, false, true),
  ('seed-acc-002', 'ACC-NUT-0414', 'น็อต 4/14"', 'cat-4', 'unit-4', 'RENT', 35, 20, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-4', true, false, true),
  ('seed-acc-003', 'ACC-NUT-0401', 'น็อต 4/1"', 'cat-4', 'unit-4', 'RENT', 35, 20, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-4', true, false, true),
  ('seed-acc-004', 'ACC-CROSS', 'กากบาท', 'cat-4', 'unit-4', 'RENT', 35, 20, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-4', true, false, true),
  ('seed-acc-005', 'ACC-CAP', 'ครอบนั่งร้าน', 'cat-4', 'unit-4', 'RENT', 35, 20, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-4', true, false, true),
  ('seed-acc-006', 'ACC-JOINT', 'ข้อต่อ', 'cat-4', 'unit-4', 'RENT', 35, 20, 20, NULL, 'NORMAL', 0, 0, 0, 0, 2, 'ACTIVE', 'PER_ROUND', 'ราคาเช่าต่อรอบ × จำนวนสินค้า × จำนวนรอบ', 'cat-4', true, false, true)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  unit_id = EXCLUDED.unit_id,
  type = EXCLUDED.type,
  rent_price = EXCLUDED.rent_price,
  sale_price = EXCLUDED.sale_price,
  stock_quantity = EXCLUDED.stock_quantity,
  image_url = EXCLUDED.image_url,
  rental_type = EXCLUDED.rental_type,
  daily_price = EXCLUDED.daily_price,
  cost_price = EXCLUDED.cost_price,
  default_damage_fee = EXCLUDED.default_damage_fee,
  default_loss_fee = EXCLUDED.default_loss_fee,
  minimum_stock = EXCLUDED.minimum_stock,
  status = EXCLUDED.status,
  calculation_type = EXCLUDED.calculation_type,
  calculation_label = EXCLUDED.calculation_label,
  category_rule_id = EXCLUDED.category_rule_id,
  is_accessory = EXCLUDED.is_accessory,
  is_chargeable = EXCLUDED.is_chargeable,
  requires_return = EXCLUDED.requires_return,
  updated_at = now();
