CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  role text DEFAULT 'TECHNICIAN',
  line_user_id text,
  line_integration_status text DEFAULT 'UNLINKED', -- UNLINKED, PENDING_EXTERNAL_CREDENTIALS, LINKED
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_no text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  customer_id uuid REFERENCES customers(id),
  bill_id uuid REFERENCES bills(id),
  quotation_id uuid REFERENCES quotations(id),
  status text DEFAULT 'TODO', -- TODO, IN_PROGRESS, DONE, CANCELLED
  appointment_date date,
  appointment_time text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE job_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  role text,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users full access to employees" ON employees FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to jobs" ON jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to job_assignments" ON job_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
