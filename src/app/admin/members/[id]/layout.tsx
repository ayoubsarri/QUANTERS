import React from "react";

export function generateStaticParams() {
  return [{ id: "member" }];
}

export default function MemberDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
