// app/(admin)/reports/ReportActions.tsx
'use client'

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ReportWithDetails } from "./page";
import { 
  dismissReport, 
  actionComment, 
  actionRestaurant 
} from "./actions";

export default function ReportActions({ report }: { report: ReportWithDetails }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // (ฟังก์ชัน handleDismiss - เหมือนเดิม)
  const handleDismiss = () => {
    const message = window.prompt(
      "ยืนยัน 'ไม่ดำเนินการ'\nกรุณาระบุเหตุผล/ข้อความที่จะแจ้งกลับไปยังผู้ร้องเรียน:",
      "เราได้ตรวจสอบรายงานของคุณแล้ว แต่ไม่พบการละเมิดใดๆ ขอบคุณที่ช่วยดูแลชุมชน"
    );
    if (!message || message.trim() === "") return;
    if (!report.reporter_id) {
      alert("Error: ไม่พบ ID ผู้ร้องเรียน");
      return;
    }
    setLoading(true);
    setError(null);
    startTransition(async () => {
      const result = await dismissReport(report.id, report.reporter_id!, message);
      if (result.error) {
        setError(result.error);
        alert("เกิดข้อผิดพลาด: " + result.error);
      } else {
        alert("ดำเนินการเรียบร้อย (Dismissed)");
        router.refresh();
      }
      setLoading(false);
    });
  };

  // (1) === แก้ไข: ฟังก์ชัน "Take Action" ===
  const handleTakeAction = () => {
    if (!report.reporter_id) {
      alert("Error: ไม่พบ ID ผู้ร้องเรียน");
      return;
    }
    
    const messageToComplainant = "เราได้รับรายงานของคุณและได้ดำเนินการอย่างเหมาะสมแล้ว ขอบคุณที่แจ้งเข้ามา";

    // (1.1) กรณีรายงานคอมเมนต์ (เหมือนเดิม)
    if (report.comment_id) {
      if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการ "ลบคอมเมนต์" นี้ และแจ้งผลกลับ?`)) return;
      setLoading(true);
      setError(null);
      startTransition(async () => {
        const result = await actionComment(
          report.id, 
          report.comment_id!, 
          report.reporter_id!, 
          messageToComplainant
        );
        if (result.error) {
          setError(result.error);
          alert("เกิดข้อผิดพลาด: " + result.error);
        } else {
          alert("ลบคอมเมนต์ และแจ้งผลเรียบร้อย");
          router.refresh();
        }
        setLoading(false);
      });
    
    // (1.2) === แก้ไข: กรณีรายงานร้านค้า ===
    } else if (report.res_id) {
      let warningToOwner: string | null = null;
      const hasOwner = report.restaurants?.owner_id; //

      if (hasOwner) {
        // (1.3) ถ้ามีเจ้าของ -> ถามหาข้อความตักเตือน
        warningToOwner = window.prompt(
          `ยืนยัน "ระงับร้านค้า" นี้\nร้านนี้มีเจ้าของ กรุณาระบุข้อความ "ตักเตือน" ที่จะส่งไปยังเจ้าของร้าน:`,
          `ร้านค้าของคุณ (${report.restaurants?.res_name}) ถูกรายงานและตรวจสอบพบการละเมิด ร้านค้าของคุณจะถูกระงับชั่วคราว`
        );
        if (!warningToOwner || warningToOwner.trim() === "") return; // กดยกเลิก
      
      } else {
        // (1.4) ถ้าไม่มีเจ้าของ -> แค่ยืนยัน
        if (!window.confirm(`ยืนยัน "ระงับร้านค้า" นี้?\n(ร้านนี้ไม่มีเจ้าของในระบบ จะไม่มีการส่งข้อความตักเตือน)`)) return;
      }
      
      setLoading(true);
      setError(null);
      startTransition(async () => {
        const result = await actionRestaurant(
          report.id,
          report.res_id!,
          report.restaurants?.owner_id || null, // (1.5) ส่ง owner_id (หรือ null)
          report.reporter_id!,
          warningToOwner, // (1.6) ส่ง warning (หรือ null)
          messageToComplainant
        );
        if (result.error) {
          setError(result.error);
          alert("เกิดข้อผิดพลาด: " + result.error);
        } else {
          alert("ระงับร้านค้า และแจ้งผลเรียบร้อย");
          router.refresh();
        }
        setLoading(false);
      });
    } else {
      alert("Error: ข้อมูลรายงานไม่สมบูรณ์ (ไม่พบ ID ร้านค้า หรือ ID คอมเมนต์)");
    }
  };

  // (2) === แก้ไข: Logic การแสดงผล ===
  // ขอแค่มี res_id หรือ comment_id ก็ถือว่า Action ได้
  const canTakeAction = (report.comment_id != null) || (report.res_id != null);
  
  // (2.1) ถ้าเป็นรายงานร้านค้า ให้ตรวจสอบว่ามีเจ้าของหรือไม่
  const actionLabel = report.comment_id 
    ? "ลบคอมเมนต์" 
    : (report.restaurants?.owner_id ? "ระงับร้าน (ตักเตือน)" : "ระงับร้าน (ไม่มีเจ้าของ)");
  
  return (
    <div className="flex flex-col gap-2 items-end">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      
      {/* ปุ่ม "ไม่ดำเนินการ" */}
      <button 
        onClick={handleDismiss} 
        disabled={loading}
        className="py-2 px-4 border-none rounded-md cursor-pointer font-semibold min-w-[180px] transition-colors disabled:opacity-50 bg-gray-500 text-white hover:bg-gray-600"
      >
        {loading ? "..." : "ไม่ดำเนินการ (Dismiss)"}
      </button>
      
      {/* (2.2) ปุ่ม "ลบเนื้อหา" / "ระงับร้าน" */}
      {canTakeAction && (
        <button 
          onClick={handleTakeAction} 
          disabled={loading}
          className="py-2 px-4 border-none rounded-md cursor-pointer font-semibold min-w-[180px] transition-colors disabled:opacity-50 bg-red-500 text-white hover:bg-red-600"
        >
          {loading ? "..." : `${actionLabel} & ปิดเรื่อง`}
        </button>
      )}
    </div>
  );
}

// ลบ const styles ที่ไม่ได้ใช้งานแล้ว