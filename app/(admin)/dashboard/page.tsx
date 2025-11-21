// app/(admin)/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server"; // (1) ใช้ Server Client
import Link from "next/link";
import type { Database } from "@/types/supabase"; //

// (2) สร้างฟังก์ชันสำหรับดึงข้อมูล Stats
// เราจะดึงข้อมูลที่จำเป็นสำหรับ Dashboard
async function getDashboardStats() {
  const supabase = createClient();

  // (2.1) นับคำร้องที่รออนุมัติ (ตาราง restaurant_edits)
  const { count: pendingRequestsCount, error: reqError } = await supabase
    .from("restaurant_edits") //
    .select("*", { count: "exact", head: true }) // head: true คือนับอย่างเดียว ไม่เอาข้อมูล
    .eq("status", "pending"); //

  // (2.2) นับรายงานที่รอตรวจสอบ (ตาราง complaints)
  const { count: pendingReportsCount, error: repError } = await supabase
    .from("complaints") //
    .select("*", { count: "exact", head: true })
    .eq("status", "pending"); //

  // (2.3) นับผู้ใช้ทั้งหมด
  const { count: totalUsersCount, error: userError } = await supabase
    .from("user_profiles") //
    .select("*", { count: "exact", head: true });

  // (2.4) นับร้านค้าทั้งหมด
  const { count: totalRestaurantsCount, error: resError } = await supabase
    .from("restaurants") //
    .select("*", { count: "exact", head: true });

  // (2.5) [Optional] Log Error ถ้ามี
  if (reqError) console.error("Error fetching pending requests:", reqError.message);
  if (repError) console.error("Error fetching pending reports:", repError.message);
  if (userError) console.error("Error fetching total users:", userError.message);
  if (resError) console.error("Error fetching total restaurants:", resError.message);

  return {
    pendingRequestsCount: pendingRequestsCount ?? 0,
    pendingReportsCount: pendingReportsCount ?? 0,
    totalUsersCount: totalUsersCount ?? 0,
    totalRestaurantsCount: totalRestaurantsCount ?? 0,
  };
}


// (3) Dashboard Page Component (นี่คือหน้าหลัก)
export default async function DashboardPage() {
  
  // (3.1) เรียกใช้ฟังก์ชันดึงข้อมูล (Server Component จะรอตรงนี้)
  const stats = await getDashboardStats();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Dashboard</h1>
      
      {/* (3.2) กล่องแสดงผลข้อมูล (Stat Cards) */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
        
        {/* กล่อง "คำร้องใหม่" (สำคัญ) */}
        <Link href="/approvals" className="no-underline text-inherit">
          <div className="bg-white p-6 rounded-lg shadow-md text-gray-800 bg-amber-50 border border-amber-300 text-amber-900 transition-shadow hover:shadow-lg">
            <h3 className="text-base font-semibold text-gray-500 mb-2">คำร้องใหม่ (รออนุมัติ)</h3>
            <p className="text-4xl font-bold leading-none">{stats.pendingRequestsCount}</p>
            <p className="text-sm text-gray-500 mt-2">คลิกเพื่อจัดการ</p>
          </div>
        </Link>

        {/* กล่อง "รายงานใหม่" (สำคัญ) */}
        <Link href="/reports" className="no-underline text-inherit">
          <div className="bg-white p-6 rounded-lg shadow-md text-gray-800 bg-amber-50 border border-amber-300 text-amber-900 transition-shadow hover:shadow-lg">
            <h3 className="text-base font-semibold text-gray-500 mb-2">รายงานใหม่ (รอตรวจสอบ)</h3>
            <p className="text-4xl font-bold leading-none">{stats.pendingReportsCount}</p>
            <p className="text-sm text-gray-500 mt-2">คลิกเพื่อจัดการ</p>
          </div>
        </Link>

        {/* กล่องข้อมูลทั่วไป */}
        <div className="bg-white p-6 rounded-lg shadow-md text-gray-800">
          <h3 className="text-base font-semibold text-gray-500 mb-2">ผู้ใช้ทั้งหมด</h3>
          <p className="text-4xl font-bold leading-none">{stats.totalUsersCount}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-gray-800">
          <h3 className="text-base font-semibold text-gray-500 mb-2">ร้านค้าทั้งหมด (ที่อนุมัติแล้ว)</h3>
          <p className="text-4xl font-bold leading-none">{stats.totalRestaurantsCount}</p>
        </div>

      </div>
    </div>
  );
}

// ลบ const styles ที่ไม่ได้ใช้งานแล้ว