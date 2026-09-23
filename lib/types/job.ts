export interface Employee {
  id: string
  name: string
  phone?: string
  role: string // ADMIN, TECHNICIAN, DRIVER
  lineUserId?: string
  lineIntegrationStatus: 'UNLINKED' | 'PENDING_EXTERNAL_CREDENTIALS' | 'LINKED'
  createdAt: string
  updatedAt: string
}

export interface Job {
  id: string
  jobNo: string // e.g. JOB-2609-0001
  title: string
  description?: string
  
  // Link to other entities
  customerId?: string
  billId?: string
  quotationId?: string
  
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
  appointmentDate?: string
  appointmentTime?: string
  
  location?: string
  
  createdAt: string
  updatedAt: string
}

export interface JobAssignment {
  id: string
  jobId: string
  employeeId: string
  role?: string // e.g., LEADER, ASSISTANT
}
