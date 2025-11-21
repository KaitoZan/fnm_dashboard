// app/(admin)/approvals/actions.ts
'use server'

import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/supabase'

// (1) สร้าง Admin Client ที่ใช้ Service Role Key
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! //
)

// (2) ฟังก์ชันตรวจสอบสิทธิ์ Admin
async function getAdminUserId() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("ไม่พบผู้ใช้");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error("คุณไม่มีสิทธิ์ดำเนินการนี้");
  }
  return user.id;
}

// (3) Server Action: อนุมัติ
export async function approveRequest(requestEditId: number) {
  try {
    const adminUserId = await getAdminUserId(); // ตรวจสอบสิทธิ์และเอา ID

    //
    const { error } = await supabaseAdmin.rpc("approve_restaurant_request", {
      p_admin_user_id: adminUserId,
      p_request_edit_id: requestEditId,
    });
    
    if (error) throw error;

    revalidatePath("/approvals"); // สั่งโหลดหน้า list ใหม่
    revalidatePath("/dashboard"); // สั่งโหลดหน้า dashboard ใหม่
    return { success: true };

  } catch (err: any) {
    return { error: err.message };
  }
}

// (4) Server Action: ปฏิเสธ
export async function rejectRequest(requestEditId: number, reason: string) {
  try {
    const adminUserId = await getAdminUserId(); // ตรวจสอบสิทธิ์และเอา ID

    //
    const { error } = await supabaseAdmin.rpc("reject_restaurant_request", {
      p_admin_user_id: adminUserId,
      p_request_edit_id: requestEditId,
      p_rejection_reason: reason,
    });
    
    if (error) throw error;

    revalidatePath("/approvals"); // สั่งโหลดหน้า list ใหม่
    revalidatePath("/dashboard"); // สั่งโหลดหน้า dashboard ใหม่
    return { success: true };

  } catch (err: any) {
    return { error: err.message };
  }
}