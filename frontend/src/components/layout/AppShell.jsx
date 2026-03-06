import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, ChartSpline, House, ListTodo, UserRound } from 'lucide-react';
import Logo from '../Logo';

const desktopNav = [
  { to: '/recommendation', label: 'Today', icon: House },
  { to: '/diary', label: 'Diary', icon: Activity },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/insights', label: 'Insights', icon: ChartSpline },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

const mobileNav = [
  { to: '/recommendation', label: 'Today', icon: House },
  { to: '/diary', label: 'Diary', icon: Activity },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/insights', label: 'Insights', icon: ChartSpline },
  { to: '/profile', label: 'Profile', icon: UserRound },
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
            ? 'bg-gradient-to-r from-rose-600 to-blue-600 text-white shadow-sm'
            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
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
          isActive ? 'bg-gradient-to-r from-rose-50 to-blue-50 text-blue-700' : 'text-slate-500',
        ].join(' ')
      }
    >
      <Icon size={18} />
      <span>{item.label}</span>
    </NavLink>
  );
}

const flowLabels = ['Scan', 'Journal', 'Recommendation'];

export default function AppShell({ title, subtitle, children, compact = false, flowStep = 0, hideNav = false }) {
  const showFlow = flowStep > 0;

  return (
    <div className="app-shell">
      <div className="page-wrap">
        <header className="panel p-4 md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <Logo className="max-w-max" />
              {title ? <h1 className="page-title text-slate-800">{title}</h1> : null}
              {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
              {showFlow ? (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {flowLabels.map((label, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === flowStep;
                    const isComplete = stepNumber < flowStep;

                    return (
                      <div
                        key={label}
                        className={[
                          'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold',
                          isActive
                            ? 'border-blue-200 bg-gradient-to-r from-rose-50 to-blue-50 text-blue-700'
                            : isComplete
                              ? 'border-rose-200 bg-rose-50 text-rose-700'
                              : 'border-slate-200 bg-white text-slate-400',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'flex h-5 w-5 items-center justify-center rounded-full text-[11px]',
                            isActive
                              ? 'bg-gradient-to-r from-rose-600 to-blue-600 text-white'
                              : isComplete
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-slate-100 text-slate-500',
                          ].join(' ')}
                        >
                          {stepNumber}
                        </span>
                        <span>{label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
            <nav className={['hidden items-center gap-2 lg:flex', hideNav ? 'lg:hidden' : ''].join(' ')}>
              {desktopNav.map((item) => (
                <NavItem key={item.to} item={item} />
              ))}
            </nav>
          </div>
        </header>

        <main className={[compact ? 'mt-4' : 'mt-5', 'pb-24 lg:pb-8'].join(' ')}>{children}</main>
      </div>

      <nav className={['fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur lg:hidden', hideNav ? 'hidden' : ''].join(' ')}>
        <div className="flex items-center justify-between gap-1">
          {mobileNav.map((item) => (
            <MobileNavItem key={item.to} item={item} />
          ))}
        </div>
      </nav>
    </div>
  );
}
