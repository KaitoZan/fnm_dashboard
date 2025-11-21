'use client'

import React from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: string // <-- (1) เพิ่ม Prop นี้
}

export default function RequestDetailModal({
  isOpen,
  onClose,
  title,
  children,
  // แก้ไข: maxWidth = '800px' -> '640px' (800 * 0.8)
  maxWidth = '640px', 
}: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black/50 flex justify-center items-center z-[1000]" onClick={onClose}>
      {/* (3) ใช้ maxWidth ที่ส่งเข้ามา */}
      <div 
        className="bg-white rounded-lg shadow-2xl w-[90%] max-h-[90vh] flex flex-col"
        style={{ maxWidth }} // ใช้ inline style สำหรับ dynamic maxWidth
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 m-0">{title}</h2>
          <button onClick={onClose} className="bg-transparent border-none text-4xl text-gray-500 cursor-pointer p-0 leading-none">&times;</button>
        </div>
        
        {/* (4) Body ยังคงมี Padding สำหรับ "Raw Data" */}
        <div className="overflow-y-auto text-gray-700 p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

// ลบ const styles ที่ไม่ได้ใช้งานแล้ว