"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminFormerMembersRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/members");
  }, [router]);

  return null;
}
