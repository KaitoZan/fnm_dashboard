// app/(admin)/restaurants/[id]/edit/EditRestaurantForm.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
// (1) FIX: Import Server Actions ตัวใหม่
import { updateRestaurant, unSuspendRestaurant } from '../../actions' 
import type { Database } from '@/types/supabase'
import { File } from 'buffer' 

// (Type definitions - เหมือนเดิม)
type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];
type MenuItem = Database["public"]["Tables"]["menus"]["Row"];
type MenuInput = { name: string; price: number };

// เปลี่ยนชื่อ Interface
interface ViewDetailProps {
  restaurant: Restaurant;
  initialMenus: MenuItem[];
}

// (Type สำหรับ Helper Components)
interface InputProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; 
  type?: string;
  required?: boolean;
}
interface TextareaProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; 
  required?: boolean;
}
interface CheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}


// เปลี่ยนชื่อ Component
export default function ViewRestaurantDetail({ restaurant, initialMenus }: ViewDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // (2) สร้าง State สำหรับทุกช่องของฟอร์ม
  const [formData, setFormData] = useState({
    res_name: restaurant.res_name,
    description: restaurant.description,
    detail: restaurant.detail || '',
    phone_no: restaurant.phone_no || '',
    location: restaurant.location || '',
    food_type: restaurant.food_type || '',
    has_delivery: restaurant.has_delivery,
    has_dine_in: restaurant.has_dine_in,
  });

  // (3) สร้าง State สำหรับเมนู
  const [menus, setMenus] = useState<MenuInput[]>(
    initialMenus.map(m => ({
      name: m.name || '',
      price: m.price || 0
    }))
  );

  // (4) ฟังก์ชันจัดการการเปลี่ยนแปลง Input (ถูกคงไว้แต่จะไม่ถูกเรียกใช้จริงใน View-Only Mode)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // (5) ฟังก์ชันจัดการ "เมนู" (ถูกคงไว้แต่จะไม่ถูกเรียกใช้จริงใน View-Only Mode)
  const handleMenuChange = (index: number, field: 'name' | 'price', value: string) => {
    const newMenus = [...menus];
    if (field === 'price') {
      newMenus[index][field] = parseFloat(value) || 0;
    } else {
      newMenus[index][field] = value;
    }
    setMenus(newMenus);
  };

  const addMenuItem = () => {
    setMenus([...menus, { name: '', price: 0 }]);
  };

  const removeMenuItem = (index: number) => {
    setMenus(menus.filter((_, i) => i !== index));
  };
  
  // (6) === Logic ปลดระงับ === (คงไว้)
  const handleUnSuspend = async () => {
      if (!window.confirm(`ยืนยันการปลดสถานะระงับ (Suspend) ของร้าน ${restaurant.res_name} และเปลี่ยนสถานะกลับเป็น 'approved'?`)) {
          return;
      }
      
      startTransition(async () => {
          const result = await unSuspendRestaurant(restaurant.id);
          if (result.error) {
              setError(result.error);
              alert("เกิดข้อผิดพลาดในการปลดระงับ: " + result.error);
          } else {
              alert("ร้านค้าถูกปลดระงับและอนุมัติกลับมาแสดงผลเรียบร้อยแล้ว");
              // นำทางกลับหน้า List
              router.push('/restaurants');
          }
      });
  };
  
  // (7) ฟังก์ชัน Submit (ถูกคงไว้แต่จะไม่ถูกเรียกใช้ เพราะปุ่มถูกลบ/ปิด)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    // Logic การ submit ถูกปิดไว้
  };

  const isSuspended = restaurant.status === 'suspended'; // (8) ตรวจสอบสถานะ

  // (9) JSX สำหรับฟอร์มทั้งหมด
  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      {/* Basic Info - ใส่ readOnly ใน Input Helper */}
      <Input name="res_name" label="ชื่อร้าน" value={formData.res_name} onChange={handleChange} required />
      <Textarea name="description" label="คำอธิบาย (หน้าแรก)" value={formData.description} onChange={handleChange} required />
      <Textarea name="detail" label="รายละเอียดร้าน (ข้อมูลภายใน)" value={formData.detail} onChange={handleChange} />
      <Input name="phone_no" label="เบอร์โทรศัพท์" value={formData.phone_no} onChange={handleChange} />
      <Input name="location" label="ที่ตั้ง (ข้อความ)" value={formData.location} onChange={handleChange} />
      <Input name="food_type" label="ประเภทอาหาร (เช่น 'อาหารตามสั่ง, ก๋วยเตี๋ยว')" value={formData.food_type} onChange={handleChange} />

      {/* Checkboxes - ใส่ disabled ใน Checkbox Helper */}
      <div className="flex gap-4 mb-4">
        <Checkbox name="has_delivery" label="มี Delivery" checked={formData.has_delivery} onChange={handleChange} />
        <Checkbox name="has_dine_in" label="ทานที่ร้านได้" checked={formData.has_dine_in} onChange={handleChange} />
      </div>

      {/* Menu Editor - ลบปุ่มเพิ่มเมนู และใส่ readOnly ใน Input Helper */}
      <h3 className="text-xl font-bold mt-6 mb-4 border-t border-gray-200 pt-4">จัดการเมนู</h3>
      <div className="flex flex-col gap-4">
        {menus.map((menu, index) => (
          <div key={index} className="flex gap-4 items-end">
            {/* Input fields in view-only mode */}
            <Input 
              name={`menu_name_${index}`}
              label={`ชื่อเมนู ${index + 1}`}
              value={menu.name}
              onChange={(e: any) => handleMenuChange(index, 'name', e.target.value)}
            />
            <Input 
              name={`menu_price_${index}`}
              label="ราคา"
              type="number"
              value={String(menu.price)}
              onChange={(e: any) => handleMenuChange(index, 'price', e.target.value)}
            />
          </div>
        ))}
        {/* ลบปุ่ม + เพิ่มเมนู */}
      </div>

      {/* (10) === ปุ่ม Submit หลัก ถูกลบออก === */}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      
      {/* (11) === ปุ่มปลดระงับ (แสดงเฉพาะเมื่อร้านถูกระงับ - คงไว้) === */}
      {isSuspended && (
          <button 
              type="button" 
              onClick={handleUnSuspend} 
              disabled={isPending} 
              className="py-3 px-6 border-none rounded-md bg-blue-600 text-white text-base cursor-pointer mt-6 w-full hover:bg-blue-700 disabled:opacity-50 transition-colors bg-emerald-500 mt-2 hover:bg-emerald-600"
          >
              {isPending ? 'กำลังดำเนินการ...' : 'ปลดระงับและอนุมัติร้านค้า'}
          </button>
      )}
    </form>
  );
}

// (12) Helper Components for the form (ปรับให้เป็น View-Only)
function Input({ label, name, value, onChange, type = 'text', required = false }: InputProps) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block mb-2 font-semibold">{label}{required && '*'}</label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        readOnly={true} 
        className="w-full p-3 border border-gray-400 rounded text-base text-gray-800 box-border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-default"
      />
    </div>
  );
}

function Textarea({ label, name, value, onChange, required = false }: TextareaProps) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block mb-2 font-semibold">{label}{required && '*'}</label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange as any} 
        required={required}
        readOnly={true} 
        className="w-full p-3 border border-gray-400 rounded text-base text-gray-800 box-border focus:outline-none focus:ring-2 focus:ring-blue-500 h-[100px] bg-gray-100 cursor-default"
      />
    </div>
  );
}

function Checkbox({ label, name, checked, onChange }: CheckboxProps) {
  return (
    <label className="flex items-center cursor-pointer">
      <input
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={true} 
        className="mr-2 cursor-default"
      />
      {label}
    </label>
  );
}

// ลบ const styles ที่ไม่ได้ใช้งานแล้ว