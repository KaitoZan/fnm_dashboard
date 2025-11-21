'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// (ฟังก์ชัน checkAdminRole - เหมือนเดิม)
async function checkAdminRole() {
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
}

// (1) === แก้ไข: Server Action: ลบผู้ใช้ (สลับลำดับ) ===
export async function deleteUser(userId: string) {
  try {
    await checkAdminRole(); // ตรวจสอบสิทธิ์ก่อน

    // 1. ลบข้อมูลออกจากตาราง user_profiles ก่อน
    // การทำขั้นตอนนี้ก่อนจะช่วยให้การลบเป็นไปตามที่ Admin ต้องการและหลีกเลี่ยง Conflict
    const { error: profileError } = await supabaseAdmin
        .from("user_profiles")
        .delete()
        .eq("id", userId); //
        
    if (profileError) {
       console.error("Error deleting user_profiles:", profileError);
       throw new Error(`ไม่สามารถลบข้อมูลผู้ใช้จากตารางได้: ${profileError.message}`);
    }

    // 2. ลบ User ออกจากระบบ Auth (auth.users)
    // การลบขั้นตอนนี้จะไม่มีปัญหา Foreign Key/Trigger แล้ว
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) throw authError;
    
    // 3. สั่ง revalidate และคืนค่าสำเร็จ
    revalidatePath("/users"); 
    return { success: true };
    
  } catch (err: any) {
    return { error: err.message || "เกิดข้อผิดพลาดในการลบผู้ใช้" };
  }
}
// (ฟังก์ชัน updateUserRole - เหมือนเดิม)
export async function updateUserRole(userId: string, newRole: string) {
  try {
    await checkAdminRole(); 

    const { error } = await supabaseAdmin
      .from("user_profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) throw error;

    revalidatePath("/users"); 
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}