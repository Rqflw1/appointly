import { ReactNode } from "react";

interface ComponentProps {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
}

export default function Shell({ sidebar, topbar, children }: ComponentProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex min-h-screen">
        {sidebar}
        <div className="flex min-h-screen flex-1 flex-col">
          {topbar}
          <main className="flex-1 px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
