import { sellerProfileMock } from "@/lib/mock/locations";
import { delay } from "@/services/mock";
import type { User } from "@/types/auth";

export const authService = {
  async sendOtp(mobile: string) {
    await delay(true, 400);
    return { sent: true, mobile, demoOtp: "123456" };
  },
  async verifyOtp(mobile: string, otp: string) {
    await delay(null, 500);
    const valid = otp === "123456" || /^\d{6}$/.test(otp);
    if (!valid) return { ok: false as const, message: "Invalid OTP" };
    const user: User = {
      id: "usr-seller-001",
      email: sellerProfileMock.email,
      name: sellerProfileMock.contactPerson,
      role: "SELLER",
      company: sellerProfileMock.companyName,
      sellerId: sellerProfileMock.id,
    };
    return { ok: true as const, user, mobile };
  },
};
