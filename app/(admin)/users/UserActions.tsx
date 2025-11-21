'use client'

import { useTransition } from 'react'
import { updateUserRole, deleteUser } from './actions' 
import { useRouter } from 'next/navigation'; // (1) Import useRouter
import type { Database } from '@/types/supabase'

type Profile = Database["public"]["Tables"]["user_profiles"]["Row"];

export default function UserActions({ user }: { user: Profile }) {
  const [isPending, startTransition] = useTransition(); 
  const router = useRouter(); // (2) เรียกใช้งาน useRouter

  // (3) ฟังก์ชันเปลี่ยน Role
  const handleChangeRole = () => {
    const newRole = window.prompt(`กำหนด Role ใหม่สำหรับ ${user.user_name} (เช่น 'admin' หรือ 'user'):`, user.role || 'user');
    
    if (newRole && newRole !== user.role) {
      startTransition(async () => {
        const result = await updateUserRole(user.id, newRole);
        if (result?.error) {
          alert("เกิดข้อผิดพลาด: " + result.error);
        } else {
          alert("อัปเดต Role เรียบร้อย");
          router.refresh(); // <-- (3.1) รีเฟรชหลังเปลี่ยน Role
        }
      });
    }
  };

  // (4) ฟังก์ชันลบ User
  const handleDeleteUser = () => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ ${user.user_name} ออกจากระบบ? (การกระทำนี้ไม่สามารถย้อนกลับได้)`)) {
      
      startTransition(async () => {
        const result = await deleteUser(user.id);
        
        if (result?.error) {
          alert("เกิดข้อผิดพลาด: " + result.error);
        } else {
          // (5) === ส่วนสำคัญ: บังคับรีเฟรชหน้าจอทันที ===
          alert("ลบผู้ใช้เรียบร้อย");
          router.refresh(); // <--- นี่คือตัวที่จะทำให้ UI อัปเดตทันที
          // ===========================================
        }
      });
    }
  };
  
  return (
    <div className="flex gap-2">
      <button 
        onClick={handleChangeRole} 
        disabled={isPending}
        className="py-2 px-4 border-none rounded-md cursor-pointer font-semibold transition-colors disabled:opacity-50 bg-orange-500 text-white hover:bg-orange-600"
      >
        {isPending ? "..." : "เปลี่ยน Role"}
      </button>
      <button 
        onClick={handleDeleteUser} 
        disabled={isPending}
        className="py-2 px-4 border-none rounded-md cursor-pointer font-semibold transition-colors disabled:opacity-50 bg-red-500 text-white hover:bg-red-600"
      >
        {isPending ? "..." : "ลบผู้ใช้"}
      </button>
    </div>
  );
}

// ลบ const styles ที่ไม่ได้ใช้งานแล้ว