// app/login/page.tsx
"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
// (1) Import Client ตัวใหม่จาก @supabase/ssr
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";
// (6) Import Icon สำหรับการซ่อน/แสดงรหัสผ่าน
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

type Profile = Database["public"]["Tables"]["user_profiles"]["Row"];

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient(); // (2) ใช้งาน Client ตัวใหม่

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // (7) State สำหรับการมองเห็นรหัสผ่าน
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        throw new Error(
          authError.message === "Invalid login credentials"
            ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
            : authError.message
        );
      }

      if (authData.user) {
        // (3) ตรวจสอบสิทธิ์ Admin (เหมือนเดิม)
        const { data: profileData, error: profileError } = (await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", authData.user.id)
          .single()) as { data: Pick<Profile, "role"> | null; error: any };

        if (profileError) {
          await supabase.auth.signOut();
          throw new Error("ไม่สามารถดึงข้อมูลสิทธิ์ผู้ใช้ได้");
        }

        if (profileData?.role === "admin") {
          // ถ้าเป็น Admin -> ไปหน้า Dashboard
          // (เราต้อง refresh หน้าเพื่อให้ middleware ทำงานและตั้งค่า cookie ใหม่)
          router.push("/dashboard");
          router.refresh(); // <-- เพิ่มบรรทัดนี้
        } else {
          // ถ้าไม่ใช่ Admin
          await supabase.auth.signOut();
          throw new Error("คุณไม่มีสิทธิ์เข้าถึงส่วนนี้ (Admin only)");
        }
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดที่ไม่รู้จัก");
    } finally {
      setLoading(false);
    }
  };

  // (8) ฟังก์ชันสำหรับ Google Sign-in
  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      // เรียกใช้ signInWithOAuth ของ Supabase
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Redirect ไปที่ /dashboard หลัง Login สำเร็จ
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (authError) throw authError;

      // Supabase จะจัดการ Redirect โดยอัตโนมัติ
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการล็อคอินด้วย Google");
      setLoading(false);
    }
  };

  return (
    // div นอกสุด (คงเดิม)
    <div className="flex justify-center items-center min-h-screen ">
      {/* แก้ไข: เปลี่ยน bg-white เป็น bg-white/80 และเพิ่ม backdrop-blur-lg */}
      <form
        onSubmit={handleLogin}
        className="p-8 bg-black/80 rounded-lg shadow-xl flex flex-col w-full max-w-md"
      >
        <Image
          src="/assets/images/logoApp.png"
          width={500}
          height={300}
          alt="my photo"
        />
        <h2 className="text-center text-white ">Admin Dashboard Login</h2>

        <div className="mb-4 flex flex-col">
          <label htmlFor="email" className="mb-2 font-semibold text-white ">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4 flex flex-col">
          <label htmlFor="password" className="mb-2 font-semibold text-white ">
            Password
          </label>

          {/* (9) กล่องสำหรับ Input รหัสผ่าน + Toggle Icon */}
          <div className="relative">
            <input
              id="password"
              // (10) ใช้ State เพื่อสลับ Type
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" // เพิ่ม padding ขวา
            />
            {/* (11) ปุ่ม Toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 focus:outline-none hover:text-gray-700"
            >
              {showPassword ? (
                <IoEyeOffOutline size={20} />
              ) : (
                <IoEyeOutline size={20} />
              )}
            </button>
          </div>
        </div>

        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="p-3 border-none rounded bg-blue-600 text-white text-base cursor-pointer hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "กำลังโหลด..." : "Login"}
        </button>

        {/* (12) ปุ่ม Login ด้วย Google */}
        <div className="mt-4 border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded bg-white text-gray-700 text-base cursor-pointer hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-3"
          >
            <img
              src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png"
              alt="Google"
              className="w-5 h-5"
            />
            {loading ? "กำลังโหลด..." : "เข้าสู่ระบบด้วย Google"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ลบ const styles ที่ไม่ได้ใช้งานแล้ว
