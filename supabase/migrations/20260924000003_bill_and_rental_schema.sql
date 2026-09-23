-- Bill and Rental Lifecycle tables
CREATE TABLE bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_no text UNIQUE NOT NULL,
  quotation_id uuid REFERENCES quotations(id),
  customer_id uuid REFERENCES customers(id),
  customer_name text,
  customer_phone text,
  customer_address text,
  site_name text,
  rental_start_date date,
  scheduled_return_date date,
  dispatch_status text DEFAULT 'PENDING', -- PENDING, DISPATCHED
  rental_status text DEFAULT 'DRAFT', -- DRAFT, CONFIRMED, RENTING, RETURNED, EXTENDED, CANCELLED, VOID
  payment_status text DEFAULT 'UNPAID', -- UNPAID, PARTIAL, PAID, REFUNDED
  
  subtotal numeric(12,2) DEFAULT 0,
  discount_amount numeric(12,2) DEFAULT 0,
  shipping_fee numeric(12,2) DEFAULT 0,
  bill_amount numeric(12,2) DEFAULT 0,
  grand_total numeric(12,2) DEFAULT 0,
  paid_amount numeric(12,2) DEFAULT 0,
  outstanding_amount numeric(12,2) DEFAULT 0,
  
  held_deposit_amount numeric(12,2) DEFAULT 0,
  paid_deposit_amount numeric(12,2) DEFAULT 0,
  deposit_refunded numeric(12,2) DEFAULT 0,
  deposit_applied numeric(12,2) DEFAULT 0,
  
  refund_due numeric(12,2) DEFAULT 0,
  cancel_reason text,
  remark text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  cancelled_at timestamptz
);

CREATE TABLE bill_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id uuid REFERENCES bills(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  product_name text,
  product_code text,
  unit text,
  rental_type text, -- DAILY, ROUND, SALE
  quantity int NOT NULL DEFAULT 1,
  returned_qty int DEFAULT 0,
  outstanding_qty int DEFAULT 0,
  daily_rate numeric(12,2) DEFAULT 0,
  rental_start_date date,
  scheduled_return_date date,
  usage_count int DEFAULT 1,
  billable_days int DEFAULT 1,
  is_delivered boolean DEFAULT false,
  actual_return_date date,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read bills" ON bills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert bills" ON bills FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update bills" ON bills FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read bill_items" ON bill_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert bill_items" ON bill_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update bill_items" ON bill_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete bill_items" ON bill_items FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
