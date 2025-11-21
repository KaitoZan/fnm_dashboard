// app/(admin)/approvals/ApprovalActions.tsx
'use client'

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { EditRequestWithProfile } from "./page"; // Import Type จากหน้า page

// (1) รับ Prop เป็น request ทั้งก้อน
export default function ApprovalActions({ request }: { request: EditRequestWithProfile }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // (2) ฟังก์ชันอนุมัติ
  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      // (2.1) ดึง ID ของ Admin ที่กำลังล็อคอินอยู่
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Admin not logged in");

      // (2.2) เรียก Postgres Function 'approve_restaurant_request'
      const { error: rpcError } = await supabase.rpc("approve_restaurant_request", {
        p_admin_user_id: user.id,
        p_request_edit_id: request.id,
      });

      if (rpcError) throw rpcError;

      alert("อนุมัติคำขอเรียบร้อยแล้ว");
      router.refresh(); // (2.3) รีเฟรชหน้าเพื่อลบรายการนี้ออก
    } catch (err: any) {
      setError(err.message);
      alert("เกิดข้อผิดพลาดในการอนุมัติ: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // (3) ฟังก์ชันปฏิเสธ
  const handleReject = async () => {
    // (3.1) ถามเหตุผล
    const reason = window.prompt("กรุณาระบุเหตุผลในการปฏิเสธ (จะแสดงให้ผู้ใช้เห็น):");
    
    // ถ้าไม่กรอก หรือกดยกเลิก
    if (!reason || reason.trim() === "") {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // (3.2) ดึง ID ของ Admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Admin not logged in");

      // (3.3) เรียก Postgres Function 'reject_restaurant_request'
      const { error: rpcError } = await supabase.rpc("reject_restaurant_request", {
        p_admin_user_id: user.id,
        p_request_edit_id: request.id,
        p_rejection_reason: reason.trim(), //
      });

      if (rpcError) throw rpcError;

      alert("ปฏิเสธคำขอเรียบร้อยแล้ว");
      router.refresh(); // (3.4) รีเฟรชหน้า
    } catch (err: any) {
      setError(err.message);
      alert("เกิดข้อผิดพลาดในการปฏิเสธ: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // เปลี่ยน style={styles.buttonGroup}
    <div className="flex flex-col gap-2 items-end">
      {/* เปลี่ยน style={styles.errorText} */}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button 
        onClick={handleApprove} 
        disabled={loading} 
        // เปลี่ยน style={{...styles.button, ...styles.approveButton}}
        className="py-2 px-4 border-none rounded-md cursor-pointer font-semibold min-w-[120px] transition-colors disabled:opacity-50 bg-emerald-500 text-white hover:bg-emerald-600"
      >
        {loading ? "..." : "อนุมัติ (Approve)"}
      </button>
      <button 
        onClick={handleReject} 
        disabled={loading} 
        // เปลี่ยน style={{...styles.button, ...styles.rejectButton}}
        className="py-2 px-4 border-none rounded-md cursor-pointer font-semibold min-w-[120px] transition-colors disabled:opacity-50 bg-red-500 text-white hover:bg-red-600"
      >
        {loading ? "..." : "ปฏิเสธ (Reject)"}
      </button>
    </div>
  );
}

// ลบ const styles ที่ไม่ได้ใช้งานแล้ว