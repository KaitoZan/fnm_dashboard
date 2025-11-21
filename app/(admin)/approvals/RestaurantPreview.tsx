// app/(admin)/approvals/RestaurantPreview.tsx
'use client'

import React, { useState } from 'react'
import { 
  StarRating, 
  StatusTag,
  IoBookmarkOutline, // (1) ไอคอนที่ถูกต้อง
  IoFlagOutline      // (1) ไอคอนที่ถูกต้อง
} from './PreviewComponents'
import { MdMenuBook } from "react-icons/md";

// (2) อัปเกรด Type ให้มี is_open
type ProposedData = {
  res_name: string;
  description: string;
  detail: string | null;
  phone_no: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  food_type: string | null;
  res_img: string | null;
  gallery_imgs_urls: string[] | null;
  promo_imgs_urls: string[] | null;
  menus: { name: string, price: number }[] | null;
  has_delivery: boolean;
  has_dine_in: boolean;
  is_open: boolean; // (2.1) เพิ่ม is_open
  // เพิ่ม opening_hours และ rating เพื่อให้โค้ดส่วน PreviewDescription ไม่ Error
  opening_hours?: string | null;
  rating?: number | null; 
};

// --- (3) สร้าง Component จำลอง ตามไฟล์ Flutter ---

// (3.1) === แก้ไข: จำลอง detail_appbar.dart ===
//
const PreviewAppBar = () => (
  // ปรับความสูงจาก h-20 (80px) -> h-[64px] (80 * 0.8)
  // ปรับ pt-[30px] -> pt-[24px] (30 * 0.8)
  <div 
    className="h-[64px] bg-gradient-to-r from-pink-400 to-blue-300 flex items-center justify-between p-4 pt-[24px] flex-shrink-0"
  >
    {/* (3.2) ใช้ backIcon.png ที่เราย้ายไป /public */}
    <img 
      src="/backIcon.png" 
      alt="Back" 
      className="w-10 h-10 text-white"
    />
    
    {/* (3.3) ใช้ logoApp.png ที่เราย้ายไป /public */}
    <img 
      src="/logoApp.png" 
      alt="Logo" 
      className="h-[50px] object-contain" 
      onError={(e) => (e.currentTarget.style.display = 'none')} 
    />
  </div>
);

// (3.4) จำลอง detail_head_image.dart (เหมือนเดิม)
const PreviewHeadImage = ({ imageUrl }: { imageUrl: string | null }) => (
  // ปรับความสูงจาก h-[250px] -> h-[200px] (250 * 0.8)
  // ปรับขอบโค้งจาก rounded-t-[28px] -> rounded-t-[22px] (28 * 0.8)
  <div className="h-[200px] bg-gray-200 rounded-t-[22px] overflow-hidden flex-shrink-0">
    {imageUrl ? (
      <img src={imageUrl} alt="Cover" className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        <span>(ไม่มีรูปปก)</span>
      </div>
    )}
  </div>
);

// (3.5) === แก้ไข: จำลอง detail_head_banner_text.dart ===
//
const PreviewHeadBannerText = ({ name }: { name: string }) => (
  // ปรับความสูงจาก h-14 (56px) -> h-[45px] (56 * 0.8)
  <div 
    className="h-[45px] bg-pink-50 flex items-center justify-between px-3 border-y-2 border-dashed border-pink-100 flex-shrink-0"
  >
    <IoBookmarkOutline size={28} className="text-gray-600" /> {/* (3.6) ไอคอน Bookmark */}
    <span 
      className="font-poppins text-base font-bold text-gray-800 text-center overflow-hidden text-ellipsis whitespace-nowrap px-2"
    >
      {name}
    </span>
    <IoFlagOutline size={28} className="text-red-600" /> {/* (3.7) ไอคอน Flag */}
  </div>
);


// ... PreviewDescription (ไม่มีการเปลี่ยนแปลง) ...
const PreviewDescription = ({ data }: { data: ProposedData }) => (
  <div className="flex flex-col gap-2">
    <p className="text-sm text-gray-700">
      {data.detail || data.description || '(ไม่มีรายละเอียด)'}
    </p>
    
    {data.opening_hours && <p className="text-[15px] font-bold">เวลาเปิดร้าน: {data.opening_hours.toString()}</p>}
    {data.phone_no && <p className="text-sm text-gray-700">เบอร์โทร: {data.phone_no}</p>}
    {data.location && <p className="text-sm text-gray-700">พิกัดที่ตั้ง: {data.location}</p>}
    
    <StatusTag 
      isOpen={data.is_open ?? true} 
      hasDelivery={data.has_delivery} 
      hasDineIn={data.has_dine_in} 
      showOpenStatus={true} 
      iconSize={20} 
      fontSize={14}
    />

    <div className="flex items-center gap-[10px] mt-2">
      <StarRating rating={data.rating || 0} size={20} /> 
      {data.food_type && (
        <span className="text-sm font-bold text-pink-700">
          ประเภท: {data.food_type}
        </span>
      )}
    </div>
  </div>
);


// (3.11) === แก้ไข: จำลอง detail_menu_image.dart ===
//
const PreviewMenuImage = ({ 
  gallery, 
  menus, 
  onMenuClick 
}: { 
  gallery: string[] | null, 
  menus: { name: string, price: number }[] | null,
  onMenuClick: () => void
}) => (
  <div className="mt-5">
    <h3 className="font-poppins font-bold text-lg text-gray-800 mb-[10px]">แกลเลอรี / เมนู:</h3>
    <div className="relative">
      {/* ปรับความสูงจาก h-[400px] -> h-[320px] (400 * 0.8) */}
      <div className="flex overflow-x-auto gap-[10px] pt-1 pb-[10px] h-[320px]">
        {gallery && gallery.length > 0 ? (
          gallery.map((url, i) => (
            // ปรับความกว้างจาก w-[200px] -> w-[160px] (200 * 0.8)
            <img key={i} src={url} className="w-[160px] h-full object-cover rounded-[10px] flex-shrink-0 border border-gray-200" /> 
          ))
        ) : (
          <div className="w-[200px] h-full object-cover rounded-[10px] flex-shrink-0 border border-gray-200 w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 rounded-[10px]">
            (ไม่มีรูปแกลเลอรี)
          </div>
        )}
      </div>
      {menus && menus.length > 0 && (
        <button onClick={onMenuClick} className="absolute top-2 right-[18px] bg-black/50 border-none rounded-full w-12 h-12 flex items-center justify-center cursor-pointer z-10">
          <MdMenuBook size={28} color="white" />
        </button>
      )}
    </div>
  </div>
);

// (3.13) === แก้ไข: จำลอง detail_promotion.dart ===
//
const PreviewPromotion = ({ promotion }: { promotion: string[] | null }) => (
  <div className="mt-5">
    <h3 className="font-poppins font-bold text-lg text-gray-800 mb-[10px]">โปรโมชั่น:</h3>
    {(!promotion || promotion.length === 0) ? (
      <p className="font-kanit italic text-gray-500">(ไม่มีโปรโมชั่นในขณะนี้)</p>
    ) : (
      promotion[0].startsWith('http') ? (
        // ปรับความสูงจาก h-[120px] -> h-[96px] (120 * 0.8)
        <div className="flex overflow-x-auto gap-[10px] pt-1 pb-[10px] h-[96px]">
          {promotion.map((url, i) => (
            // ปรับความกว้างจาก w-[300px] -> w-[240px] (300 * 0.8)
            <img key={i} src={url} className="w-[240px] h-full object-cover rounded-lg flex-shrink-0 border border-gray-200" />
          ))}
        </div>
      ) : (
        <div className="bg-pink-50 p-3 px-4 rounded-[10px] border-[1.5px] border-pink-100">
          {promotion.map((text, i) => (
            <p key={i} className="font-kanit text-sm text-gray-800">• {text}</p>
          ))}
        </div>
      )
    )}
  </div>
);


// ... PreviewReview (ไม่มีการเปลี่ยนแปลง) ...
const PreviewReview = () => (
  <div className="mt-[30px]">
    <div className="h-0.5 bg-[linear-gradient(to_right,#dbeafe_50%,transparent_50%)] bg-[length:12px_100%] bg-repeat-x" />
    <h3 className="font-poppins font-bold text-lg text-gray-800 mb-[10px] text-pink-700 my-[15px]">รีวิวจากลูกค้า</h3>
    <div className="h-0.5 bg-[linear-gradient(to_right,#dbeafe_50%,transparent_50%)] bg-[length:12px_100%] bg-repeat-x" />

    {/* กล่องแสดงรีวิว (จำลอง "ยังไม่มีรีวิว") */}
    <div className="bg-pink-50 rounded-lg min-h-[100px] flex items-center justify-center mt-5">
      <div className="flex items-center justify-center bg-gray-100 text-gray-500 rounded-[10px] w-full h-full">
        <p className="font-kanit italic text-gray-500 py-5">
          (ยังไม่มีรีวิวสำหรับร้านนี้)
        </p>
      </div>
    </div>
    
    {/* (3.16) กล่องเขียนรีวิว (จำลอง 100%) */}
    <h3 className="font-poppins font-bold text-lg text-gray-800 mb-[10px] text-pink-700 mt-[30px]">
      เขียนรีวิวของคุณ
    </h3>
    <div className="flex items-center gap-2 mt-[15px]">
      <span className="text-base">ให้คะแนน: </span>
      <StarRating rating={0} size={24} />
    </div>
    <textarea 
      placeholder="เขียนความคิดเห็นของคุณที่นี่..." 
      disabled 
      className="w-full h-[100px] p-[15px] rounded-[10px] border border-gray-300 mt-[15px] font-kanit text-sm box-border resize-none bg-gray-50"
    />
    <button disabled className="block mt-5 mx-auto px-10 py-[15px] rounded-[30px] border-none bg-pink-500 text-white font-poppins text-lg font-bold opacity-60">
      ส่งรีวิว
    </button>
  </div>
);


// (3.17) จำลอง Menu Popup (ไม่มีการเปลี่ยนแปลง) ...
const MenuPopup = ({ menus, onClose }: { menus: { name: string, price: number }[], onClose: () => void }) => (
  <div className="absolute inset-0 w-full h-full bg-black/50 flex justify-center items-center z-[2000]" onClick={onClose}>
    <div className="bg-white rounded-[15px] p-5 w-[90%] max-h-[70%] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
      <h3 className="font-poppins font-bold text-lg text-gray-800 mb-[10px]">รายการเมนู</h3>
      <ul className="pl-5 m-0">
        {menus.map((menu, i) => (
          <li key={i} className="flex justify-between mb-2">
            <span>{menu.name}</span>
            <span className="font-bold text-green-700">
              {menu.price > 0 ? `${menu.price} ฿` : "N/A"}
            </span>
          </li>
        ))}
      </ul>
      <button onClick={onClose} className="mt-5 w-full p-2.5 border-none rounded-lg bg-gray-200 text-gray-800 font-bold cursor-pointer">ปิด</button>
    </div>
  </div>
);


// --- (4) Component หลัก: RestaurantPreview (ปรับปรุงใหม่) ---
export default function RestaurantPreview({ data }: { data: ProposedData }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ปรับขอบโค้งของกรอบโทรศัพท์ด้านใน (32 * 0.8)
  const phoneScreenRoundedClass = "rounded-[26px]"; 

  return (
    <div className="-m-6"> 
    
      {/* แก้ไข: 375x750 -> 300x600 (80%) */}
      {/* ปรับ: border-[12px] -> border-[10px] (12 * 0.8 = 9.6) */}
      {/* ปรับ: rounded-[40px] -> rounded-[32px] (40 * 0.8) */}
      {/* ปรับ: p-1 (4px) -> p-[3px] */}
      <div className="w-[300px] h-[600px] my-4 mx-auto border-[10px] border-gray-800 rounded-[32px] shadow-xl bg-gray-800 p-[3px] box-border">
        {/* ใช้ตัวแปร rounded class ที่คำนวณไว้ */}
        <div className={`w-full h-full bg-white overflow-hidden flex flex-col relative overflow-y-auto ${phoneScreenRoundedClass}`}>
          
          <PreviewAppBar />
          
          <div className="overflow-y-auto flex-1 bg-white">
            {/* ปรับขอบโค้งจาก rounded-t-[30px] -> rounded-t-[24px] */}
            <div className="rounded-t-[24px] overflow-hidden bg-white -mt-[30px] relative z-10">
              <PreviewHeadImage imageUrl={data.res_img} />
              <PreviewHeadBannerText name={data.res_name} />
              
              <div className="p-5">
                <PreviewDescription data={data} />
                <PreviewMenuImage 
                  gallery={data.gallery_imgs_urls}
                  menus={data.menus}
                  onMenuClick={() => setIsMenuOpen(true)}
                />
                <PreviewPromotion promotion={data.promo_imgs_urls} />
                <PreviewReview />
              </div>
            </div>
          </div>
          
          {isMenuOpen && (
            <MenuPopup menus={data.menus || []} onClose={() => setIsMenuOpen(false)} />
          )}

        </div>
      </div>
    </div>
  );
}