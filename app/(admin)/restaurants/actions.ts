// app/(admin)/restaurants/actions.ts
'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

// (1) สร้าง Admin Client ที่ใช้ Service Role Key
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// (2) ฟังก์ชันตรวจสอบสิทธิ์ Admin
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

// (3) Server Action: ลบร้านค้า (Delete)
export async function deleteRestaurant(restaurantId: string) {
  try {
    await checkAdminRole();

    const { error } = await supabaseAdmin
      .from("restaurants")
      .delete()
      .eq("id", restaurantId);

    if (error) throw error;

    revalidatePath("/restaurants");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// (4) Server Action: อัปเดตข้อมูลร้านค้า (Update)
export async function updateRestaurant(
  restaurantId: string,
  formData: {
    res_name: string;
    description: string;
    detail: string | null;
    phone_no: string | null;
    location: string | null;
    food_type: string | null;
    has_delivery: boolean;
    has_dine_in: boolean;
  },
  menus: { name: string; price: number }[]
) {
  try {
    await checkAdminRole();

    // 4.1. อัปเดตข้อมูลหลักในตาราง 'restaurants'
    const { error: resError } = await supabaseAdmin
      .from("restaurants")
      .update({
        res_name: formData.res_name,
        description: formData.description,
        detail: formData.detail,
        phone_no: formData.phone_no,
        location: formData.location,
        food_type: formData.food_type,
        has_delivery: formData.has_delivery,
        has_dine_in: formData.has_dine_in,
      })
      .eq("id", restaurantId);

    if (resError) throw new Error(`Error updating restaurant: ${resError.message}`);

    // 4.2. อัปเดตข้อมูล 'menus' (ลบของเก่า, ใส่ของใหม่)
    const { error: deleteMenuError } = await supabaseAdmin
      .from("menus")
      .delete()
      .eq("res_id", restaurantId);

    if (deleteMenuError) throw new Error(`Error deleting old menus: ${deleteMenuError.message}`);

    if (menus.length > 0) {
      const newMenusData = menus.map(menu => ({
        res_id: restaurantId,
        name: menu.name,
        price: menu.price,
      }));
      const { error: insertMenuError } = await supabaseAdmin
        .from("menus")
        .insert(newMenusData);

      if (insertMenuError) throw new Error(`Error inserting new menus: ${insertMenuError.message}`);
    }

    revalidatePath("/restaurants"); 
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// (5) === Server Action ใหม่: ปลดระงับร้านค้า (Un-Suspend) ===
export async function unSuspendRestaurant(restaurantId: string) {
  try {
    await checkAdminRole();

    // 5.1. อัปเดตสถานะร้านค้าหลักเป็น 'approved'
    const { error } = await supabaseAdmin
      .from("restaurants")
      .update({ status: 'approved' })
      .eq("id", restaurantId);

    if (error) throw error;

    // 5.2. ลบคำร้องขออนุมัติซ้ำ (ถ้ามี)
    // ลบคำร้องที่เกี่ยวข้องออกด้วยเพื่อความสะอาดของระบบ
    await supabaseAdmin
      .from("restaurant_edits")
      .delete()
      .eq("res_id", restaurantId)
      .eq("edit_type", 'reapproval_from_suspended');


    // 5.3. สั่ง Revalidate หน้า List และหน้า Dashboard
    revalidatePath("/restaurants");
    revalidatePath("/dashboard");
    revalidatePath(`/restaurants/${restaurantId}/edit`);

    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}