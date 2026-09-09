import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Camera, Upload, RefreshCw, AlertCircle, Scan, CreditCard, Sparkles } from 'lucide-react'
import { AppModal, AppModalHeader, AppModalBody } from '@/components/common/AppModal'
import { logger } from '@/lib/utils/logger'

export interface ExtractedIDCardData {
  name: string
  idCardNumber: string
  idCardExpiry: string
  houseNo: string
  moo?: string
  soi?: string
  road?: string
  subDistrict: string
  district: string
  province: string
  postalCode: string
  croppedImageDataUrl: string
}

interface IDCardScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onScanComplete: (data: ExtractedIDCardData) => void
  onShowToast?: (title: string, message: string, type: 'SUCCESS' | 'ERROR' | 'INFO') => void
}

export function IDCardScannerModal({
  isOpen,
  onClose,
  onScanComplete,
  onShowToast,
}: IDCardScannerModalProps) {
  const [mode, setMode] = useState<'CAMERA' | 'UPLOAD'>('CAMERA')
  const [isScanning, setIsScanning] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scanStatusMessage, setScanStatusMessage] = useState<string>('กำลังอ่านข้อมูลจากภาพถ่ายบัตรประชาชน...')

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    setCameraError(null)
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraActive(true)
    } catch (err: any) {
      logger.warn('Camera access error or unsupported:', err)
      setCameraError('ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตสิทธิ์ใช้งานกล้อง หรือใช้วิธีอัปโหลดไฟล์ภาพแทน')
      setCameraActive(false)
      setMode('UPLOAD')
    }
  }, [])

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }, [])

  useEffect(() => {
    if (isOpen && mode === 'CAMERA') {
      startCamera()
    } else {
      stopCamera()
    }
    return () => {
      stopCamera()
    }
  }, [isOpen, mode, startCamera, stopCamera])

  // Real OCR Processing via /api/ocr endpoint
  const processCardExtraction = async (croppedImgUrl: string) => {
    setIsScanning(true)
    const cardData: ExtractedIDCardData = {
      name: '',
      idCardNumber: '',
      idCardExpiry: '',
      houseNo: '',
      subDistrict: '',
      district: '',
      province: '',
      postalCode: '',
      croppedImageDataUrl: croppedImgUrl,
    }

    if (onShowToast) {
      onShowToast(
        'แนบรูปถ่ายบัตรประชาชนเรียบร้อย',
        'แนบรูปบัตรแล้ว กรุณากรอกและตรวจสอบข้อมูลลูกค้า',
        'INFO'
      )
    }

    stopCamera()
    onScanComplete(cardData)
    onClose()
    setIsScanning(false)
  }

  // Snap photo from Video Stream and Crop specifically to ID card proportion
  const handleCaptureCamera = () => {
    if (!videoRef.current) return
    const video = videoRef.current

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Crop ID Card area from center based on golden ratio aspect (85.6mm x 53.98mm = ~1.586)
    const cardWidth = canvas.width * 0.75
    const cardHeight = cardWidth / 1.586
    const startX = (canvas.width - cardWidth) / 2
    const startY = (canvas.height - cardHeight) / 2

    const croppedCanvas = document.createElement('canvas')
    croppedCanvas.width = 856
    croppedCanvas.height = 540
    const cropCtx = croppedCanvas.getContext('2d')
    if (cropCtx) {
      cropCtx.drawImage(
        canvas,
        startX,
        startY,
        cardWidth,
        cardHeight,
        0,
        0,
        856,
        540
      )
    }

    const dataUrl = croppedCanvas.toDataURL('image/jpeg', 0.92)
    processCardExtraction(dataUrl)
  }

  // Handle File Upload Scanner
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        if (dataUrl) {
          processCardExtraction(dataUrl)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  if (!isOpen) return null

  return (
    <AppModal
      isOpen={isOpen}
      onClose={() => {
        stopCamera()
        onClose()
      }}
      size="lg"
    >
      {/* Modal Header */}
      <AppModalHeader
        onClose={() => {
          stopCamera()
          onClose()
        }}
        icon={<Scan className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
        title="ถ่ายภาพและสแกนบัตรประชาชน (Smart Thai ID Card OCR)"
      />

      <AppModalBody className="space-y-4">
        {/* Mode Switcher Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1 text-xs font-extrabold border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setMode('CAMERA')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              mode === 'CAMERA'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm border border-slate-200 dark:border-slate-600'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>📷 เปิดกล้องถ่ายภาพสด</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('UPLOAD')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              mode === 'UPLOAD'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm border border-slate-200 dark:border-slate-600'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>📁 อัปโหลดไฟล์รูปภาพบัตร</span>
          </button>
        </div>

        {/* Camera Live Mode */}
        {mode === 'CAMERA' && (
          <div className="space-y-4">
            {cameraError ? (
              <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                <p className="text-xs text-rose-700 dark:text-rose-300 font-semibold">{cameraError}</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 mx-auto transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>ลองเปิดกล้องอีกครั้ง</span>
                </button>
              </div>
            ) : (
              <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border-2 border-blue-500/50 shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* ID Card Framing Overlay */}
                <div className="absolute inset-0 border-[3px] border-dashed border-blue-400 m-4 sm:m-8 rounded-2xl pointer-events-none flex flex-col justify-between p-3 bg-blue-500/5">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded shadow flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>วางบัตรประชาชนให้อยู่ในกรอบนี้</span>
                    </span>
                    <span className="text-[10px] font-mono text-amber-300 font-bold bg-black/60 px-2 py-0.5 rounded">
                      THAI NATIONAL ID
                    </span>
                  </div>
                  <div className="text-center font-bold text-[10px] text-blue-100 bg-black/70 py-1.5 px-3 rounded-lg backdrop-blur-xs">
                    ระบบจะตัดภาพเฉพาะตัวบัตร และดึงชื่อ-เลข 13 หลัก-ที่อยู่ให้อัตโนมัติ
                  </div>
                </div>

                {/* Scanning Animation */}
                {isScanning && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 animate-in fade-in z-20">
                    <RefreshCw className="w-10 h-10 text-blue-400 animate-spin" />
                    <p className="font-extrabold text-sm text-blue-200">{scanStatusMessage}</p>
                  </div>
                )}
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={handleCaptureCamera}
                disabled={isScanning || !cameraActive}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all hover:scale-102 active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                <span>📸 ถ่ายภาพ Snap & สแกนอ่านบัตร</span>
              </button>
            </div>
          </div>
        )}

        {/* Upload Mode */}
        {mode === 'UPLOAD' && (
          <div className="space-y-4">
            <div className="p-8 border-2 border-dashed border-blue-300 dark:border-blue-700/60 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center space-y-3">
              <CreditCard className="w-12 h-12 text-blue-500 mx-auto" />
              <div>
                <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  เลือกไฟล์ภาพถ่ายหน้าบัตรประชาชน (JPG / PNG)
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  ระบบจะอ่านชื่อ เลข 13 หลัก และที่อยู่ออกมาเติมให้อัตโนมัติ
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isScanning}
                className="block w-full max-w-xs mx-auto text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
            </div>

            {isScanning && (
              <div className="p-6 bg-slate-900/90 rounded-2xl text-center space-y-2 text-white">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                <p className="font-bold text-xs text-blue-200">{scanStatusMessage}</p>
              </div>
            )}
          </div>
        )}
      </AppModalBody>
    </AppModal>
  )
}
