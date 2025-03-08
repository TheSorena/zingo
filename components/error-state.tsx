"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "./ui/button";

export function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h3 className="text-xl font-semibold mb-2">خطا در دریافت اطلاعات</h3>
      <p className="text-muted-foreground mb-6">
        متاسفانه در دریافت اطلاعات فیلم‌ها مشکلی پیش آمده است. لطفاً دوباره تلاش کنید.
      </p>
      <Button
        onClick={() => window.location.reload()}
        className="px-4 py-2"
      >
        تلاش مجدد
      </Button>
    </div>
  );
} 