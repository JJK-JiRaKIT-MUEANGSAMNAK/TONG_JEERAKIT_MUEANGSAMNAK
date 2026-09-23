import { createClient } from '@/lib/supabase/client'
import { Job, Employee, JobAssignment } from '@/lib/types/job'

// STATUS: READY_AFTER_REMOTE_APPLY
// This repository is prepared for Supabase migration but currently the application relies on local storage or stub data to maintain runtime stability.

const supabase = createClient()

export async function fetchJobsFromSupabase(): Promise<Job[]> {
  const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
  if (error) throw error
  
  return data.map((j: any) => ({
    id: j.id,
    jobNo: j.job_no,
    title: j.title,
    description: j.description,
    customerId: j.customer_id,
    billId: j.bill_id,
    quotationId: j.quotation_id,
    status: j.status as any,
    appointmentDate: j.appointment_date,
    appointmentTime: j.appointment_time,
    location: j.location,
    createdAt: j.created_at,
    updatedAt: j.updated_at
  } as unknown as Job))
}

export async function saveJobToSupabase(job: Job): Promise<void> {
  const { error } = await supabase.from('jobs').upsert({
    id: job.id?.startsWith('cart-') ? undefined : job.id,
    job_no: job.jobNo,
    title: job.title,
    description: job.description,
    customer_id: job.customerId,
    bill_id: job.billId,
    quotation_id: job.quotationId,
    status: job.status,
    appointment_date: job.appointmentDate,
    appointment_time: job.appointmentTime,
    location: job.location,
    updated_at: new Date().toISOString()
  })
  
  if (error) throw error
}

export async function fetchEmployeesFromSupabase(): Promise<Employee[]> {
  const { data, error } = await supabase.from('employees').select('*').order('name', { ascending: true })
  if (error) throw error
  
  return data.map((e: any) => ({
    id: e.id,
    name: e.name,
    phone: e.phone,
    role: e.role,
    lineUserId: e.line_user_id,
    lineIntegrationStatus: e.line_integration_status as any,
    createdAt: e.created_at,
    updatedAt: e.updated_at
  } as unknown as Employee))
}

export async function saveEmployeeToSupabase(employee: Employee): Promise<void> {
  const { error } = await supabase.from('employees').upsert({
    id: employee.id?.startsWith('cart-') ? undefined : employee.id,
    name: employee.name,
    phone: employee.phone,
    role: employee.role,
    line_user_id: employee.lineUserId,
    line_integration_status: employee.lineIntegrationStatus,
    updated_at: new Date().toISOString()
  })
  
  if (error) throw error
}

export async function assignEmployeeToJob(assignment: JobAssignment): Promise<void> {
  const { error } = await supabase.from('job_assignments').insert({
    job_id: assignment.jobId,
    employee_id: assignment.employeeId,
    role: assignment.role
  })
  
  if (error) throw error
}
