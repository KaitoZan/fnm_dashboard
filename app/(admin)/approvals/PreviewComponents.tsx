// app/(admin)/approvals/PreviewComponents.tsx
'use client'

import React from 'react'
import { 
  IoStar, 
  IoStarHalf, 
  IoStarOutline,
  IoBookmarkOutline, // <-- ไอคอน Bookmark
  IoFlagOutline,      // <-- ไอคอน Flag
} from "react-icons/io5";
import { MdRestaurant, MdDeliveryDining } from "react-icons/md";

// (1) จำลอง star_rating.dart (เหมือนเดิม)
export function StarRating({ rating, size = 20 }: { rating: number, size?: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(<IoStar key={i} size={size} color="#EC4899" />);
    } else if (i - 0.5 <= rating) {
      stars.push(<IoStarHalf key={i} size={size} color="#EC4899" />);
    } else {
      stars.push(<IoStarOutline key={i} size={size} color="#EC4899" />);
    }
  }
  return <div className="flex">{stars}</div>;
}

// (2) === อัปเกรด status_tag.dart ===
//
export function StatusTag({ 
  isOpen,
  hasDelivery, 
  hasDineIn, 
  showOpenStatus,
  iconSize = 20,
  fontSize = 12,
}: { 
  isOpen: boolean, 
  hasDelivery: boolean, 
  hasDineIn: boolean, 
  showOpenStatus: boolean,
  iconSize?: number,
  fontSize?: number,
}) {
  return (
    <div className="flex gap-1 items-center mt-2">
      
      {/* (2.1) ไอคอนทานที่ร้าน */}
      {hasDineIn && (
        <MdRestaurant 
          size={iconSize} 
          color="#1D4ED8" // blue.shade700
        />
      )}
      
      {/* (2.2) ไอคอน Delivery */}
      {hasDelivery && (
        <MdDeliveryDining 
          size={iconSize} 
          color="#16A34A" // green
        />
      )}
      
      {/* (2.3) กล่อง "เปิดอยู่" / "ปิดอยู่" (แก้ไขให้ใช้ inline style สำหรับ fontSize) */}
      {showOpenStatus && (
        <div 
          className={`w-[72px] h-6 flex items-center justify-center rounded-[5px] border ${
            isOpen ? 'bg-pink-300 border-pink-400' : 'bg-blue-300 border-blue-400'
          }`}
        >
          {/* ใช้ style={{ fontSize }} แทน className={`... text-[${fontSize}px]`} */}
          <span 
            className="font-kanit text-white font-bold"
            style={{ fontSize: `${fontSize}px` }}
          >
            {isOpen ? 'เปิดอยู่' : 'ปิดอยู่'}
          </span>
        </div>
      )}
    </div>
  );
}

// (3) Export ไอคอนสำหรับ Banner
export { IoBookmarkOutline, IoFlagOutline };