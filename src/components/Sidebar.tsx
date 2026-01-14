import React, { useState } from "react";

type SidebarProps = {
  activeSection: string;
  onSectionChange: (section: string) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: "upload", label: "Upload Resume", icon: "📄" },
    { id: "edit", label: "Edit Content", icon: "✏️" },
    { id: "templates", label: "Templates", icon: "🎨" },
    { id: "job-match", label: "Job Match", icon: "🎯" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 z-40 glass-lg border-r border-dark-border-light transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
    >
      <nav className="flex flex-col h-full py-6 px-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSectionChange(item.id)}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 mb-2 ${
              activeSection === item.id
                ? "text-white border"
                : "text-gray-300 hover:text-white hover:bg-dark-surface/50"
            }`}
            style={activeSection === item.id ? {
              background: `linear-gradient(135deg, var(--color-primary)20 0%, var(--color-secondary)20 100%)`,
              borderColor: `var(--color-primary)50`,
              boxShadow: `0 0 20px ${getComputedStyle(document.documentElement).getPropertyValue('--color-primary')}30`
            } : undefined}
          >
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate animate-fade-in">{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
