'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { deleteRestaurant } from './actions' // (1) Import Server Action

export default function RestaurantActions({ restaurantId }: { restaurantId: string }) {
  const [isPending, startTransition] = useTransition();

  // (2) ฟังก์ชันลบร้านค้า
  const handleDelete = () => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบร้านค้านี้? (ข้อมูลที่เกี่ยวข้องทั้งหมดจะถูกลบ)`)) {
      // (2.1) เรียก Server Action
      startTransition(async () => {
        const result = await deleteRestaurant(restaurantId);
        if (result?.error) {
          alert("เกิดข้อผิดพลาด: " + result.error);
        } else {
          alert("ลบร้านค้าเรียบร้อย");
        }
      });
    }
  };

  return (
    <div className="flex gap-2">
      {/* (3) ปุ่ม Link ไปหน้า View/Edit */}
      <Link 
        href={`/restaurants/${restaurantId}/edit`} 
        className="py-2 px-4 border-none rounded-md cursor-pointer font-semibold no-underline inline-block transition-colors disabled:opacity-50 bg-blue-500 text-white hover:bg-blue-600"
      >
        View Details {/* <<< เปลี่ยนจาก 'view' เป็น 'View Details' */}
      </Link>
      
      {/* (4) ปุ่ม Delete */}
      <button 
        onClick={handleDelete} 
        disabled={isPending}
        className="py-2 px-4 border-none rounded-md cursor-pointer font-semibold transition-colors disabled:opacity-50 bg-red-500 text-white hover:bg-red-600"
      >
        {isPending ? "..." : "Delete"}
      </button>
    </div>
  );
}

// ลบ const styles ที่ไม่ได้ใช้งานแล้ว