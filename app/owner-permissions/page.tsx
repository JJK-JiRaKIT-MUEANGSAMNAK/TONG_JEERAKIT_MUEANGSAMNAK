'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShieldCheck,
  Users,
  Activity,
  CheckCircle2,
  AlertTriangle,
  UserX,
  RefreshCw,
  Search,
  Receipt,
  Package,
  FileSpreadsheet,
  Trash2,
  Lock,
  Key,
  Save,
  X,
} from 'lucide-react'
import * as XLSX from 'xlsx'

type ActivityLogCategory = 'BILL' | 'STOCK' | 'SYSTEM' | 'CUSTOMER' | 'MEMBER' | 'FINANCE'

interface BusinessMemberUser {
  id: string
  userId?: string
  businessId?: string
  role?: 'OWNER' | 'USER'
  status?: string
  permissions?: string[]
  profile?: {
    id?: string
    username?: string
    fullName?: string
    avatarUrl?: string
    createdAt?: string
    email?: string
  }
}

interface UserActivityLog {
  id: string
  actorId?: string
  actorName?: string
  action: string
  details?: string
  category: string
  createdAt: string
  metadata?: Record<string, unknown>
}

const PERMISSION_MODULE_LABELS: Record<string, string> = {
  pos: 'หน้าร้าน POS',
  billing: 'บิลเช่า',
  stock: 'สต็อกและสินค้า',
  customers: 'ลูกค้า',
  quotations: 'ใบเสนอราคา',
  finance: 'การเงิน',
  reports: 'รายงาน',
  settings: 'ตั้งค่าระบบ',
  members: 'สมาชิกและสิทธิ์',
  appointments: 'นัดหมาย',
  documents: 'เอกสาร',
}

const PERMISSIONS_CATALOG: Array<{ code: string; label: string; module: string; description: string }> = [
  { code: 'pos.access', label: 'เข้าถึงระบบขายหน้าร้าน', module: 'pos', description: 'เปิดหน้าร้าน POS ได้' },
  { code: 'billing.view', label: 'ดูบิลเช่า', module: 'billing', description: 'ดูรายการบิลเช่าได้' },
  { code: 'billing.manage', label: 'จัดการบิลเช่า', module: 'billing', description: 'สร้าง/แก้ไข/รับคืนบิลเช่า' },
  { code: 'stock.view', label: 'ดูสต็อก', module: 'stock', description: 'ดูรายการสินค้าและสต็อก' },
  { code: 'stock.manage', label: 'จัดการสต็อก', module: 'stock', description: 'เพิ่ม/แก้ไข/ปรับปรุงสต็อก' },
]

type ActiveTab = 'PERMISSIONS' | 'AUDIT_REPORT'
type AuditSubTab = ActivityLogCategory

const categoryNames: Record<AuditSubTab, string> = {
  BILL: 'รายงานตรวจสอบการจัดการบิล',
  CUSTOMER: 'รายงานตรวจสอบการจัดการลูกค้า',
  STOCK: 'รายงานตรวจสอบการจัดการสต็อก',
  MEMBER: 'รายงานตรวจสอบสิทธิ์และสมาชิก',
  FINANCE: 'รายงานตรวจสอบการเงินและบัญชี',
  SYSTEM: 'รายงานตรวจสอบระบบทั่วไป',
}

export default function OwnerPermissionsPage() {
  const router = useRouter()
  const [user] = useState<{ id: string; role: string } | null>(null)
  const authLoading = false

  const [activeTab, setActiveTab] = useState<ActiveTab>('PERMISSIONS')
  const [auditSubTab, setAuditSubTab] = useState<AuditSubTab>('BILL')

  // Members state
  const [members, setMembers] = useState<BusinessMemberUser[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Audit Logs state
  const [logs, setLogs] = useState<UserActivityLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [selectedActorId, setSelectedActorId] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  // Toast / Feedback message
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Modal states for delete confirmation
  const [deleteConfirmMember, setDeleteConfirmMember] = useState<BusinessMemberUser | null>(null)

  // Granular Permission Modal states
  const [permModalMember, setPermModalMember] = useState<BusinessMemberUser | null>(null)
  const [selectedPermCodes, setSelectedPermCodes] = useState<string[]>([])
  const [savingPerms, setSavingPerms] = useState(false)

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type })
    setTimeout(() => setFeedback(null), 4000)
  }

  // Load members
  const loadMembers = useCallback(async () => {
    setLoadingMembers(false)
  }, [])

  // Load audit logs
  const loadLogs = useCallback(async () => {
    setLoadingLogs(false)
  }, [])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  useEffect(() => {
    if (activeTab === 'AUDIT_REPORT') {
      loadLogs()
    }
  }, [activeTab, auditSubTab, selectedActorId, loadLogs])

  // Member Actions
  const handleApprove = async (member: BusinessMemberUser) => {
    setActionLoading(null)
    showNotification(`อนุมัติผู้ใช้งาน ${member.profile?.fullName || member.profile?.username} สำเร็จ`)
  }

  const handleSuspend = async (member: BusinessMemberUser) => {
    setActionLoading(null)
    showNotification(`ระงับสิทธิ์ผู้ใช้งาน ${member.profile?.fullName || member.profile?.username} สำเร็จ`)
  }

  const handleRoleChange = async (member: BusinessMemberUser, newRole: string) => {
    setActionLoading(null)
    showNotification(`เปลี่ยนระดับสิทธิ์เป็น ${newRole} สำเร็จ`)
  }

  const handleDeleteMember = async () => {
    if (!deleteConfirmMember) return
    setActionLoading(null)
    setDeleteConfirmMember(null)
    showNotification('ลบผู้ใช้งานออกจากร้านเรียบร้อยแล้ว')
  }

  const handleOpenPermissionsModal = (member: BusinessMemberUser) => {
    if (member.role === 'OWNER') {
      showNotification('เจ้าของร้านมีสิทธิ์ทั้งหมดโดยสมบูรณ์ ไม่จำเป็นต้องกำหนดสิทธิ์รายบุคคล', 'error')
      return
    }
    setPermModalMember(member)
    setSelectedPermCodes(member.permissions || [])
  }

  const handleTogglePermission = (code: string) => {
    setSelectedPermCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  const handleSelectAllPerms = () => {
    setSelectedPermCodes(PERMISSIONS_CATALOG.map((p) => p.code))
  }

  const handleClearAllPerms = () => {
    setSelectedPermCodes([])
  }

  const handlePresetPosPerms = () => {
    const posCodes = [
      'pos.access',
      'billing.view',
      'billing.create',
      'customers.view',
      'customers.manage',
      'stock.view',
      'returns.process',
    ]
    setSelectedPermCodes(posCodes)
  }

  const handleSavePermissions = async () => {
    if (!permModalMember) return
    setSavingPerms(false)
    showNotification(`บันทึกสิทธิ์ของ ${permModalMember.profile?.fullName || permModalMember.profile?.username} สำเร็จ`)
    setMembers((prev) =>
      prev.map((m) =>
        m.id === permModalMember.id ? { ...m, permissions: selectedPermCodes } : m
      )
    )
    setPermModalMember(null)
  }

  // Format dates helper
  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '-'
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return '-'
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear() + 543
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes} น.`
  }

  // Export audit logs to Excel
  const handleExportAuditExcel = () => {
    if (logs.length === 0) {
      showNotification('ไม่มีข้อมูลสำหรับส่งออก', 'error')
      return
    }

    const exportData = logs.map((log, idx) => ({
      ลำดับ: idx + 1,
      การกระทำ: log.action,
      หมวดหมู่: categoryNames[auditSubTab] || log.category,
      รายละเอียด: log.details || '-',
      'วันที่-เวลา': formatDateTime(log.createdAt),
      ผู้ทำรายการ: log.actorName || '-',
    }))


    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    XLSX.utils.book_append_sheet(wb, ws, auditSubTab)
    const filename = `${categoryNames[auditSubTab]}_${new Date().toISOString().slice(0, 10)}.xlsx`
    XLSX.writeFile(wb, filename)
    showNotification('ส่งออกไฟล์ Excel สำเร็จ')
  }

  if (authLoading || (user && user.role !== 'OWNER')) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center bg-slate-50 dark:bg-[#0b1627] text-slate-800 dark:text-white">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">กำลังตรวจสอบสิทธิ์เจ้าของร้าน...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-slate-100 dark:bg-[#07111f] text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <header className="h-16 px-6 border-b border-slate-200 dark:border-[#263954] flex items-center justify-between bg-white/90 dark:bg-[#0b1627]/90 backdrop-blur shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>ศูนย์ควบคุมและจัดการสิทธิ์เจ้าของร้าน</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                👑 OWNER ONLY
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              จัดการสิทธิ์ผู้ใช้งาน อนุมัติพนักงานใหม่ และตรวจสอบรายงานกิจกรรมความปลอดภัย
            </p>
          </div>
        </div>

        {/* Feedback alert toast */}
        {feedback && (
          <div
            className={`px-4 py-2 rounded-xl text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-2 flex items-center gap-2 border ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-500 dark:text-emerald-200'
                : 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/80 dark:border-rose-500 dark:text-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}
      </header>

      {/* Main Container: Left Sidebar Tabs + Right Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Tab Navigation */}
        <aside className="w-64 border-r border-slate-200 dark:border-[#263954] bg-white dark:bg-[#0b1627] p-3 space-y-1.5 shrink-0 flex flex-col justify-between">
          <div className="space-y-1.5">
            <button
              onClick={() => setActiveTab('PERMISSIONS')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'PERMISSIONS'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <div className="text-left flex-1">
                <span className="block">จัดการสิทธิ์ผู้ใช้งาน</span>
                <span className="text-[10px] opacity-70 font-normal">อนุมัติและปรับบทบาท</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('AUDIT_REPORT')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'AUDIT_REPORT'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-4 h-4" />
              <div className="text-left flex-1">
                <span className="block">รายงานผู้ใช้งาน (Audit Log)</span>
                <span className="text-[10px] opacity-70 font-normal">ประวัติการลบ/แก้ไข/ปรับสต็อก</span>
              </div>
            </button>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>ความปลอดภัยสูงสุด</span>
            </p>
            <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
              เฉพาะเจ้าของร้านที่ได้รับสิทธิ์เท่านั้นที่สามารถอนุมัติและตรวจสอบกิจกรรมของทีมงานได้
            </p>
          </div>
        </aside>

        {/* Right Workspace Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-[#070e18]">
          {/* ========================================================================= */}
          {/* TAB 1: PERMISSION MATRIX                                                  */}
          {/* ========================================================================= */}
          {activeTab === 'PERMISSIONS' && (
            <div className="space-y-4">
              {/* Header Box */}
              <div className="p-5 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:to-[#0b1627] border border-slate-200 dark:border-[#263954] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>ระบบจัดการสิทธิ์ผู้ใช้งาน (Permission Matrix)</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    จัดการระดับการเข้าถึงข้อมูลและเมนูต่างๆ ของพนักงานในร้าน (คนใหม่ต้องได้รับการอนุมัติจึงจะใช้งานได้)
                  </p>
                </div>

                <button
                  onClick={loadMembers}
                  disabled={loadingMembers}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-50 self-start sm:self-auto shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingMembers ? 'animate-spin' : ''}`} />
                  <span>รีเฟรชรายชื่อ</span>
                </button>
              </div>

              {/* Members Table */}
              <div className="rounded-2xl border border-slate-200 dark:border-[#263954] bg-white dark:bg-[#0b1627] overflow-hidden shadow-sm dark:shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-[#263954] bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                        <th className="py-3 px-4">รหัสผู้ใช้</th>
                        <th className="py-3 px-4">ชื่อแสดงผล</th>
                        <th className="py-3 px-4">ชื่อเข้าสู่ระบบ (Username)</th>
                        <th className="py-3 px-4 text-center">ระดับสิทธิ์ (Role)</th>
                        <th className="py-3 px-4 text-center">สถานะ</th>
                        <th className="py-3 px-4">เข้าใช้ล่าสุด</th>
                        <th className="py-3 px-4 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#263954]/60 font-medium">
                      {loadingMembers ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                            <div className="flex flex-col items-center gap-2">
                              <RefreshCw className="w-5 h-5 animate-spin text-emerald-600 dark:text-emerald-400" />
                              <span>กำลังโหลดข้อมูลสมาชิก...</span>
                            </div>
                          </td>
                        </tr>
                      ) : members.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400 italic">
                            ไม่พบรายชื่อผู้ใช้งานในร้าน
                          </td>
                        </tr>
                      ) : (
                        members.map((member) => {
                          const isSelf = member.userId === user?.id
                          const isPending = member.status !== 'ACTIVE'

                          return (
                            <tr
                              key={member.id}
                              className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                                isPending ? 'bg-amber-50/70 dark:bg-amber-950/20' : ''
                              }`}
                            >
                              {/* 1. User UUID */}
                              <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                                <span title={member.userId || '-'}>
                                  {member.userId ? `${member.userId.slice(0, 8)}...${member.userId.slice(-6)}` : '-'}
                                </span>
                              </td>

                              {/* 2. Full Name */}
                              <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                                    {member.profile?.fullName?.[0] || 'U'}
                                  </div>
                                  <span>{member.profile?.fullName || 'ไม่ระบุชื่อ'}</span>
                                  {isSelf && (
                                    <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/40 text-blue-700 dark:text-blue-300 text-[9px] font-bold">
                                      คุณ
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* 3. Username / Email */}
                              <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300 text-[11px]">
                                {member.profile?.username || member.profile?.email || '-'}
                              </td>

                              {/* 4. Role Selector */}
                              <td className="py-3.5 px-4 text-center">
                                <select
                                  value={member.role}
                                  disabled={isSelf || member.role === 'OWNER' || actionLoading === member.id}
                                  onChange={(e) => handleRoleChange(member, e.target.value)}
                                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 disabled:opacity-60 cursor-pointer"
                                >
                                  <option value="OWNER">👑 OWNER (เจ้าของร้าน)</option>
                                  <option value="USER">💻 USER (พนักงาน)</option>
                                </select>
                              </td>

                              {/* 5. Status Badge */}
                              <td className="py-3.5 px-4 text-center">
                                {member.status === 'ACTIVE' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-[10px] font-extrabold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse"></span>
                                    รออนุมัติ
                                  </span>
                                )}
                              </td>

                              {/* 6. Last Active */}
                              <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                                {formatDateTime(member.profile?.createdAt)}
                              </td>

                              {/* 7. Action Buttons */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Approve Button */}
                                  {member.status !== 'ACTIVE' && (
                                    <button
                                      type="button"
                                      disabled={actionLoading === member.id}
                                      onClick={() => handleApprove(member)}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                                      title="กดอนุมัติให้เข้าใช้งานร้าน"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>อนุมัติ</span>
                                    </button>
                                  )}

                                  {/* Granular Permissions Button (for USER role) */}
                                  {member.role === 'USER' && member.status === 'ACTIVE' && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenPermissionsModal(member)}
                                      className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-600/20 dark:hover:bg-indigo-600/30 border border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                      title="กำหนดสิทธิ์การทำงานอย่างละเอียด (Granular Permissions)"
                                    >
                                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                      <span>กำหนดสิทธิ์ ({member.permissions?.length || 0})</span>
                                    </button>
                                  )}

                                  {/* Suspend Button */}
                                  {member.status === 'ACTIVE' && !isSelf && (
                                    <button
                                      type="button"
                                      disabled={actionLoading === member.id}
                                      onClick={() => handleSuspend(member)}
                                      className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-600/20 dark:hover:bg-amber-600/30 border border-amber-200 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                                      title="ระงับการใช้งานชั่วคราว"
                                    >
                                      <UserX className="w-3.5 h-3.5" />
                                      <span>ระงับสิทธิ์</span>
                                    </button>
                                  )}

                                  {/* Delete Button */}
                                  {!isSelf && (
                                    <button
                                      type="button"
                                      disabled={actionLoading === member.id}
                                      onClick={() => setDeleteConfirmMember(member)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer disabled:opacity-50"
                                      title="ลบผู้ใช้นี้ออกจากร้าน"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: USER ACTIVITY AUDIT REPORT                                         */}
          {/* ========================================================================= */}
          {activeTab === 'AUDIT_REPORT' && (
            <div className="space-y-4">
              {/* User Selection & Search Bar (Matches Customer screen flow) */}
              <div className="p-5 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:to-[#0b1627] border border-slate-200 dark:border-[#263954] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>ตรวจสอบประวัติกิจกรรมการทำงานของพนักงาน (User Activity Audit)</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      บันทึกกิจกรรมโปร่งใส ตรวจสอบว่าใครทำการ ลบบิล แก้ไขข้อมูลลูกค้า หรือปรับสต็อกชิ้นไหน
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportAuditExcel}
                      disabled={logs.length === 0}
                      className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 border border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 shadow-xs"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Export Excel</span>
                    </button>

                    <button
                      onClick={loadLogs}
                      disabled={loadingLogs}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                      title="รีเฟรชประวัติ"
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingLogs ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-[#263954]/60">
                  {/* Select Employee Dropdown */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      👤 เลือกพนักงานที่ต้องการตรวจสอบ:
                    </label>
                    <select
                      value={selectedActorId}
                      onChange={(e) => setSelectedActorId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="ALL">👥 ดูพนักงานทุกคน (All Staff)</option>
                      {members.map((m) => (
                        <option key={m.userId} value={m.userId}>
                          {m.profile?.fullName || m.profile?.username} ({m.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Search Term Box */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      🔍 ค้นหาคำสำคัญ / รหัส / เหตุผล:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="พิมพ์เลขบิล, ชื่อลูกค้า, รหัสสินค้า..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Sub-tabs for Audit Categories */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-[#263954] pb-2">
                <button
                  onClick={() => setAuditSubTab('BILL')}
                  className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    auditSubTab === 'BILL'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-[#263954] shadow-xs'
                  }`}
                >
                  <Receipt className="w-4 h-4" />
                  <span>[ การจัดการบิล ]</span>
                  <span className="text-[10px] opacity-80 font-normal">
                    (ลบบิล / แก้ไขบิล / ยกเลิกบิล)
                  </span>
                </button>

                <button
                  onClick={() => setAuditSubTab('CUSTOMER')}
                  className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    auditSubTab === 'CUSTOMER'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-[#263954] shadow-xs'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>[ การจัดการลูกค้า ]</span>
                  <span className="text-[10px] opacity-80 font-normal">
                    (ลบลูกค้า / แก้ไข / ลบ-เพิ่มเอกสาร / พิมพ์)
                  </span>
                </button>

                <button
                  onClick={() => setAuditSubTab('STOCK')}
                  className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    auditSubTab === 'STOCK'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-[#263954] shadow-xs'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>[ การจัดการสต็อก ]</span>
                  <span className="text-[10px] opacity-80 font-normal">
                    (ลบ / เพิ่ม / แก้ไข / ปรับสต็อก / ดัดแปลง)
                  </span>
                </button>

                <button
                  onClick={() => setAuditSubTab('MEMBER')}
                  className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    auditSubTab === 'MEMBER'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-[#263954] shadow-xs'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>[ สิทธิ์และสมาชิก ]</span>
                  <span className="text-[10px] opacity-80 font-normal">
                    (อนุมัติ / ระงับ / เปลี่ยนบทบาท / ลบ)
                  </span>
                </button>

                <button
                  onClick={() => setAuditSubTab('FINANCE')}
                  className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    auditSubTab === 'FINANCE'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-[#263954] shadow-xs'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>[ การเงินและบัญชี ]</span>
                  <span className="text-[10px] opacity-80 font-normal">
                    (รับชำระ / ยกเลิก / คืนเงิน)
                  </span>
                </button>

                <button
                  onClick={() => setAuditSubTab('SYSTEM')}
                  className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    auditSubTab === 'SYSTEM'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-[#263954] shadow-xs'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>[ ระบบทั่วไป ]</span>
                  <span className="text-[10px] opacity-80 font-normal">
                    (ตั้งค่า / เทมเพลต / การแจ้งเตือน)
                  </span>
                </button>
              </div>

              {/* Audit Table Container */}
              <div className="rounded-2xl border border-slate-200 dark:border-[#263954] bg-white dark:bg-[#0b1627] overflow-hidden shadow-sm dark:shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-[#263954] bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                        <th className="py-3 px-4 w-14 text-center">ลำดับ</th>
                        <th className="py-3 px-4 text-center">การกระทำ</th>
                        <th className="py-3 px-4">หมวดหมู่</th>
                        <th className="py-3 px-4">รายละเอียด</th>
                        <th className="py-3 px-4">วันที่และเวลา</th>
                        <th className="py-3 px-4 text-right">ผู้ทำรายการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#263954]/60 font-medium">
                      {loadingLogs ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                            <div className="flex flex-col items-center gap-2">
                              <RefreshCw className="w-5 h-5 animate-spin text-emerald-600 dark:text-emerald-400" />
                              <span>กำลังโหลดประวัติกิจกรรม...</span>
                            </div>
                          </td>
                        </tr>
                      ) : logs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400 italic">
                            ไม่พบประวัติกิจกรรมในหมวดหมู่นี้
                          </td>
                        </tr>
                      ) : (
                        logs.map((log, idx) => (
                          <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            {/* No. */}
                            <td className="py-3 px-4 text-center text-slate-400 dark:text-slate-500 font-mono">
                              {idx + 1}
                            </td>

                            {/* Action badge */}
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                  log.action.includes('ลบ') || log.action.includes('ยกเลิก')
                                    ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400'
                                    : log.action.includes('แก้ไข') || log.action.includes('ปรับ')
                                    ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400'
                                    : 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400'
                                }`}
                              >
                                {log.action}
                              </span>
                            </td>

                            {/* Category */}
                            <td className="py-3 px-4 font-mono text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
                              {categoryNames[auditSubTab] || log.category}
                            </td>

                            {/* Details */}
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={log.details}>
                              {log.details || '-'}
                            </td>

                            {/* Timestamp */}
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                              {formatDateTime(log.createdAt)}
                            </td>

                            {/* Actor */}
                            <td className="py-3 px-4 text-right">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                                {log.actorName || '-'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Delete User Modal Confirmation */}
      {deleteConfirmMember && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0b1627] border border-rose-200 dark:border-rose-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 bg-rose-50 dark:bg-rose-500/20 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">ยืนยันการลบผู้ใช้งาน</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">การดำเนินการนี้ไม่สามารถเรียกคืนได้</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              คุณต้องการลบผู้ใช้งาน{' '}
              <strong className="text-slate-900 dark:text-white">
                {deleteConfirmMember.profile?.fullName || deleteConfirmMember.profile?.username}
              </strong>{' '}
              ออกจากร้านใช่หรือไม่? พนักงานคนนี้จะไม่สามารถล็อกอินเข้าสู่ระบบได้อีกต่อไป
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmMember(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleDeleteMember}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 dark:hover:bg-rose-500 text-white text-xs font-bold shadow transition-colors cursor-pointer"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Granular Permissions Modal */}
      {permModalMember && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0b1627] border border-slate-200 dark:border-[#263954] rounded-2xl p-6 max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#263954] shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <span>กำหนดสิทธิ์การทำงาน: {permModalMember.profile?.fullName || permModalMember.profile?.username}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                      {permModalMember.role}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    เลือกสิทธิ์ที่อนุญาตให้พนักงานเข้าถึงและดำเนินการในระบบ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPermModalMember(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 text-xs shrink-0">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                เลือกแล้ว <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedPermCodes.length}</strong> จาก {PERMISSIONS_CATALOG.length} สิทธิ์
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePresetPosPerms}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-200 dark:border-emerald-500/30 transition-colors"
                >
                  ⚡ ชุดพนักงานขาย (POS)
                </button>
                <button
                  type="button"
                  onClick={handleSelectAllPerms}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] transition-colors"
                >
                  เลือกทั้งหมด
                </button>
                <button
                  type="button"
                  onClick={handleClearAllPerms}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] transition-colors"
                >
                  ล้างทั้งหมด
                </button>
              </div>
            </div>

            {/* Permissions List (Grouped by module) */}
            <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
              {Object.entries(PERMISSION_MODULE_LABELS).map(([moduleKey, moduleLabel]) => {
                const modulePerms = PERMISSIONS_CATALOG.filter((p) => p.module === moduleKey)
                if (modulePerms.length === 0) return null

                return (
                  <div key={moduleKey} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-3">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center justify-between">
                      <span>{moduleLabel}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {modulePerms.filter((p) => selectedPermCodes.includes(p.code)).length}/{modulePerms.length}
                      </span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {modulePerms.map((perm) => {
                        const isChecked = selectedPermCodes.includes(perm.code)
                        return (
                          <label
                            key={perm.code}
                            className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-indigo-50/70 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-500/40 text-slate-900 dark:text-slate-100'
                                : 'bg-white border-slate-200 dark:bg-[#0b1627] dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTogglePermission(perm.code)}
                              className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="min-w-0">
                              <span className="font-bold block text-[11px] leading-snug">{perm.label}</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug block">
                                {perm.description}
                              </span>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-[#263954] shrink-0">
              <button
                type="button"
                disabled={savingPerms}
                onClick={() => setPermModalMember(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={savingPerms}
                onClick={handleSavePermissions}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white text-xs font-bold shadow flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {savingPerms ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>บันทึกสิทธิ์</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
