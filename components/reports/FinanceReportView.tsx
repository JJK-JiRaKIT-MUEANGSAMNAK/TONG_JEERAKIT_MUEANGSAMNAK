'use client'

import React from 'react'
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  Calendar,
} from 'lucide-react'
import {
  FinanceReportData,
  formatCurrency,
  formatNumber,
  formatThaiDate,
} from '@/lib/report-data'
import { ReportAreaTrendChart, ReportDonutChart } from './ReportCharts'

export function FinanceReportView({ data }: { data: FinanceReportData }) {
  const isNetPositive = data.netIncome >= 0

  return (
    <div className="space-y-2">
      {/* ─── 1. TOP KPI CARDS (Topic 1, 2, 7 & 8) ──────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {/* Card 1: รายรับ (Income) */}
        <div className="p-2 rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              รายรับรวม
            </span>
            <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-1">
            <div className="text-base sm:text-lg font-black font-mono text-emerald-700 dark:text-emerald-400">
              ฿{formatCurrency(data.totalIncome)}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              <span>{formatNumber(data.incomeCount)} รายการ</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span
                className={`font-bold font-mono flex items-center ${
                  data.incomeGrowth >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {data.incomeGrowth >= 0 ? '+' : ''}
                {data.incomeGrowth}%
              </span>
            </div>
          </div>
          <div className="text-[9.5px] text-slate-400 font-mono">
            ช่วงก่อน: ฿{formatCurrency(data.prevTotalIncome)}
          </div>
        </div>

        {/* Card 2: รายจ่าย / เงินคืน (Expense / Refund) */}
        <div className="p-2 rounded-xl border border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              รายจ่าย / คืนเงิน
            </span>
            <div className="p-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-1">
            <div className="text-base sm:text-lg font-black font-mono text-rose-700 dark:text-rose-400">
              ฿{formatCurrency(data.totalExpense)}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              <span>{formatNumber(data.expenseCount)} รายการ</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span
                className={`font-bold font-mono flex items-center ${
                  data.expenseGrowth <= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {data.expenseGrowth >= 0 ? '+' : ''}
                {data.expenseGrowth}%
              </span>
            </div>
          </div>
          <div className="text-[9.5px] text-slate-400 font-mono">
            ช่วงก่อน: ฿{formatCurrency(data.prevTotalExpense)}
          </div>
        </div>

        {/* Card 3: รายรับสุทธิ (Net Income) */}
        <div
          className={`p-2 rounded-xl border flex flex-col justify-between ${
            isNetPositive
              ? 'border-emerald-500/30 bg-emerald-500/10'
              : 'border-rose-500/30 bg-rose-500/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[11px] font-bold flex items-center gap-1 ${
                isNetPositive
                  ? 'text-emerald-800 dark:text-emerald-300'
                  : 'text-rose-800 dark:text-rose-300'
              }`}
            >
              <Wallet className="w-3 h-3" />
              รายรับสุทธิ
            </span>
            {isNetPositive ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            )}
          </div>
          <div className="my-1">
            <div
              className={`text-base sm:text-lg font-black font-mono ${
                isNetPositive
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-rose-700 dark:text-rose-400'
              }`}
            >
              ฿{formatCurrency(data.netIncome)}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              <span>เติบโต:</span>
              <span
                className={`font-bold font-mono ${
                  data.netIncomeGrowth >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {data.netIncomeGrowth >= 0 ? '+' : ''}
                {data.netIncomeGrowth}%
              </span>
            </div>
          </div>
          <div className="text-[9.5px] text-slate-400 font-mono">
            ช่วงก่อน: ฿{formatCurrency(data.prevNetIncome)}
          </div>
        </div>

        {/* Card 4: ลูกหนี้ค้าง (Outstanding Debt - Topic 7) */}
        <div className="p-2 rounded-xl border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-amber-500" />
              ลูกหนี้ค้าง
            </span>
            <div className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-1">
            <div className="text-base sm:text-lg font-black font-mono text-amber-700 dark:text-amber-400">
              ฿{formatCurrency(data.totalOutstanding)}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              ค้างชำระ {formatNumber(data.debtorCount)} บิล
            </div>
          </div>
          <div className="text-[9.5px] text-amber-600/80 dark:text-amber-400/80 font-bold">
            {data.debtorCount > 0 ? 'รอติดตามเรียกเก็บ' : 'ไม่มีหนี้ค้าง'}
          </div>
        </div>

        {/* Card 5: เงินมัดจำ (Deposits - Topic 8) */}
        <div className="col-span-2 md:col-span-1 p-2 rounded-xl border border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-purple-500" />
              เงินมัดจำคงเหลือ
            </span>
            <div className="p-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-1">
            <div className="text-base sm:text-lg font-black font-mono text-purple-700 dark:text-purple-400">
              ฿{formatCurrency(data.currentlyHeldDeposit)}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
              ถือครอง {formatNumber(data.activeDepositBillsCount)} สัญญา
            </div>
          </div>
          <div className="text-[9.5px] text-slate-400 font-mono flex items-center justify-between">
            <span>รับ: ฿{formatNumber(data.depositReceived)}</span>
            <span>คืน: ฿{formatNumber(data.depositRefunded)}</span>
          </div>
        </div>
      </div>

      {/* ─── 2. CHARTS SECTION (Topic 1, 2, 3 & 18) ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Trend Area Chart (Left 2 cols) */}
        <div className="lg:col-span-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                กราฟรายรับ / รายจ่าย / สุทธิย้อนหลัง
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">เปรียบเทียบตามช่วงเวลา</span>
          </div>
          <div className="flex-1 min-h-40">
            <ReportAreaTrendChart
              data={data.trendData}
              series={[
                {
                  name: 'รายรับ',
                  key: 'income',
                  color: '#10b981',
                  gradientId: 'gradIncome',
                },
                {
                  name: 'รายจ่าย/คืนเงิน',
                  key: 'expense',
                  color: '#ef4444',
                  gradientId: 'gradExpense',
                },
              ]}
            />
          </div>
        </div>

        {/* Donut: ช่องทางรับเงิน (Right 1 col - Topic 18) */}
        <div className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                ช่องทางรับเงิน
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">สัดส่วนรายรับ</span>
          </div>

          <div className="flex-1 flex items-center justify-center py-1">
            {data.paymentChannels.length > 0 ? (
              <ReportDonutChart
                data={data.paymentChannels.map((c) => ({
                  label: c.channel,
                  value: c.amount,
                  color: c.color,
                  percentage: c.percentage,
                }))}
                size={120}
                centerTitle="รายรับรวม"
                valuePrefix="฿"
              />
            ) : (
              <div className="text-xs text-slate-400 py-8 text-center">
                ยังไม่มีข้อมูลช่องทางรับเงิน
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-1.5 flex justify-between">
            <span>จำนวนช่องทางทั้งหมด</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {data.paymentChannels.length} ช่องทาง
            </span>
          </div>
        </div>
      </div>

      {/* ─── 3. DETAILS: ลูกหนี้ค้าง & การจัดการเงินมัดจำ (Topics 7 & 8) ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* ลูกหนี้ค้างชำระ (Topic 7) */}
        <div className="p-2 rounded-xl border border-amber-500/20 bg-white dark:bg-slate-900 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                รายการลูกหนี้ค้างชำระ ({data.debtorCount} รายการ)
              </h3>
            </div>
            <span className="text-[11px] font-bold font-mono text-amber-600 dark:text-amber-400">
              รวม ฿{formatCurrency(data.totalOutstanding)}
            </span>
          </div>

          {data.debtorBills.length === 0 ? (
            <div className="text-xs text-slate-400 py-6 text-center">
              ไม่มีลูกหนี้ค้างชำระ ยอดเงินสมบูรณ์ครบถ้วน
            </div>
          ) : (
            <div className="overflow-x-auto max-h-56">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-[#E3E3E3] dark:bg-slate-800 font-bold">
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2 px-1.5 font-bold">เลขที่บิล</th>
                    <th className="py-2 px-1.5 font-bold">ลูกค้า</th>
                    <th className="py-2 px-1.5 font-bold text-right">ยอดรวม</th>
                    <th className="py-2 px-1.5 font-bold text-right text-amber-600">ยอดค้าง</th>
                    <th className="py-2 px-1.5 font-bold text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {data.debtorBills.slice(0, 10).map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-1 px-1.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {b.billNo}
                      </td>
                      <td className="py-1 px-1.5 max-w-[120px] truncate text-slate-700 dark:text-slate-300">
                        <div>{b.customerName}</div>
                        {b.customerPhone && (
                          <div className="text-[9.5px] text-slate-400 font-mono">
                            {b.customerPhone}
                          </div>
                        )}
                      </td>
                      <td className="py-1 px-1.5 font-mono text-right text-slate-600 dark:text-slate-400">
                        ฿{formatNumber(b.grandTotal)}
                      </td>
                      <td className="py-1 px-1.5 font-mono font-bold text-right text-amber-600 dark:text-amber-400">
                        ฿{formatCurrency(b.outstandingAmount)}
                      </td>
                      <td className="py-1 px-1.5 text-center">
                        {b.daysOverdue > 0 ? (
                          <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                            เกิน {b.daysOverdue} วัน
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            รอชำระ
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* รายงานเงินมัดจำ (Topic 8) */}
        <div className="p-2 rounded-xl border border-purple-500/20 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                สรุปความเคลื่อนไหวเงินมัดจำ
              </h3>
            </div>
            <span className="text-[11px] font-bold font-mono text-purple-600 dark:text-purple-400">
              คงค้างรวม ฿{formatCurrency(data.currentlyHeldDeposit)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 my-1">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
              <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">
                รับมัดจำในงวด
              </div>
              <div className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                ฿{formatCurrency(data.depositReceived)}
              </div>
            </div>

            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-center">
              <div className="text-[10px] text-rose-700 dark:text-rose-300 font-bold">
                คืนมัดจำในงวด
              </div>
              <div className="text-sm font-black font-mono text-rose-600 dark:text-rose-400 mt-0.5">
                ฿{formatCurrency(data.depositRefunded)}
              </div>
            </div>

            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
              <div className="text-[10px] text-purple-700 dark:text-purple-300 font-bold">
                มัดจำสุทธิในงวด
              </div>
              <div className="text-sm font-black font-mono text-purple-600 dark:text-purple-400 mt-0.5">
                ฿{formatCurrency(data.netDepositChange)}
              </div>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[10.5px] text-slate-600 dark:text-slate-300 space-y-1 mt-1">
            <div className="flex justify-between">
              <span>สัญญาเช่าที่ยังถือเงินมัดจำ:</span>
              <span className="font-bold font-mono text-slate-900 dark:text-slate-100">
                {data.activeDepositBillsCount} สัญญา
              </span>
            </div>
            <div className="flex justify-between">
              <span>สถานะการคืนเงินมัดจำ:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                ระบบจัดการคืนตามการตรวจรับ
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4. TRANSACTIONS DETAIL TABLE ─────────────────────────────────── */}
      <div className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              ตารางรายละเอียดธุรกรรมการเงิน ({data.transactions.length} รายการ)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">เรียงตามวันที่ล่าสุด</span>
        </div>

        {data.transactions.length === 0 ? (
          <div className="text-xs text-slate-400 py-8 text-center">
            ยังไม่มีข้อมูลธุรกรรมในช่วงเวลานี้
          </div>
        ) : (
          <div className="overflow-x-auto max-h-72">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead className="sticky top-0 bg-[#E3E3E3] dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold z-10">
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2 px-2 font-bold whitespace-nowrap">วันที่ / เวลา</th>
                  <th className="py-2 px-2 font-bold whitespace-nowrap">เลขอ้างอิง / บิล</th>
                  <th className="py-2 px-2 font-bold whitespace-nowrap">หมวดหมู่</th>
                  <th className="py-2 px-2 font-bold whitespace-nowrap">รายละเอียด / ลูกค้า</th>
                  <th className="py-2 px-2 font-bold whitespace-nowrap">ช่องทาง</th>
                  <th className="py-2 px-2 font-bold whitespace-nowrap text-right text-emerald-600">
                    รายรับ
                  </th>
                  <th className="py-2 px-2 font-bold whitespace-nowrap text-right text-rose-600">
                    รายจ่าย
                  </th>
                  <th className="py-2 px-2 font-bold whitespace-nowrap text-right">ยอดสะสม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {data.transactions.slice(0, 50).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-1 px-2 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatThaiDate(t.dateTime)}
                    </td>
                    <td className="py-1 px-2 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {t.billNo || t.refNo}
                    </td>
                    <td className="py-1 px-2 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded-md text-[9.5px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-1 px-2 max-w-[200px] truncate text-slate-700 dark:text-slate-300">
                      <div>{t.description}</div>
                      {t.customerName && (
                        <div className="text-[9.5px] text-slate-400">{t.customerName}</div>
                      )}
                    </td>
                    <td className="py-1 px-2 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded-md text-[9.5px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                        {t.channel || 'โอนเงิน'}
                      </span>
                    </td>
                    <td className="py-1 px-2 font-mono font-bold text-right text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {t.incomeAmount > 0 ? `+฿${formatCurrency(t.incomeAmount)}` : '-'}
                    </td>
                    <td className="py-1 px-2 font-mono font-bold text-right text-rose-600 dark:text-rose-400 whitespace-nowrap">
                      {t.expenseAmount > 0 ? `-฿${formatCurrency(t.expenseAmount)}` : '-'}
                    </td>
                    <td className="py-1 px-2 font-mono text-right text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      ฿{formatCurrency(t.runningBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
