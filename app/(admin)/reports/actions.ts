// app/(admin)/reports/actions.ts
'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
  return user.id;
}

async function sendNotification(userId: string, title: string, message: string) {
  const { error } = await supabaseAdmin.from("notifications").insert({
    user_id: userId,
    title: title,
    message: message,
  });
  if (error) {
    console.error(`Failed to send notification to ${userId}: ${error.message}`);
  }
}

// (ฟังก์ชัน dismissReport - เหมือนเดิม)
export async function dismissReport(
  reportId: number, 
  complainantId: string, 
  messageToComplainant: string
) {
  try {
    await checkAdminRole();
    const { error: updateError } = await supabaseAdmin
      .from("complaints")
      .update({ status: 'resolved' })
      .eq("id", reportId);
    if (updateError) throw updateError;

    await sendNotification(
      complainantId, 
      "ผลการตรวจสอบรายงานของคุณ", 
      messageToComplainant
    );

    revalidatePath("/reports");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// (ฟังก์ชัน actionComment - เหมือนเดิม)
export async function actionComment(
  reportId: number, 
  commentId: number, 
  complainantId: string,
  messageToComplainant: string
) {
  try {
    await checkAdminRole();
    const { error: deleteError } = await supabaseAdmin
      .from("comments")
      .delete()
      .eq("id", commentId);
    if (deleteError) throw deleteError;

    const { error: updateError } = await supabaseAdmin
      .from("complaints")
      .update({ status: 'resolved' })
      .eq("id", reportId);
    if (updateError) throw updateError;
    
    await sendNotification(
      complainantId,
      "ผลการตรวจสอบรายงานของคุณ",
      messageToComplainant
    );

    revalidatePath("/reports");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// (1) === แก้ไขฟังก์ชันนี้ ===
export async function actionRestaurant(
  reportId: number,
  restaurantId: string,
  ownerId: string | null, // (1.1) รับ "null" ได้
  complainantId: string,
  warningToOwner: string | null, // (1.2) รับ "null" ได้
  messageToComplainant: string
) {
  try {
    await checkAdminRole();

    // 1. ระงับร้านค้า (เหมือนเดิม)
    const { error: resError } = await supabaseAdmin
      .from("restaurants")
      .update({ status: 'suspended' }) 
      .eq("id", restaurantId);
    if (resError) throw resError;

    // 2. ปิดเรื่อง (เหมือนเดิม)
    const { error: updateError } = await supabaseAdmin
      .from("complaints")
      .update({ status: 'resolved' })
      .eq("id", reportId);
    if (updateError) throw updateError;
    
    // (1.3) === เพิ่ม: ตรวจสอบก่อนส่ง ===
    // 3. ส่ง Notification ตักเตือน "เจ้าของร้าน" (ถ้ามี)
    if (ownerId && warningToOwner) {
      await sendNotification(
        ownerId,
        "ร้านค้าของคุณถูกระงับชั่วคราว",
        warningToOwner
      );
    }
    
    // 4. ส่ง Notification แจ้งผลให้ "ผู้ร้องเรียน" (เหมือนเดิม)
    await sendNotification(
      complainantId,
      "ผลการตรวจสอบรายงานของคุณ",
      messageToComplainant
    );

    revalidatePath("/reports");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}