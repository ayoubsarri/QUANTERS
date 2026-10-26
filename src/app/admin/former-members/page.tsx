"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminFormerMembersRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/members?tab=former");
  }, [router]);

  return null;
}
