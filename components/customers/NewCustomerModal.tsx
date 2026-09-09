'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { User, Check, Camera, ShieldCheck, Edit3, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react'
import { Customer } from '@/lib/types/rental-pos'
import { THAI_ADDRESS_DATA, ALL_THAI_PROVINCES } from '@/lib/thai-address-data'
import { IDCardScannerModal, ExtractedIDCardData } from './IDCardScannerModal'
import { CustomDatePicker } from '@/components/common/CustomDatePicker'
import { CustomSelect } from '@/components/common/CustomSelect'
import { AppModal, AppModalHeader, AppModalBody, AppModalFooter } from '@/components/common/AppModal'
import { validateThaiNationalId, formatThaiNationalId } from '@/lib/ocr/thai-id-parser'

interface NewCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (customer: Customer, reason?: string) => void
  editingCustomer?: Customer | null
}

const formatPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

export function NewCustomerModal({
  isOpen,
  onClose,
  onSave,
  editingCustomer,
}: NewCustomerModalProps) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [phone2, setPhone2] = useState('')
  const [email, setEmail] = useState('')
  const [lineId, setLineId] = useState('')
  const [taxId, setTaxId] = useState('')

  // Separate Thai Address Fields
  const [houseNo, setHouseNo] = useState('')
  const [moo, setMoo] = useState('')
  const [soi, setSoi] = useState('')
  const [road, setRoad] = useState('')
  const [selectedProvince, setSelectedProvince] = useState('กรุงเทพมหานคร')
  const [selectedDistrict, setSelectedDistrict] = useState('จตุจักร')
  const [selectedSubDistrict, setSelectedSubDistrict] = useState('ลาดยาว')
  const [postalCode, setPostalCode] = useState('10900')

  // Hybrid Mode: Enable manual typing for District / SubDistrict if needed
  const [isCustomDistrict, setIsCustomDistrict] = useState(false)
  const [isCustomSubDistrict, setIsCustomSubDistrict] = useState(false)

  // ID Card Fields
  const [idCardNumber, setIdCardNumber] = useState('')
  const [idCardExpiry, setIdCardExpiry] = useState('')
  const [idCardImageUrl, setIdCardImageUrl] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [wasScanned, setWasScanned] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [updateReason, setUpdateReason] = useState('')

  useEffect(() => {
    setUpdateReason('')
    if (editingCustomer) {
      setCode(editingCustomer.customerCode || '')
      setName(editingCustomer.customerName || '')
      setPhone(editingCustomer.phone || '')
      setPhone2(editingCustomer.phone2 || '')
      setEmail(editingCustomer.email || '')
      setLineId(editingCustomer.lineId || '')
      setTaxId(editingCustomer.taxId || '')
      setHouseNo(editingCustomer.houseNo || '')
      setMoo(editingCustomer.moo || '')
      setSoi(editingCustomer.soi || '')
      setRoad(editingCustomer.road || '')
      setSelectedProvince(editingCustomer.province || 'กรุงเทพมหานคร')
      setSelectedDistrict(editingCustomer.district || 'จตุจักร')
      setSelectedSubDistrict(editingCustomer.subDistrict || 'ลาดยาว')
      setPostalCode(editingCustomer.postalCode || '10900')
      setIdCardNumber(editingCustomer.idCardNumber ? formatThaiNationalId(editingCustomer.idCardNumber) : '')
      setIdCardExpiry(editingCustomer.idCardExpiry || '')
      setIdCardImageUrl(editingCustomer.idCardImageUrl || '')
      setUploadedFileName(editingCustomer.idCardImageUrl ? 'attached_id_card.png' : '')
      setWasScanned(false)
    } else {
      setCode('CUST-' + String(Date.now()).slice(-6))
      setName('')
      setPhone('')
      setPhone2('')
      setEmail('')
      setLineId('')
      setTaxId('')
      setHouseNo('')
      setMoo('')
      setSoi('')
      setRoad('')
      setSelectedProvince('กรุงเทพมหานคร')
      setSelectedDistrict('จตุจักร')
      setSelectedSubDistrict('ลาดยาว')
      setPostalCode('10900')
      setIdCardNumber('')
      setIdCardExpiry('')
      setIdCardImageUrl('')
      setUploadedFileName('')
      setWasScanned(false)
    }
  }, [editingCustomer, isOpen])

  // Memoize available Districts based on selected Province
  const currentProvinceData = useMemo(() => {
    return THAI_ADDRESS_DATA.find((p) => p.name === selectedProvince)
  }, [selectedProvince])

  const availableDistricts = useMemo(() => {
    return currentProvinceData
      ? currentProvinceData.districts.map((d) => d.name)
      : ['เมือง' + selectedProvince]
  }, [currentProvinceData, selectedProvince])

  // Memoize available SubDistricts based on selected District
  const currentDistrictData = useMemo(() => {
    return currentProvinceData?.districts.find((d) => d.name === selectedDistrict)
  }, [currentProvinceData, selectedDistrict])

  const availableSubDistricts = useMemo(() => {
    return currentDistrictData
      ? currentDistrictData.subDistricts
      : [{ name: 'ในเมือง', postalCode: '10000' }]
  }, [currentDistrictData])

  // Handle Province Change
  const handleProvinceChange = (prov: string) => {
    setSelectedProvince(prov)
    const provMatch = THAI_ADDRESS_DATA.find((p) => p.name === prov)
    if (provMatch && provMatch.districts.length > 0) {
      const firstDist = provMatch.districts[0]
      setSelectedDistrict(firstDist.name)
      if (firstDist.subDistricts.length > 0) {
        setSelectedSubDistrict(firstDist.subDistricts[0].name)
        setPostalCode(firstDist.subDistricts[0].postalCode)
      }
    } else {
      setSelectedDistrict(`เมือง${prov}`)
      setSelectedSubDistrict('ในเมือง')
      setPostalCode('10000')
    }
  }

  // Handle District Change
  const handleDistrictChange = (dist: string) => {
    setSelectedDistrict(dist)
    const distMatch = currentProvinceData?.districts.find((d) => d.name === dist)
    if (distMatch && distMatch.subDistricts.length > 0) {
      setSelectedSubDistrict(distMatch.subDistricts[0].name)
      setPostalCode(distMatch.subDistricts[0].postalCode)
    }
  }

  // Handle SubDistrict Change
  const handleSubDistrictChange = (subDist: string) => {
    setSelectedSubDistrict(subDist)
    const subMatch = currentDistrictData?.subDistricts.find((s) => s.name === subDist)
    if (subMatch) {
      setPostalCode(subMatch.postalCode)
    }
  }

  // File Upload Handler for ID Card Image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUploadedFileName(file.name)
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        if (dataUrl) {
          setIdCardImageUrl(dataUrl)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle Scan Complete from Camera Scanner
  const handleScanComplete = (scannedData: ExtractedIDCardData) => {
    if (scannedData.name) setName(scannedData.name)
    if (scannedData.idCardNumber) setIdCardNumber(formatThaiNationalId(scannedData.idCardNumber))
    if (scannedData.idCardExpiry) setIdCardExpiry(scannedData.idCardExpiry)
    if (scannedData.houseNo) setHouseNo(scannedData.houseNo)
    if (scannedData.moo) setMoo(scannedData.moo)
    if (scannedData.soi) setSoi(scannedData.soi)
    if (scannedData.road) setRoad(scannedData.road)
    if (scannedData.province) setSelectedProvince(scannedData.province)
    if (scannedData.district) setSelectedDistrict(scannedData.district)
    if (scannedData.subDistrict) setSelectedSubDistrict(scannedData.subDistrict)
    if (scannedData.postalCode) setPostalCode(scannedData.postalCode)
    if (scannedData.croppedImageDataUrl) {
      setIdCardImageUrl(scannedData.croppedImageDataUrl)
      setUploadedFileName('scanned_id_card.jpg')
    }
    setWasScanned(true)
    setIsScannerOpen(false)
  }

  // Handle ID Card Input formatting
  const handleIdCardNumberChange = (value: string) => {
    const formatted = formatThaiNationalId(value)
    setIdCardNumber(formatted)
  }

  const isIdCardValid = useMemo(() => {
    const clean = idCardNumber.replace(/\D/g, '')
    if (clean.length === 13) {
      return validateThaiNationalId(clean)
    }
    return null
  }, [idCardNumber])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const fullHouseAddress = [
      houseNo && `เลขที่ ${houseNo}`,
      moo && `หมู่ ${moo}`,
      soi && `ซอย ${soi}`,
      road && `ถนน ${road}`,
    ].filter(Boolean).join(' ') || houseNo

    const fullFormattedAddress = `${fullHouseAddress} ต.${selectedSubDistrict} อ.${selectedDistrict} จ.${selectedProvince} ${postalCode}`.trim()

    const newCustomer: Customer = {
      id: editingCustomer ? editingCustomer.id : `c_${Date.now()}`,
      customerCode: code || ('CUST-' + String(Date.now()).slice(-6)),
      customerName: name.trim(),
      phone: phone,
      phone2: phone2 || undefined,
      email: email || undefined,
      lineId: lineId || undefined,
      taxId: taxId || undefined,
      houseNo: houseNo || undefined,
      moo: moo || undefined,
      soi: soi || undefined,
      road: road || undefined,
      province: selectedProvince,
      district: selectedDistrict,
      subDistrict: selectedSubDistrict,
      postalCode,
      address: fullFormattedAddress,
      idCardNumber: idCardNumber.replace(/\D/g, ''),
      idCardExpiry,
      idCardImageUrl,
      isSuspended: editingCustomer ? editingCustomer.isSuspended : false,
    }

    if (editingCustomer && !updateReason.trim()) {
      alert('กรุณาระบุเหตุผลในการแก้ไขข้อมูลลูกค้า')
      return
    }

    onSave(newCustomer, editingCustomer ? updateReason.trim() : undefined)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <AppModal isOpen={isOpen} onClose={onClose} size="lg">
        {/* Modal Header */}
        <AppModalHeader
          onClose={onClose}
          icon={<User className="w-5 h-5 text-blue-600" />}
          title={editingCustomer ? 'แก้ไขข้อมูลลูกค้า' : 'บันทึกข้อมูลลูกค้าใหม่'}
          headerActions={
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>📸 ถ่ายภาพสแกนบัตร</span>
            </button>
          }
        />

        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
          <AppModalBody className="space-y-3 py-3">
            {wasScanned && (
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl text-emerald-800 dark:text-emerald-200 font-extrabold text-xs flex items-center gap-1.5 animate-in fade-in">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>⚡ สแกนข้อมูลจากบัตรประชาชนเรียบร้อยแล้ว (สามารถตรวจสอบหรือแก้ไขเพิ่มเติมได้)</span>
              </div>
            )}

            {/* SECTION 1: ข้อมูลติดต่อ */}
            <div className="space-y-1.5">
              <div className="border-b border-slate-200 dark:border-slate-700 pb-1">
                <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                  ข้อมูลติดต่อลูกค้า
                </span>
              </div>

              {/* ชื่อลูกค้า / ชื่อบริษัท * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                  ชื่อลูกค้า / ชื่อบริษัท <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น คุณสมชาย ใจดี / บจก. เจียรกิจ เมืองสำนัก"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* เบอร์โทรศัพท์ 1 & 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    เบอร์โทรศัพท์หลัก <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="081-234-5678"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    เบอร์โทรศัพท์สำรอง
                  </label>
                  <input
                    type="tel"
                    placeholder="089-876-5432"
                    value={phone2}
                    onChange={(e) => setPhone2(formatPhoneNumber(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* อีเมล, LINE ID, เลขผู้เสียภาษี */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    อีเมล
                  </label>
                  <input
                    type="email"
                    placeholder="customer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    LINE ID
                  </label>
                  <input
                    type="text"
                    placeholder="line_id"
                    value={lineId}
                    onChange={(e) => setLineId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    เลขประจำตัวผู้เสียภาษี
                  </label>
                  <input
                    type="text"
                    placeholder="เลข 13 หลัก"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: ที่อยู่ตามเอกสาร */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-1">
                <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                  ที่อยู่ตามเอกสาร / ทะเบียนบ้าน
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomDistrict(!isCustomDistrict)
                    setIsCustomSubDistrict(!isCustomSubDistrict)
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isCustomDistrict ? 'เลือกจากตัวเลือกอัตโนมัติ' : 'พิมพ์ชื่ออำเภอ/ตำบลเอง'}</span>
                </button>
              </div>

              {/* แถวที่ 1: บ้านเลขที่, หมู่, ซอย, ถนน */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    บ้านเลขที่
                  </label>
                  <input
                    type="text"
                    placeholder="99/1"
                    value={houseNo}
                    onChange={(e) => setHouseNo(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    หมู่
                  </label>
                  <input
                    type="text"
                    placeholder="1"
                    value={moo}
                    onChange={(e) => setMoo(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    ซอย
                  </label>
                  <input
                    type="text"
                    placeholder="สุขุมวิท 21"
                    value={soi}
                    onChange={(e) => setSoi(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    ถนน
                  </label>
                  <input
                    type="text"
                    placeholder="สุขุมวิท"
                    value={road}
                    onChange={(e) => setRoad(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              {/* แถวที่ 2: จังหวัด, อำเภอ / เขต, ตำบล / แขวง, รหัสไปรษณีย์ */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    จังหวัด (พิมพ์ค้นหา/เลือก)
                  </label>
                  <CustomSelect
                    searchable={true}
                    placeholder="-- เลือกจังหวัด --"
                    value={selectedProvince}
                    onChange={(val) => handleProvinceChange(String(val))}
                    options={ALL_THAI_PROVINCES.map((p) => ({ value: p, label: p }))}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    อำเภอ / เขต
                  </label>
                  {isCustomDistrict ? (
                    <input
                      type="text"
                      placeholder="ระบุอำเภอ..."
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 font-bold text-xs"
                    />
                  ) : (
                    <CustomSelect
                      searchable={true}
                      placeholder="-- เลือกอำเภอ --"
                      value={selectedDistrict}
                      onChange={(val) => handleDistrictChange(String(val))}
                      options={availableDistricts.map((d) => ({ value: d, label: d }))}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    ตำบล / แขวง
                  </label>
                  {isCustomSubDistrict ? (
                    <input
                      type="text"
                      placeholder="ระบุตำบล..."
                      value={selectedSubDistrict}
                      onChange={(e) => setSelectedSubDistrict(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 font-bold text-xs"
                    />
                  ) : (
                    <CustomSelect
                      searchable={true}
                      placeholder="-- เลือกตำบล --"
                      value={selectedSubDistrict}
                      onChange={(val) => handleSubDistrictChange(String(val))}
                      options={availableSubDistricts.map((s) => ({
                        value: s.name,
                        label: s.name,
                        sublabel: s.postalCode ? `ปณ. ${s.postalCode}` : undefined,
                      }))}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    รหัสไปรษณีย์ (เติมอัตโนมัติ)
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-center text-blue-600 dark:text-blue-400 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: ข้อมูลและรูปถ่ายบัตรประชาชน */}
            <div className="space-y-1.5">
              <div className="border-b border-slate-200 dark:border-slate-700 pb-1">
                <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                  ข้อมูลและหลักฐานบัตรประชาชน
                </span>
              </div>

              {/* เลขบัตรประชาชน & วันหมดอายุ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <div className="flex justify-between items-center mb-0.5">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      เลขประจำตัวประชาชน (13 หลัก)
                    </label>
                    {isIdCardValid === true && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>เลขบัตรถูกต้อง</span>
                      </span>
                    )}
                    {isIdCardValid === false && (
                      <span className="text-[10px] text-rose-500 font-bold flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" />
                        <span>ตรวจสอบเลข 13 หลัก</span>
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="x-xxxx-xxxxx-xx-x"
                    value={idCardNumber}
                    onChange={(e) => handleIdCardNumberChange(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    วันหมดอายุบัตรประชาชน
                  </label>
                  <CustomDatePicker
                    value={idCardExpiry ? new Date(idCardExpiry) : null}
                    onChange={(d) => setIdCardExpiry(d ? d.toISOString().split('T')[0] : '')}
                    align="left"
                    placeholder="เลือกวันหมดอายุ..."
                  />
                </div>
              </div>

              {/* รูปถ่ายบัตร และปุ่มจัดการ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                {/* กรอบรูปบัตรประชาชนสัดส่วนจริง */}
                <div className="aspect-[85.6/54] w-full max-w-[220px] rounded-xl bg-slate-900 shadow-sm relative overflow-hidden flex flex-col justify-between border border-blue-400/40">
                  {idCardImageUrl ? (
                    <div className="absolute inset-0 bg-slate-950 flex items-center justify-center p-1 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={idCardImageUrl}
                        alt="ID Card"
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIdCardImageUrl('')
                          setUploadedFileName('')
                        }}
                        className="absolute top-1 right-1 p-1 rounded-md bg-rose-600/90 text-white hover:bg-rose-700 transition-all opacity-80 hover:opacity-100"
                        title="ลบรูปบัตร"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-full p-2.5 bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 text-white flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[7px] font-black uppercase text-blue-200">บัตรประจำตัวประชาชนไทย</p>
                          <p className="text-[10px] font-extrabold truncate max-w-[140px] text-white">
                            {name || 'ชื่อ-นามสกุล ลูกค้า'}
                          </p>
                        </div>
                        <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-[7px] font-black text-slate-900 shrink-0">
                          TH
                        </div>
                      </div>
                      <div className="font-mono my-auto">
                        <p className="text-[7px] text-blue-200">เลขประจำตัวประชาชน</p>
                        <p className="text-[11px] font-bold text-yellow-300 tracking-wider">
                          {idCardNumber || 'x-xxxx-xxxxx-xx-x'}
                        </p>
                      </div>
                      <div className="flex justify-between items-end text-[7px] font-mono text-blue-200 border-t border-white/20 pt-0.5">
                        <span>หมดอายุ: {idCardExpiry || '-'}</span>
                        <span className="text-emerald-300 font-bold">✓ SMART ID</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Control Upload / Scan */}
                <div className="space-y-2">
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    ถ่ายภาพหรือเลือกไฟล์รูปภาพบัตรประชาชน
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    ระบบจะตัดภาพให้อยู่ในสัดส่วนมาตรฐาน และอ่านข้อมูลภาษาไทยให้โดยอัตโนมัติ
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setIsScannerOpen(true)}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>เปิดกล้องถ่ายภาพ</span>
                    </button>

                    <label className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 cursor-pointer flex items-center gap-1 transition-colors">
                      <span>📁 เลือกไฟล์รูป</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {uploadedFileName && (
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-mono truncate max-w-[200px]">
                      📄 {uploadedFileName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {editingCustomer && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-1.5">
                <label className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                  <span>เหตุผลในการแก้ไขข้อมูลลูกค้า (จำเป็น)</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={updateReason}
                  onChange={(e) => setUpdateReason(e.target.value)}
                  placeholder="ระบุเหตุผล เช่น ลูกค้าแจ้งเปลี่ยนเบอร์โทรและที่อยู่จัดส่ง..."
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}
          </AppModalBody>

          {/* Footer / ปุ่มล่าง */}
          <AppModalFooter>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>บันทึกข้อมูลลูกค้า</span>
            </button>
          </AppModalFooter>
        </form>
      </AppModal>

      {/* Standalone ID Card Scanner Modal */}
      {isScannerOpen && (
        <IDCardScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScanComplete={handleScanComplete}
        />
      )}
    </>
  )
}
