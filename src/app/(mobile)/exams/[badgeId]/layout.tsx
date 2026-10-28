import React from "react";

export function generateStaticParams() {
  return [{ badgeId: "exam" }];
}

export default function BadgeExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
