# ผลการตรวจสอบความสอดคล้องของโค้ดจริงเทียบกับ MASTER v2.3.0
**วันที่ตรวจสอบ:** 2026-09-22  
**เอกสารอ้างอิง:** `docs/PROJECT_RULES_MASTER_CURRENT.md` (Version 2.3.0)  
**ขอบเขตงาน:** ตรวจสอบเฉพาะไฟล์ที่เกี่ยวข้องตามข้อกำหนด ห้ามแก้ไข Source Code หรือ MASTER

---

## 1. ตารางผลการตรวจสอบ (Audit Matrix)

| Rule Area | Current Implementation | Status | Evidence | Required Fix |
| :--- | :--- | :---: | :--- | :--- |
| **A. PAYMENT** | | | | |
| A1. Partial Payment | รองรับการชำระบางส่วน โดยยอดค้างชำระจะลดลงตามจริงใน RPC และ UI | **PASS** | `supabase/migrations/20260919000002_split_payment_system.sql:220`<br>`components/bills/BillActionView.tsx:876` | - |
| A2. Multiple Payments | รองรับการชำระหนี้หลายครั้ง โดยเรียก RPC สะสมยอดเข้า `paid_amount` ได้ต่อเนื่อง | **PASS** | `supabase/migrations/20260919000002_split_payment_system.sql:219`<br>`tests/split-payment-receipt-audit.test.ts:238` | - |
| A3. Split / Multi-channel | รองรับการแบ่งจ่ายหลายช่องทางใน 1 บิล ผ่าน `p_tenders JSONB` | **PASS** | `supabase/migrations/20260919000002_split_payment_system.sql:198-207`<br>`components/bills/BillActionView.tsx:905` | - |
| A4. Preserve All Channels | ทุกช่องทางถูกบันทึกแยกเป็น 1 Transaction ใน `statement_transactions` และเก็บใน `payment_batches.tenders` ไม่ถูกยุบเหลือช่องทางแรก | **PASS** | `supabase/migrations/20260919000002_split_payment_system.sql:259-288`<br>`tests/split-payment-receipt-audit.test.ts:80` | - |
| A5. Append-only Payments | บันทึกประวัติการชำระแบบ Append-only ลง `payment_batches` และ `statement_transactions` ไม่แก้ทับรายการเดิม | **PASS** | `supabase/migrations/20260919000002_split_payment_system.sql:229-288` | - |
| A6. Payment Refund | มี `processPaymentRefundWorkflow` ตรวจสอบวงเงิน `netPaid` และรับ `originalTxId` แต่ทำงานเฉพาะใน localStorage ไม่มี Supabase RPC | **PARTIAL** | `lib/bill-workflow-service.ts:1621-1725` | สร้าง Supabase RPC สำหรับบันทึก Payment Refund และอัปเดตสถานะบิลในฐานข้อมูลจริง |
| **B. BILL / FINANCE** | | | | |
| B1. Bill Amount Definition | `calculation-service.ts` นำ `depositAmount` ไปบวกเข้ากับ `revenueTotal` เพื่อให้ได้ `grandTotal` ทำให้ยอดบิลปนกับเงินมัดจำความเสียหาย | **FAIL** | `lib/calculation-service.ts:208`<br>`tests/bill-lifecycle-integration.test.ts:127` | ปรับโครงสร้างคำนวณแยก `Bill Amount` (ค่าสินค้า/บริการ/ภาษี/ขนส่ง) ออกจาก `Security Deposit` อย่างเด็ดขาด |
| B2. Net Paid Calculation | คำนวณในหน่วยความจำ `getBillFinanceSummary` หักลบยอดคืนเงินและไม่รวมมัดจำ แต่ไม่มีคอลัมน์และฟังก์ชันสรุปใน Supabase | **PARTIAL** | `lib/finance-storage.ts:318-353` | ปรับให้ Supabase bills หรือ view คำนวณ `net_paid` จากประวัติธุรกรรมจริง |
| B3. Bill Outstanding | คำนวณจาก `grandTotal - paidAmount` ซึ่งหาก `grandTotal` รวมมัดจำ ยอดหนี้บิลจะผิดเพี้ยนทันที | **PARTIAL** | `lib/bill-workflow-service.ts:119`<br>`supabase/migrations/20260919000002_split_payment_system.sql:220` | ผูก `Bill Outstanding` กับ `Bill Amount (Excl. Deposit) - Net Paid` ตามสูตร v2.3.0 |
| B4. Financial Status | มีสถานะ `UNPAID`, `PARTIAL`, `PAID`, `REFUND_PARTIAL`, `REFUNDED` สอดคล้องตามเกณฑ์ยอดเงิน | **PASS** | `supabase/migrations/20260919000002_split_payment_system.sql:221`<br>`lib/bill-workflow-service.ts:613` | - |
| B5. Refund Due Amount | เมื่อมีการแก้ไขบิลลดยอดจน `newGrandTotal < oldPaidAmount` มีการตั้งค่า `refundDueAmount` รองรับเงินคืน | **PASS** | `lib/bill-workflow-service.ts:1219-1222`<br>`lib/types/rental-pos.ts:389` | - |
| B6. Deposit Strict Separation | ตอนสร้างบิล มีการบันทึกรายการเงินมัดจำเป็น `isDeposit: true` และ `category: 'เงินมัดจำ'` แยกจากค่าบริการ | **PASS** | `lib/bill-workflow-service.ts:334-367`<br>`lib/finance-storage.ts:333-350` | - |
| **C. REVENUE RECOGNITION** | | | | |
| C1. Revenue Recognized | ยังไม่มีการคำนวณการรับรู้รายได้ค่าเช่าตามวันหรือรอบที่เกิดขึ้นจริง Dashboard ใช้ `paidAmount` หรือ `grandTotal` แทนรายได้ | **MISSING** | `lib/dashboard-data.ts:833`<br>ไม่มี field ในโมเดลข้อมูล | สร้าง Revenue Recognition Engine คำนวณรายได้ตามจำนวนวัน/รอบที่เกิดขึ้นจริงหลังส่งมอบ |
| C2. Advance / Deferred Amount | ไม่มีโมเดลหรือฟิลด์สำหรับบันทึกและติดตามเงินรับล่วงหน้าที่ยังไม่ถึงกำหนดรับรู้รายได้ | **MISSING** | ไม่มี field หรือ logic ในทุกไฟล์ของ `lib/` | เพิ่มการคำนวณ `Advance / Deferred Amount = max(Net Paid - Revenue Recognized, 0)` |
| C3. Earned Outstanding | ไม่มีฟิลด์และตรรกะสำหรับลูกหนี้บริการจริงที่ส่งมอบแล้วแต่ยังไม่ได้รับเงิน | **MISSING** | ไม่มี field ในโมเดลข้อมูล | เพิ่มการคำนวณ `Earned Outstanding = max(Revenue Recognized - Net Paid, 0)` |
| C4. Decoupling Revenue & Bill | ปัจจุบันระบบยังไม่ได้แยกยอดหนี้บิล (Bill Outstanding) ออกจากลูกหนี้ค่าบริการจริง (Earned Outstanding) | **MISSING** | โมเดลการเงินทั้งระบบยังไม่ได้แยก 2 กองนี้ | ปรับ Schema และโมเดลการเงินแยกระหว่าง Bill Outstanding กับ Earned Outstanding |
| **D. RENTAL LIFECYCLE** | | | | |
| D1. Handover -> Renting | เมื่อกดยืนยันบิลฉบับร่าง ระบบเปลี่ยนเป็น `RENTING` ทันทีแม้ `dispatchStatus === 'PENDING'` | **FAIL** | `lib/bill-workflow-service.ts:603, 617` | ปรับสถานะช่วงที่ยังไม่ส่งมอบให้เป็น `CONFIRMED` และเปลี่ยนเป็น `RENTING` เมื่อส่งมอบจริงเท่านั้น |
| D2. Actual Return Restocks | การคืนสินค้าจริงจะเรียก `returnProductStock` ปรับคืนสต็อกอย่างถูกต้อง | **PASS** | `lib/bill-workflow-service.ts:947`<br>`lib/product-storage.ts:248-293` | - |
| D3. Partial Return | รองรับการคืนบางส่วน บันทึก `returnedQty` และคงค้าง `outstandingQty` พร้อมสถานะ `PARTIAL_RETURNED` | **PASS** | `lib/bill-workflow-service.ts:1004, 1019` | - |
| D4. Return Stock Segregation | แยกคืน Normal (พร้อมใช้), Damaged (ส่งซ่อม), Lost (ตัดจำหน่าย) ถูกต้องตามประเภท | **PASS** | `lib/product-storage.ts:284-289` | - |
| D5. Late Return No Auto Fee | ระบบไม่คิดค่าปรับล่าช้าอัตโนมัติ (`lateFeeTotal = 0`) เป็นไปตามกฎ | **PASS** | `components/bills/BillActionView.tsx:108` | - |
| D6. Extension Bill Handling | การต่อสัญญาเช่า (`mode: 'EXTENSION'`) ในโค้ดปัจจุบันใช้วิธีแก้ทับบิลเดิม ไม่ได้สร้างบิลต่อเนื่องผูกโยงตามกฎ | **FAIL** | `lib/bill-workflow-service.ts:1116-1250` | ห้ามแก้ทับบิลเดิมเมื่อต่อสัญญาเช่า ให้สร้าง Extension Continuation Bill ที่เชื่อมโยงกับ Bill เดิม |
| **E. STOCK** | | | | |
| E1. Available Stock | คำนวณและตัดสต็อกพร้อมใช้งานตามรายการจอง/เช่า | **PASS** | `lib/product-storage.ts:233, 238, 285` | - |
| E2. On-Hand / Total Stock | ติดตาม `totalQuantity`, `rentedQuantity`, `damagedQuantity`, `lostQuantity` แยกชัดเจน | **PASS** | `lib/product-storage.ts:284-289` | - |
| E3. Reservation Logic | มีระบบจองตามช่วงวันที่ (Date-range overlap) ไม่ตัดสต็อกจริงทันทีก่อนส่งมอบ | **PASS** | `lib/reservation-storage.ts:1-60`<br>`lib/product-storage.ts:367-420` | - |
| E4. Dispatch Stock Deduction | เมื่อส่งมอบสินค้าจริง (`dispatchStatus = 'DISPATCHED'`) ระบบตัด `rentedQuantity` หรือ `totalQuantity` ถูกต้อง | **PASS** | `lib/bill-workflow-service.ts:696-720` | - |
| E5. Return Stock Increment | รับคืนแล้วเพิ่มจำนวนเข้าสต็อกปกติหรือสต็อกชำรุดตามการตรวจ | **PASS** | `lib/product-storage.ts:248-293` | - |
| E6. Lost Write-off | สินค้าสูญหายตัดออกจาก `rentedQuantity` และลบออกจาก `totalQuantity` ทันที | **PASS** | `lib/product-storage.ts:287-288` | - |
| E7. Negative Stock Prevention | ป้องกันติดลบด้วย `Math.max(0, ...)` แต่ยังไม่มีการโยนข้อผิดพลาดปฏิเสธการ Dispatch หากสต็อกไม่พอ | **PARTIAL** | `lib/product-storage.ts:238`<br>`lib/bill-workflow-service.ts:309` | เพิ่ม Hard Validation ปฏิเสธการ Dispatch ทันทีหากสต็อกไม่เพียงพอ |
| **F. DEPOSIT / DAMAGE / LOST** | | | | |
| F1. Default Damage/Lost Fee | ใน `BillActionView.tsx` มีการใส่ Fallback เป็น 150 และ 1000 บาทแทนที่จะดึงจาก Master Product โดยตรง | **FAIL** | `components/bills/BillActionView.tsx:287-288` | ดึง `defaultDamageFee` และ `defaultLossFee` จากข้อมูลสินค้าจริงเสมอ ห้ามใช้ตัวเลขคงที่ |
| F2. User Editable Actual Charge | หน้าจอรับคืนสินค้าไม่มี Input Field ให้ผู้ใช้ปรับเปลี่ยนค่าเสียหายจริง (Actual Charge) ต่อหน่วย | **FAIL** | `components/bills/BillActionView.tsx:287-295` | เพิ่มช่องแก้ไขค่าชดเชยความเสียหาย/สูญหายจริงในหน้าจอรับคืน |
| F3. Confirm before Apply Deposit | แม้ UI มี checkbox `deductFromDeposit` แต่ในฟังก์ชัน `processReturnWorkflow` ไม่มีการเรียกตัดเงินมัดจำจริง | **FAIL** | `components/bills/BillActionView.tsx:833-851`<br>`lib/bill-workflow-service.ts:917-1081` | เพิ่มขั้นตอนถามยืนยัน และสร้างตรรกะ Settlement นำมัดจำไปหักค่าเสียหายและตั้งยอดคืนส่วนต่าง |
| F4. Deposit Settlement Audit | ยังไม่มี Audit Log สำหรับการทำ Deposit Settlement หรือการหักมัดจำชดเชยความเสียหาย | **MISSING** | ไม่มี action `DEPOSIT_APPLY` ใน `audit-storage.ts` | เพิ่ม Action Audit Log สำหรับการบันทึกการ Settlement เงินมัดจำ |
| **G. SOURCE OF TRUTH** | | | | |
| G1. Bills | **HYBRID**: ใช้ `localStorage` เป็นหลัก (`loadBills`, `saveBills`) มี Supabase RPC เฉพาะรับชำระเงิน | **PARTIAL** | `lib/bill-storage.ts:225-265` | ย้ายการบันทึกและอ่านข้อมูลบิลทั้งหมดไปยัง Supabase |
| G2. Statement Transactions | **HYBRID**: รับชำระเงินผ่าน Split Payment บันทึกลง Supabase แต่ค่าใช้จ่าย/การคืนเงินยังลง `localStorage` | **PARTIAL** | `lib/finance-storage.ts:32-70, 109-144` | ย้าย Transaction ทั้งหมดให้อ่านและเขียนผ่าน Supabase |
| G3. Payment Batches | **SUPABASE**: บันทึกและดึงข้อมูลผ่าน Supabase 100% | **PASS** | `supabase/migrations/20260919000002_split_payment_system.sql:41-55` | - |
| G4. Products & Stock | **LOCALSTORAGE**: ข้อมูลสินค้าและการปรับสต็อกทั้งหมดทำงานบน `localStorage` 100% ไม่มี Supabase | **FAIL** | `lib/product-storage.ts:16-17` | เชื่อมโยงข้อมูลสินค้าและสต็อกเข้ากับตารางใน Supabase |
| G5. Reservations & Backorders | **LOCALSTORAGE**: การจองสินค้าทำงานบน `localStorage` 100% | **FAIL** | `lib/reservation-storage.ts:37` | ย้าย Reservation เข้า Supabase |
| G6. Quotations | **LOCALSTORAGE**: ใบเสนอราคาทำงานบน `localStorage` 100% | **FAIL** | `lib/quotation-storage.ts:17` | ย้าย Quotation เข้า Supabase |
| G7. Customers | **LOCALSTORAGE**: ข้อมูลลูกค้าทำงานบน `localStorage` 100% | **FAIL** | `lib/customer-storage.ts:10` | ย้าย Customer เข้า Supabase |
| G8. Audit Logs | **HYBRID**: ฟังก์ชัน `recordAuditLog` เขียนลง `localStorage` เท่านั้น มีเพียง RPC Split Payment ที่ลง Supabase | **PARTIAL** | `lib/audit-storage.ts:118` | ให้ `recordAuditLog` บันทึกลงตาราง `public.audit_logs` ใน Supabase จริง |
| G9. Settings | **LOCALSTORAGE**: การตั้งค่าระบบทำงานบน `localStorage` 100% | **FAIL** | `lib/settings-storage.ts:4` | เชื่อมต่อ System Settings กับ Supabase |

---

## 2. สรุปจำนวนสถานะผลการตรวจ

* **PASS (ผ่านเกณฑ์):** 17 รายการ
* **FAIL (ไม่ตรงตามกฎ/ต้องแก้ไข):** 11 รายการ
* **PARTIAL (ทำแล้วบางส่วน/ยังไม่สมบูรณ์):** 6 รายการ
* **MISSING (ยังไม่มี Implementation):** 5 รายการ
* **NOT CHECKED:** 0 รายการ

---

## 3. การจัดลำดับความสำคัญของปัญหา (Prioritization)

### 🔴 CRITICAL (วิกฤติ - กระทบความถูกต้องของยอดเงินและโมเดลธุรกิจหลัก)
1. **Revenue Recognition Layer ขาดหายทั้งระบบ (MISSING):**
   * ไม่มีกลไกแยกแยะระหว่าง `Revenue Recognized`, `Advance/Deferred Amount`, `Earned Outstanding`, และ `Bill Outstanding`
   * Dashboard และระบบรายงานนำยอด `paidAmount` หรือ `grandTotal` ไปนับเป็นรายได้โดยตรง ซึ่งผิดหลักการบัญชีและกฎ MASTER v2.3.0
2. **Deposit Settlement & Damage/Lost ไม่สมบูรณ์ (FAIL):**
   * UI รับคืนสินค้าดึง Fallback 150/1000 แทนที่จะดึงราคาจริงจากสินค้า
   * ผู้ใช้ไม่สามารถแก้ไขปรับลดหรือเพิ่ม Actual Charge บนหน้าจอได้
   * `processReturnWorkflow` ไม่ได้นำเงินมัดจำมาหักชำระจริงในระบบ และไม่มีการบันทึก Audit การ Settlement
3. **Bill Amount ปนเปื้อนด้วย Deposit (FAIL):**
   * `calculation-service.ts` รวมเงินมัดจำเข้ากับ `grandTotal` ส่งผลให้ยอดหนี้บิลและยอดค้างชำระสับสนกับหลักประกันความเสียหาย

### 🟠 HIGH (สำคัญสูง - กระทบความน่าเชื่อถือและการทำงานต่อเนื่อง)
1. **Source of Truth แตกแยก (Hybrid & localStorage):**
   * มีเพียงโมดูล Split Payment เท่านั้นที่เชื่อม Supabase อย่างสมบูรณ์ ส่วน Products, Reservations, Quotations, Customers และ Settings ยังอยู่บน `localStorage` 100%
   * บิลและประวัติธุรกรรมอยู่ในสถานะลูกผสม ทำให้ข้อมูลสูญหายได้ง่ายหากล้างเบราว์เซอร์
2. **สถานะ RENTING เกิดก่อนการส่งมอบจริง (FAIL):**
   * เมื่อยืนยันบิลฉบับร่าง บิลถูกเปลี่ยนเป็น `RENTING` ทันทีแม้ของจะยังไม่ส่งมอบ (`dispatchStatus === 'PENDING'`)
3. **การต่อสัญญาเช่า (Extension) แก้ทับบิลเดิม (FAIL):**
   * ระบบแก้ข้อมูลลงในบิลเดิม แทนที่จะสร้างบิลต่อเนื่อง (Continuation/Extension Bill) ตามกฎ

### 🟡 MEDIUM (ปานกลาง - ควรปรับปรุงให้รัดกุม)
1. **Payment/Deposit Refund ยังทำงานบน localStorage (PARTIAL):**
   * ยังไม่มี Supabase RPC รองรับการคืนเงิน ทำให้ยอดเงินในฐานข้อมูลกลางไม่อัปเดตเมื่อมีการคืนเงิน
2. **การป้องกันสต็อกติดลบใช้วิธี Clamp ด้วย Math.max (PARTIAL):**
   * ควบคุมตัวเลขไม่ให้ติดลบได้ แต่ไม่แจ้งเตือนข้อผิดพลาดหรือปฏิเสธคำสั่งเมื่อสินค้าไม่พอจริงตอน Dispatch

---

## 4. ข้อเสนอแนะ: งานแก้รอบแรก (อันดับ 1) ที่ควรทำก่อนที่สุด

> [!IMPORTANT]
> **งานแก้ลำดับที่ 1: การแยกโครงสร้าง Bill Amount ออกจาก Deposit อย่างเด็ดขาด พร้อมสร้างโมเดลความสัมพันธ์ทางการเงิน 6 ยอด (Financial Core Foundation)**

### เหตุผลสนับสนุน:
โครงสร้างความสัมพันธ์ทางการเงินระหว่าง **Bill Amount, Net Paid, Revenue Recognized, Bill Outstanding, Earned Outstanding, และ Advance/Deferred Amount** ถือเป็น "แกนกลาง (Core Truth)" ของระบบ Rental POS ตาม MASTER v2.3.0 หากจุดนี้ยังไม่ได้รับการแก้ไขให้ชัดเจน:
1. การเชื่อมต่อ Supabase ในขั้นตอนต่อไปจะสร้าง Table Schema ที่ผิดพลาด
2. การคำนวณหักลบเงินมัดจำ (Deposit Settlement) จะไม่สามารถระบุได้ว่าเงินที่หักนั้นสัมพันธ์กับยอดบิลหรือรายได้ส่วนใด
3. หน้ารายงานและแดชบอร์ดจะไม่สามารถแสดงตัวเลขที่ถูกต้องตามหลักบัญชีได้เลย

ดังนั้น การสร้าง Data Interface และ Calculation Module สำหรับ 6 ยอดนี้ให้ถูกต้องและมี Unit Test ครอบคลุม จึงเป็นรากฐานที่ต้องดำเนินการก่อนงานส่วนอื่นทั้งหมด
