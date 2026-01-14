import React from "react";

type A4PreviewProps = {
  children: React.ReactNode;
};

const A4Preview: React.FC<A4PreviewProps> = ({ children }) => {
  return (
    <div className="a4-preview print:a4-preview-print bg-white shadow-paper mx-auto rounded-lg border-2 border-white/20 relative overflow-hidden">
      {/* Paper texture effect */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] pointer-events-none"></div>
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50/50 pointer-events-none"></div>
      <div className="h-full w-full p-8 relative z-10">
        {children}
      </div>
    </div>
  );
};

export default A4Preview;


