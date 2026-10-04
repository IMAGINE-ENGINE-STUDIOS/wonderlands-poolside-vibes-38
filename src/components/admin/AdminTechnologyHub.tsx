// Technology Hub — launchers for the existing production studios (real routes only).
import React from 'react';
import { Waves, Sun, BookOpen, Map, Ruler, Edit, Send, FolderOpen, Building2, ExternalLink } from 'lucide-react';

const TOOLS = [
  { to: '/wonderlands-studio', name: 'Wonderlands 3D Studio', desc: '3D pool, deck and terrain designer', icon: Waves },
  { to: '/solar-genius', name: 'Solar Studio', desc: 'Aerial roof tracing, panel layout and savings', icon: Sun },
  { to: '/flip', name: 'Flip Builder V3', desc: 'Digital magazines, catalogs and campaigns', icon: BookOpen },
  { to: '/global-design-board', name: 'Global Design Board', desc: 'Site planning across every trade', icon: Map },
  { to: '/blueprint-builder', name: 'Blueprint Builder', desc: 'Import and scale architectural plans', icon: Ruler },
  { to: '/content-editor', name: 'Content Editor', desc: 'Edit website pages with live preview', icon: Edit },
  { to: '/socialite', name: 'SOCIALITE', desc: 'Social publishing, email, SMS and calls', icon: Send },
  { to: '/procurement', name: 'Procurement', desc: 'Post needs and manage contractor bids', icon: Building2 },
  { to: '/files', name: 'Repository', desc: 'Project documents and shared galleries', icon: FolderOpen },
];

const AdminTechnologyHub = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
    {TOOLS.map(({ to, name, desc, icon: Icon }) => (
      <a
        key={to}
        href={to}
        target="_blank"
        rel="noopener"
        className="group rounded-xl border border-[#c9a84c]/20 bg-[#1a1a1a] p-5 transition-colors hover:border-[#c9a84c]/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c]"
      >
        <div className="flex items-start justify-between mb-4">
          <Icon className="h-6 w-6 text-[#c9a84c]" />
          <ExternalLink className="h-4 w-4 text-[#c9a84c]/40 group-hover:text-[#c9a84c]" />
        </div>
        <div className="text-[#f5f3ee] font-semibold" style={{ fontFamily: "'Sora', sans-serif" }}>{name}</div>
        <p className="text-xs text-[#f5f3ee]/50 mt-1">{desc}</p>
      </a>
    ))}
  </div>
);

export default AdminTechnologyHub;
