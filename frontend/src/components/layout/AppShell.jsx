import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, BookOpenText, ChartSpline, House, ListTodo, MoonStar, UserRound, Zap } from 'lucide-react';
import Logo from '../Logo';

const desktopNav = [
  { to: '/recommendation', label: 'Today', icon: House },
  { to: '/journal', label: 'Journal', icon: BookOpenText },
  { to: '/focus', label: 'Focus', icon: Zap },
  { to: '/relax', label: 'Relax', icon: MoonStar },
  { to: '/diary', label: 'Diary', icon: Activity },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/insights', label: 'Insights', icon: ChartSpline },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

const mobileNav = [
  { to: '/recommendation', label: 'Today', icon: House },
  { to: '/journal', label: 'Journal', icon: BookOpenText },
  { to: '/focus', label: 'Focus', icon: Zap },
  { to: '/relax', label: 'Relax', icon: MoonStar },
  { to: '/diary', label: 'Diary', icon: Activity },
];

function NavItem({ item }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        [
          'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
          isActive
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-white text-slate-600 border border-blue-100 hover:bg-blue-50',
        ].join(' ')
      }
    >
      <Icon size={16} />
      <span>{item.label}</span>
    </NavLink>
  );
}

function MobileNavItem({ item }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        [
          'flex min-w-[64px] flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-colors',
          isActive ? 'text-blue-700 bg-blue-50' : 'text-slate-500',
        ].join(' ')
      }
    >
      <Icon size={18} />
      <span>{item.label}</span>
    </NavLink>
  );
}

export default function AppShell({ title, subtitle, children, compact = false }) {
  return (
    <div className="app-shell">
      <div className="page-wrap">
        <header className="panel p-4 md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <Logo className="max-w-max" />
              {title ? <h1 className="page-title text-slate-800">{title}</h1> : null}
              {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
            </div>
            <nav className="hidden items-center gap-2 lg:flex">
              {desktopNav.map((item) => (
                <NavItem key={item.to} item={item} />
              ))}
            </nav>
          </div>
        </header>

        <main className={[compact ? 'mt-4' : 'mt-5', 'pb-24 lg:pb-8'].join(' ')}>{children}</main>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-blue-100 bg-white/95 p-2 shadow-lg backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-1">
          {mobileNav.map((item) => (
            <MobileNavItem key={item.to} item={item} />
          ))}
        </div>
      </nav>
    </div>
  );
}
