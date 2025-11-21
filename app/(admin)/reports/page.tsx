// app/(admin)/reports/page.tsx
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";
import ReportActions from "./ReportActions"; 

export type ReportWithDetails = Database["public"]["Tables"]["complaints"]["Row"] & {
  user_profiles: Pick<Database["public"]["Tables"]["user_profiles"]["Row"], "user_name"> | null;
  restaurants: Pick<Database["public"]["Tables"]["restaurants"]["Row"], "res_name" | "owner_id"> | null; 
  comments: Pick<Database["public"]["Tables"]["comments"]["Row"], "content"> | null;
};

async function getPendingReports() {
  const supabase = createClient(); 
  
  // (Query นี้ถูกต้องแล้วจาก Task 19)
  const { data, error } = await supabase
    .from("complaints")
    .select(`
      *, 
      user_profiles!complaints_reporter_id_fkey ( user_name ), 
      restaurants!complaints_res_id_fkey ( res_name, owner_id ), 
      comments!complaints_comment_id_fkey ( content )
    `) 
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching pending reports:", error.message);
    return [];
  }
  return data as ReportWithDetails[];
}

// (Component หลัก - เหมือนเดิม)
export default async function ReportsPage() {
  const reports = await getPendingReports();

  const getReportTarget = (report: ReportWithDetails) => {
    if (report.comment_id && report.comments) {
      return (
        <p>
          <strong>รายงานคอมเมนต์:</strong> 
          <em className="italic text-gray-600 bg-gray-100 py-1 px-2 rounded ml-2">"{report.comments.content}"</em>
        </p>
      );
    }
    if (report.res_id && report.restaurants) { 
      return (
        <p>
          <strong>รายงานร้านค้า:</strong> 
          <em className="italic text-gray-600 bg-gray-100 py-1 px-2 rounded ml-2">{report.restaurants.res_name}</em>
        </p>
      );
    }
    return <p><strong>รายงาน:</strong> (ไม่พบข้อมูลร้านค้าหรือคอมเมนต์)</p>;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">จัดการรายงาน (Reports)</h1>

      {reports.length === 0 ? (
        <p>ไม่มีรายงานรอการตรวจสอบในขณะนี้</p>
      ) : (
        <div className="flex flex-col gap-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
              <div>
                {getReportTarget(report)}
                <p>
                  <strong>เหตุผล:</strong> {report.reason}
                </p>
                <p>
                  <strong>ผู้รายงาน:</strong> {report.user_profiles?.user_name || "N/A"}
                </p>
                <p>
                  <strong>วันที่ส่ง:</strong> {new Date(report.created_at).toLocaleString()}
                </p>
              </div>
              <ReportActions report={report} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ลบ const styles ที่ไม่ได้ใช้งานแล้ว