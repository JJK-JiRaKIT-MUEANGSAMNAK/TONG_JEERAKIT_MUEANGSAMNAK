CREATE TABLE IF NOT EXISTS public.employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'TECHNICIAN',
  line_user_id TEXT,
  line_integration_status TEXT DEFAULT 'UNLINKED', -- UNLINKED, PENDING_EXTERNAL_CREDENTIALS, LINKED
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.jobs (
  id TEXT PRIMARY KEY,
  job_no TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  customer_id TEXT REFERENCES public.customers(id),
  bill_id TEXT REFERENCES public.bills(id),
  quotation_id TEXT REFERENCES public.quotations(id),
  status TEXT DEFAULT 'TODO', -- TODO, IN_PROGRESS, DONE, CANCELLED
  appointment_date DATE,
  appointment_time TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.job_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT REFERENCES public.jobs(id) ON DELETE CASCADE,
  employee_id TEXT REFERENCES public.employees(id) ON DELETE CASCADE,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users full access to employees" ON public.employees FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to jobs" ON public.jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to job_assignments" ON public.job_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_employees_updated_at ON public.employees;
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON public.jobs;
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
