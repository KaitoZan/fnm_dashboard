// app/(admin)/approvals/page.tsx
import { createClient } from '@supabase/supabase-js'; 
import type { Database } from "@/types/supabase";
import ApprovalCard from "./ApprovalCard"; // (1) Import Card ใหม่

export type EditRequestWithProfile = Database["public"]["Tables"]["restaurant_edits"]["Row"] & {
  user_profiles: Pick<Database["public"]["Tables"]["user_profiles"]["Row"], "user_name" | "avatar_url"> | null;
};

// ====================== FIXED FUNCTION ======================
async function getPendingRequests() {
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );

  const { data, error } = await supabaseAdmin 
    .from("restaurant_edits")
    .select(`
      *,
      user_profiles:user_profiles!restaurant_edits_user_id_fkey ( user_name, avatar_url )
    `)
    .eq("status", "pending") 
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching pending requests (Admin):", error);
    return [];
  }

  return data as EditRequestWithProfile[];
}

// ====================== PAGE COMPONENT ======================
export default async function ApprovalsPage() {
  const requests = await getPendingRequests();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">จัดการคำร้อง (Approvals)</h1>

      {requests.length === 0 ? (
        <p>ไม่มีคำร้องรอการอนุมัติในขณะนี้</p>
      ) : (
        <div className="flex flex-col gap-4">
          {/* (2) วน Loop แสดง ApprovalCard แทน ApprovalActions */}
          {requests.map((request) => (
            <ApprovalCard key={request.id} request={request} /> 
          ))}
        </div>
      )}
    </div>
  );
}

// ลบ const styles ที่ไม่ได้ใช้งานแล้ว