import { useEffect, useState, useRef, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  Activity, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, BarChart3, Bell, BookOpen,
  BriefcaseBusiness, Calculator, Check, ChevronDown, ChevronRight, Clock, Copy,
  CreditCard, Download, Edit2, Eye, FileBarChart, FileText, Filter, HelpCircle, Home, Landmark,
  LayoutGrid, LifeBuoy, List, LogOut, MoreHorizontal, Package, PanelLeft,
  Plus, Printer, Receipt, Search, Settings, ShieldCheck, Sparkles, Trash2, TrendingUp,
  UserPlus, Users, X, Zap
} from 'lucide-react';
import {
  accounts, budgets, contacts, customerInvoices, journalEntries, journals, products,
  purchaseOrders, salesOrders, vendorBills
} from '@/mock-data';
import { mockPay, mockRevise } from '@/services/mock-services';
import { api } from '@/lib/api';

const queryClient = new QueryClient();
const C = { canvas: '#ddd8cc', olive: '#70754e', cocoa: '#75614e', ink: '#423120' };
type Role = 'Admin' | 'Accountant' | 'User';

function Logo({ large = false }: { large?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} className={large ? 'logo-large' : 'logo-mark'} data-testid="img-anchor-logo">
      <img src="/assets/anchor-logo.png" alt="ANCHOR" />
    </motion.div>
  );
}
function Button({ children, variant = 'primary', className = '', onClick, type = 'button', disabled = false, testId }: { children: ReactNode; variant?: 'primary'|'secondary'|'ghost'|'danger'; className?: string; onClick?: () => void; type?: 'button'|'submit'; disabled?: boolean; testId?: string }) {
  return <button data-testid={testId} type={type} onClick={onClick} disabled={disabled} className={`anchor-btn anchor-btn-${variant} ${className}`}>{children}</button>;
}
function StatusPill({ status }: { status: string }) {
  const key = status.toLowerCase().replace(/\s/g, '-');
  return <span data-testid={`status-${key}`} className={`status-pill status-${key}`}>{status}</span>;
}
function Field({ label, placeholder, value, onChange, type = 'text', helper, error }: { label: string; placeholder?: string; value?: string; onChange?: (v: string) => void; type?: string; helper?: string; error?: string }) {
  return <label className="field"><span>{label}</span><input data-testid={`input-${label.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`} type={type} placeholder={placeholder} value={value} onChange={e => onChange?.(e.target.value)} />{error ? <small className="field-error"><X size={13}/>{error}</small> : helper ? <small>{helper}</small> : null}</label>;
}
function SelectField({ label, options, value, onChange }: { label: string; options: string[]; value?: string; onChange?: (v: string) => void }) {
  return <label className="field"><span>{label}</span><select data-testid={`select-${label.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`} value={value} onChange={e => onChange?.(e.target.value)}>{options.map(o => <option key={o}>{o}</option>)}</select></label>;
}
function PageTitle({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail?: string; action?: ReactNode }) {
  return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{detail && <p>{detail}</p>}</div>{action}</div>;
}
function Breadcrumb({ section, page }: { section: string; page: string }) {
  return <div className="breadcrumb"><span>Workspace</span><ArrowRight size={12}/><span>{section}</span><ArrowRight size={12}/><b>{page}</b></div>;
}

const primaryNav = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Sales', icon: TrendingUp, children: [{ label: 'Sales Orders', href: '/sales-orders' }, { label: 'Customer Invoices', href: '/customer-invoices' }] },
  { label: 'Purchase', icon: Receipt, children: [{ label: 'Purchase Orders', href: '/purchase-orders' }, { label: 'Vendor Bills', href: '/vendor-bills' }] },
  { label: 'Account', icon: Calculator, children: [{ label: 'Contacts', href: '/contacts' }, { label: 'Products', href: '/products' }, { label: 'Chart of Accounts', href: '/chart-of-accounts' }, { label: 'Journals', href: '/journals' }, { label: 'Journal Entries', href: '/journal-entries' }, { label: 'Analytics', href: '/analytics' }] },
  { label: 'Reports', icon: FileBarChart, children: [{ label: 'Profit & Loss', href: '/reports/profit-loss' }, { label: 'Balance Sheet', href: '/reports/balance-sheet' }, { label: 'Budgets', href: '/budgets' }, { label: 'Analytical Budgets', href: '/analytical-budgets-report' }] },
];

function AppShell({ children, role, setRole }: { children: ReactNode; role: Role; setRole: (r: Role) => void }) {
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState<string[]>(['Account', 'Sales', 'Purchase', 'Reports']);
  const toggle = (label: string) => setOpen(v => v.includes(label) ? v.filter(i => i !== label) : [...v, label]);
  
  if (role === 'User') {
    return <>
      <Portal role={role} setRole={setRole}/>
      <Beacon/>
    </>;
  }

  return <div className={`app-shell ${collapsed ? 'shell-collapsed' : ''}`}>
    <header className="topbar">
      <Link href="/dashboard" className="brand-lockup" data-testid="link-dashboard-logo"><Logo/><span>ANCHOR</span></Link>
      <div className="topbar-center"><span className="workspace-dot"/><span>Hearth & Form Studio</span><ChevronDown size={14}/></div>
      <div className="topbar-actions">
        <button className="icon-btn" data-testid="button-notifications"><Bell size={17}/><i/></button>
        
        {/* Role Selector dropdown */}
        <div className="role-switcher-dropdown">
          <select value={role} onChange={e => {
            const newRole = e.target.value as Role;
            setRole(newRole);
            if (newRole === 'User') setLocation('/portal');
            else if (location === '/portal') setLocation('/dashboard');
          }} className="role-badge-select" data-testid="select-active-role">
            <option value="Admin">Admin Role</option>
            <option value="Accountant">Accountant Role</option>
            <option value="User">User Role</option>
          </select>
        </div>

        <button className="avatar" data-testid="button-profile">{role[0]}</button>
        <button className="icon-btn" data-testid="button-logout" onClick={() => setLocation('/')} title="Sign out"><LogOut size={16}/></button>
      </div>
    </header>
    <aside className="sidebar">
      <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} data-testid="button-collapse-sidebar"><PanelLeft size={17}/></button>
      <div className="sidebar-scroll">
        <div className="side-caption">Workspace</div>
        {primaryNav.map(item => {
          const Icon = item.icon;
          const active = item.href === location || item.children?.some(c => c.href === location);
          return <div key={item.label} className="nav-group">
            <button className={`nav-parent ${active ? 'active' : ''}`} onClick={() => item.href ? setLocation(item.href) : toggle(item.label)} data-testid={`button-nav-${item.label.toLowerCase()}`}><Icon size={17}/><span>{item.label}</span>{item.children && <ChevronDown size={14} className={open.includes(item.label) ? 'rotate-180' : ''}/>}</button>
            {item.children && open.includes(item.label) && <div className="nav-children">{item.children.map(child => <Link key={child.href} href={child.href} className={location === child.href ? 'active' : ''} data-testid={`link-nav-${child.href.slice(1).replaceAll('/','-')}`}>{child.label}</Link>)}</div>}
          </div>;
        })}
        <div className="side-caption side-caption-spaced">Manage</div>
        {role === 'Admin' && <Link href="/users/new" className={`nav-parent ${location === '/users/new' ? 'active' : ''}`} data-testid="link-nav-users"><UserPlus size={17}/><span>Create User</span></Link>}
        <Link href="/portal" className={`nav-parent ${location === '/portal' ? 'active' : ''}`} data-testid="link-nav-portal"><BriefcaseBusiness size={17}/><span>Customer Portal</span></Link>
      </div>
      <div className="sidebar-foot"><button className="nav-parent" data-testid="button-help"><LifeBuoy size={17}/><span>Help center</span></button><button className="nav-parent" data-testid="button-settings"><Settings size={17}/><span>Settings</span></button></div>
    </aside>
    <main className="main-content"><div className="content-frame">{children}</div></main>
    <Beacon/>
  </div>;
}

const nodeModules = [
  { 
    id: 0, 
    label: 'Contacts', 
    subtitle: 'Vendors & Customers', 
    icon: Users, 
    route: '/contacts', 
    targetId: 1, 
    x: 15, y: 22, 
    quickActions: [
      { label: 'View Directory', route: '/contacts', primary: false },
      { label: '+ New Contact', route: '/contacts', primary: true }
    ] 
  },
  { 
    id: 1, 
    label: 'Sales Orders & Invoices', 
    subtitle: 'Receivables & Billing', 
    icon: FileText, 
    route: '/sales-orders', 
    targetId: 2, 
    x: 42, y: 12, 
    quickActions: [
      { label: 'Sales Orders', route: '/sales-orders', primary: false },
      { label: 'Customer Invoices', route: '/customer-invoices', primary: true }
    ] 
  },
  { 
    id: 2, 
    label: 'Products & Catalog', 
    subtitle: 'Goods & Services', 
    icon: Package, 
    route: '/products', 
    targetId: 3, 
    x: 72, y: 18, 
    quickActions: [
      { label: 'Product Catalog', route: '/products', primary: false },
      { label: '+ Add Product', route: '/products', primary: true }
    ] 
  },
  { 
    id: 3, 
    label: 'Purchase Orders & Bills', 
    subtitle: 'Payables & Suppliers', 
    icon: Receipt, 
    route: '/purchase-orders', 
    targetId: 4, 
    x: 85, y: 48, 
    quickActions: [
      { label: 'Purchase Orders', route: '/purchase-orders', primary: false },
      { label: 'Vendor Bills', route: '/vendor-bills', primary: true }
    ] 
  },
  { 
    id: 4, 
    label: 'Budgets & Allocation', 
    subtitle: 'Analytical Cost Centers', 
    icon: BarChart3, 
    route: '/budgets', 
    targetId: 5, 
    x: 70, y: 78, 
    quickActions: [
      { label: 'Budgets Overview', route: '/budgets', primary: false },
      { label: 'Analytical Report', route: '/analytical-budgets-report', primary: true }
    ] 
  },
  { 
    id: 5, 
    label: 'Journals & Ledger', 
    subtitle: 'Double-Entry Posting', 
    icon: BookOpen, 
    route: '/journals', 
    targetId: 6, 
    x: 40, y: 84, 
    quickActions: [
      { label: 'Journal Entries', route: '/journal-entries', primary: true },
      { label: 'Journal Setup', route: '/journals', primary: false }
    ] 
  },
  { 
    id: 6, 
    label: 'Chart of Accounts', 
    subtitle: 'Assets, Liabilities & Equity', 
    icon: Landmark, 
    route: '/chart-of-accounts', 
    targetId: 7, 
    x: 15, y: 72, 
    quickActions: [
      { label: 'Account Register', route: '/chart-of-accounts', primary: false },
      { label: '+ New Account', route: '/chart-of-accounts', primary: true }
    ] 
  },
  { 
    id: 7, 
    label: 'Financial Reports', 
    subtitle: 'P&L & Balance Sheet', 
    icon: FileBarChart, 
    route: '/reports/profit-loss', 
    targetId: 0, 
    x: 10, y: 45, 
    quickActions: [
      { label: 'Profit & Loss', route: '/reports/profit-loss', primary: true },
      { label: 'Balance Sheet', route: '/reports/balance-sheet', primary: false }
    ] 
  },
];

function NodeHub({ large = false }: { large?: boolean }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => { 
    if (paused) return; 
    const timer = window.setInterval(() => setActive(v => (v + 1) % nodeModules.length), 2800); 
    return () => window.clearInterval(timer); 
  }, [paused]);

  const selected = hover ?? active;
  const currNode = nodeModules[selected];
  const nextNode = nodeModules[currNode.targetId];

  // Curve control points for organic Bezier sweep
  const midX = (currNode.x + nextNode.x) / 2;
  const midY = (currNode.y + nextNode.y) / 2;
  const pathD = `M ${currNode.x} ${currNode.y} Q ${midX + (currNode.y > nextNode.y ? 12 : -12)} ${midY + (currNode.x > nextNode.x ? -12 : 12)} ${nextNode.x} ${nextNode.y}`;

  return (
    <div 
      className={`node-hub ${large ? 'node-hub-large' : ''}`} 
      onMouseEnter={() => setPaused(true)} 
      onMouseLeave={() => { setPaused(false); setHover(null); }}
    >
      <svg className="hub-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <motion.path 
          key={selected} 
          className="node-connector" 
          d={pathD} 
          fill="none" 
          stroke={C.cocoa} 
          strokeWidth=".35" 
          initial={{ pathLength: 0, opacity: 0.2 }}
          animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      </svg>
      <div className="hub-center">
        <div className="hub-ring"><Calculator size={large ? 31 : 23}/></div>
        <span>ANCHOR</span>
        <small>steady by design</small>
      </div>

      {nodeModules.map((n, i) => { 
        const Icon = n.icon; 
        const isSelected = selected === i;
        return (
          <motion.button 
            key={n.label} 
            className={`node-card ${isSelected ? 'node-active' : ''}`} 
            style={{ left: `${n.x}%`, top: `${n.y}%` }} 
            onMouseEnter={() => { setHover(i); setPaused(true); }} 
            onClick={() => setLocation(n.route)} 
            data-testid={`node-${n.label.toLowerCase().replaceAll(' ','-').replaceAll('&','and')}`}
          >
            <span className="node-wash"/>
            <Icon size={large ? 24 : 19}/>
            <span>{n.label}</span>
            {isSelected && (
              <div className="node-popover" onClick={e => e.stopPropagation()}>
                <b>{n.label}</b>
                <small>{n.subtitle}</small>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                  {n.quickActions.map(action => (
                    <button
                      key={action.label}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(action.route);
                      }}
                      style={{
                        border: '0',
                        borderRadius: '3px',
                        padding: '4px 6px',
                        fontSize: '9px',
                        fontWeight: action.primary ? 700 : 500,
                        background: action.primary ? 'var(--olive)' : 'rgba(117,97,78,.15)',
                        color: action.primary ? '#eeeae1' : 'var(--ink)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{action.label}</span>
                      <ArrowRight size={10}/>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.button>
        ); 
      })}

      {/* Sequence dots indicator at the bottom */}
      <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', zIndex: 10 }}>
        {nodeModules.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setActive(i); setHover(null); }}
            style={{
              width: selected === i ? '18px' : '6px',
              height: '6px',
              borderRadius: '3px',
              background: selected === i ? 'var(--olive)' : 'rgba(117,97,78,.35)',
              border: '0',
              padding: 0,
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            title={`Jump to ${nodeModules[i].label}`}
          />
        ))}
      </div>
    </div>
  );
}

function Kpi({ label, value, detail, href, icon: Icon, action }: { label: string; value: string; detail: string; href?: string; icon: any; action?: () => void }) {
  const inner = <div className="kpi-card"><div className="kpi-head"><span>{label}</span><Icon size={17}/></div><strong data-testid={`metric-${label.toLowerCase()}`}>{value}</strong><div className="kpi-foot"><span>{detail}</span>{action ? <button onClick={action} data-testid={`button-new-${label.toLowerCase()}`}><Plus size={12}/> New</button> : <ArrowUpRight size={14}/>}</div></div>;
  return href ? <Link href={href} data-testid={`link-kpi-${label.toLowerCase()}`}>{inner}</Link> : inner;
}
function Dashboard() {
  return <><div className="dashboard-heading"><div><div className="eyebrow">Tuesday, March 24, 2026</div><h1>Good morning, Mara.</h1><p>Books are in good shape. Here is the quiet view of what needs your attention.</p></div><Button variant="secondary" testId="button-dashboard-export"><Download size={15}/> Export overview</Button></div><div className="kpi-grid"><Kpi label="Sales" value="$164,820" detail="12 confirmed · 3 drafts" href="/sales-orders" icon={TrendingUp}/><Kpi label="Purchases" value="$57,960" detail="8 confirmed · 2 drafts" href="/purchase-orders" icon={Receipt}/><Kpi label="Budget" value="44%" detail="$42,180 achieved of $96,000" href="/budgets" icon={BarChart3}/></div><section className="hub-section"><div className="section-heading"><div><div className="eyebrow">Your workspace</div><h2>Everything has a place.</h2></div><span className="live-note"><i/> Cycling overview</span></div><NodeHub/><div className="hub-footnote"><span><Zap size={14}/> Select a module to open it</span><span>Last synced 4 minutes ago</span></div></section></>;
}

function Landing() {
  return <div className="landing noise">
    <header className="landing-bar">
      <Link href="/" className="brand-lockup brand-dark" data-testid="link-home-logo"><Logo/><span>ANCHOR</span></Link>
      <div>
        <Link href="/login" className="text-link" data-testid="link-sign-in">Sign in</Link>
        <Link href="/signup" className="landing-cta" data-testid="link-get-started">Get started <ArrowRight size={15}/></Link>
      </div>
    </header>
    <section className="landing-hero">
      <div className="hero-kicker"><i>One calm place to run the books.</i></div>
      <NodeHub large/>
      <div className="hero-scroll" style={{ textTransform: 'uppercase', letterSpacing: '.08em', marginTop: '12px' }}>
        Sequential Double-Entry Accounting · Continuous Reconciliation · Single Source of Truth
      </div>
    </section>
    <section className="feature-strip">
      <div className="strip-intro">
        <span className="eyebrow">Built for small teams</span>
        <h2>Clarity without<br/>the ceremony.</h2>
      </div>
      {[
        ['01','Sales & Invoicing','Order confirmations convert directly to receivable invoices with automated partial payment tracking.'],
        ['02','Purchases & Bills','Vendor orders, line item receipting, and auto-generated bills equipped with budget threshold alerts.'],
        ['03','General Ledger','Strict double-entry journal postings, configurable account mappings, and analytical cost center tags.'],
        ['04','Financial Reports','Live Balance Sheet and Profit & Loss statements structured for statutory filing and board reviews.']
      ].map(([n,t,d]) => (
        <div className="feature-item" key={n}>
          <span className="feature-no">{n}</span>
          <h3>{t}</h3>
          <p>{d}</p>
          <ArrowUpRight size={16}/>
        </div>
      ))}
    </section>
    <section className="landing-band">
      <div>
        <span className="eyebrow">Start with solid ground</span>
        <h2>Ready for <i>calm financial control?</i></h2>
        <p style={{ marginTop: '8px', opacity: 0.9, fontSize: '13px' }}>
          Set up your ledger, import your chart of accounts, and begin invoicing in minutes.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Link href="/signup" className="band-link" data-testid="link-create-workspace">
          Create your workspace <ArrowRight size={16}/>
        </Link>
        <Link href="/login" className="band-link" style={{ background: 'transparent', border: '1px solid rgba(233,228,217,.4)', color: '#eeeae1' }} data-testid="link-member-sign-in">
          Member Sign in <ArrowRight size={16}/>
        </Link>
      </div>
    </section>
    <footer className="landing-footer">
      <div className="brand-lockup brand-dark"><Logo/><span>ANCHOR</span></div>
      <span>— Precision Ledger Systems</span>
      <span>© 2026 Anchor Workspace</span>
    </footer>
  </div>;
}


function AuthLayout({ children, aside }: { children: ReactNode; aside: ReactNode }) {
  return <div className="auth-page noise"><div className="auth-aside"><Link href="/" className="brand-lockup brand-dark"><Logo/><span>ANCHOR</span></Link><div className="auth-quote"><span className="eyebrow">ANCHOR / PRIVATE WORKSPACE</span><h2>Good records make<br/><i>good decisions.</i></h2><p>Tools for the people who keep a business moving.</p></div><div className="auth-aside-foot">A quiet place to run the books <span>↗</span></div></div><main className="auth-main"><div className="auth-card">{aside}{children}</div></main></div>;
}
function Login({ role, setRole }: { role: Role; setRole: (r: Role) => void }) {
  const [, setLocation] = useLocation(); const [error, setError] = useState(false); const [login, setLogin] = useState('');
  return <AuthLayout aside={<div className="auth-logo"><Logo large/></div>}><div className="eyebrow">WELCOME BACK</div><h1>Sign in to ANCHOR</h1><p className="auth-sub">Your workspace is ready when you are.</p>{error && <div className="error-banner"><X size={16}/><span><b>Invalid Login Id or Password</b><small>Check your details and try again.</small></span></div>}<div className="sso-buttons"><Button variant="secondary" className="w-full" testId="button-sso-google">Continue with Google</Button><Button variant="secondary" className="w-full" testId="button-sso-microsoft">Continue with Microsoft</Button></div><div className="auth-divider"><span>or sign in with email</span></div><form className="auth-form" onSubmit={e => { e.preventDefault(); if (login) { setLocation(role === 'User' ? '/portal' : '/dashboard'); } else setError(true); }}><Field label="Login ID" placeholder="mara.chen" value={login} onChange={setLogin}/><Field label="Password" placeholder="Enter your password" type="password"/><div className="role-selector"><span>Role</span><div>{(['Admin','Accountant','User'] as Role[]).map(r => <button type="button" key={r} className={role === r ? 'selected' : ''} onClick={() => setRole(r)} data-testid={`button-role-${r.toLowerCase()}`}>{r}</button>)}</div></div><div className="form-row-between"><label className="check-label"><input type="checkbox"/> Keep me signed in</label><Link href="/forgot-password" className="text-link" data-testid="link-forgot-password">Forgot password?</Link></div><Button type="submit" className="w-full" testId="button-login">Sign in <ArrowRight size={15}/></Button></form><p className="auth-switch">New to ANCHOR? <Link href="/signup" className="text-link" data-testid="link-signup">Create a workspace</Link></p><div className="auth-security"><ShieldCheck size={14}/> Secure workspace · Role-based access</div></AuthLayout>;
}
function Signup({ role, setRole }: { role: Role; setRole: (r: Role) => void }) {
  const [, setLocation] = useLocation(); const [name, setName] = useState(''); const [mismatch, setMismatch] = useState(false); const [pwd, setPwd] = useState('');
  return <AuthLayout aside={<div className="auth-logo"><Logo large/></div>}><div className="eyebrow">CREATE AN ACCOUNT</div><h1>Set your anchor.</h1><p className="auth-sub">Choose your role to enter the workspace.</p><form className="auth-form signup-form" onSubmit={e => { e.preventDefault(); setLocation(role === 'User' ? '/portal' : '/dashboard'); }}><div className="two-fields"><Field label="Full Name" placeholder="Mara Chen" value={name} onChange={setName}/><Field label="Company Name" placeholder="Hearth & Form Studio"/></div><div className="two-fields"><Field label="Login ID" placeholder="mara.chen" helper="6–12 characters · must be unique"/><Field label="Email" placeholder="mara@hearthandform.co" helper="Must not be a duplicate"/></div><Field label="Billing Address" placeholder="123 Main St, Suite 400, New York, NY 10001"/><div className="two-fields"><Field label="Password" placeholder="••••••••" type="password" value={pwd} onChange={setPwd} helper="8+ chars · lowercase · uppercase · special"/><Field label="Re-enter Password" placeholder="••••••••" type="password" error={mismatch ? 'Passwords do not match' : undefined}/></div>{pwd.length > 0 && <div className="password-strength"><div className={`strength-bar ${pwd.length > 8 ? 'strong' : pwd.length > 4 ? 'medium' : 'weak'}`}></div><small>{pwd.length > 8 ? 'Strong password' : pwd.length > 4 ? 'Moderate password' : 'Weak password'}</small></div>}<div className="role-selector"><span>Role</span><div>{(['Admin','Accountant','User'] as Role[]).map(r => <button type="button" key={r} className={role === r ? 'selected' : ''} onClick={() => setRole(r)} data-testid={`button-role-${r.toLowerCase()}`}>{r}</button>)}</div><small>Select your workspace role.</small></div><Button type="submit" className="w-full" testId="button-create-account">Create account <ArrowRight size={15}/></Button></form><p className="auth-switch">Already have access? <Link href="/login" className="text-link" data-testid="link-login">Sign in</Link></p></AuthLayout>;
}
function ForgotPassword() { const [sent, setSent] = useState(false); return <AuthLayout aside={<div className="auth-logo"><Logo large/></div>}><div className="eyebrow">ACCOUNT RECOVERY</div><h1>Reset your password.</h1><p className="auth-sub">We will send a secure reset link to the address on your workspace.</p>{sent ? <div className="success-card"><Check size={18}/><b>Check your inbox.</b><p>If that address is on file, a reset link is on its way.</p></div> : <form className="auth-form" onSubmit={e => {e.preventDefault(); setSent(true);}}><Field label="Email address" placeholder="you@company.com"/><Button type="submit" className="w-full" testId="button-send-reset">Send reset link <ArrowRight size={15}/></Button></form>}<p className="auth-switch"><Link href="/login" className="text-link" data-testid="link-back-login"><ArrowLeft size={14}/> Back to sign in</Link></p></AuthLayout>; }

function ViewToggle({ view, setView }: { view: 'list'|'kanban'; setView: (v: 'list'|'kanban') => void }) { return <div className="view-toggle"><button className={view === 'list' ? 'selected' : ''} onClick={() => setView('list')} data-testid="button-list-view"><List size={15}/> List</button><button className={view === 'kanban' ? 'selected' : ''} onClick={() => setView('kanban')} data-testid="button-kanban-view"><LayoutGrid size={15}/> Kanban</button></div>; }
function CreateModal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) { return <div className="modal-backdrop"><motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="modal"><div className="modal-head"><div><span className="eyebrow">NEW RECORD</span><h2>{title}</h2></div><button className="icon-btn" onClick={onClose} data-testid="button-close-modal"><X size={18}/></button></div>{children}</motion.div></div>; }

function RowActions({
  record,
  onView,
  onEdit,
  onDelete,
  label = 'record'
}: {
  record: any;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    const idVal = record?.id || record?.entryNo || record?.orderNo || record?.name || 'ID';
    navigator.clipboard?.writeText(String(idVal));
    setToast('Copied to clipboard!');
    setOpen(false);
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="row-actions-container" ref={menuRef} onClick={(e) => e.stopPropagation()}>
      <button
        className="more-btn"
        data-testid={`button-more-${record?.id || 'row'}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        title="Actions"
      >
        <MoreHorizontal size={17} />
      </button>

      {toast && (
        <div className="toast-pill">
          <Check size={12} /> {toast}
        </div>
      )}

      {open && (
        <div className="row-actions-dropdown">
          <button
            className="row-action-item"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              if (onView) onView();
              else alert(`Details for ${record.name || record.partner || record.entryNo || record.id}:\n${JSON.stringify(record, null, 2)}`);
            }}
          >
            <Eye size={14} /> View details
          </button>

          {onEdit && (
            <button
              className="row-action-item"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onEdit();
              }}
            >
              <Edit2 size={14} /> Edit {label}
            </button>
          )}

          <button className="row-action-item" onClick={handleCopyId}>
            <Copy size={14} /> Copy ID / Details
          </button>

          {onDelete && (
            <button
              className="row-action-item danger"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                if (confirm(`Are you sure you want to delete this ${label}?`)) {
                  onDelete();
                }
              }}
            >
              <Trash2 size={14} /> Delete {label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function MasterPage({ kind }: { kind: 'contacts' | 'products' | 'analytics' | 'accounts' | 'journals' }) {
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [nameInput, setNameInput] = useState('');
  const [typeInput, setTypeInput] = useState(kind === 'contacts' ? 'Customer' : kind === 'products' ? 'Goods' : 'Asset');
  const [descInput, setDescInput] = useState('');

  const loadItems = async () => {
    try {
      if (kind === 'contacts') {
        const res = await api.getContacts();
        if (res.contacts?.length) setItems(res.contacts.map(c => ({ ...c, city: c.address || 'Local' })));
        else setItems(contacts);
      } else if (kind === 'products') {
        const res = await api.getProducts();
        if (res.products?.length) setItems(res.products.map(p => ({ ...p, sales: `$${parseFloat(p.unitPrice).toFixed(2)}`, cost: `$${parseFloat(p.costPrice || '0').toFixed(2)}` })));
        else setItems(products);
      } else if (kind === 'accounts') {
        const res = await api.getAccounts();
        if (res.accounts?.length) setItems(res.accounts.map(a => ({ ...a, balance: `$${parseFloat(a.balance).toFixed(2)}` })));
        else setItems(accounts);
      } else if (kind === 'journals') {
        const res = await api.getJournals();
        if (res.journals?.length) setItems(res.journals.map(j => ({ ...j, account: j.name })));
        else setItems(journals);
      } else if (kind === 'analytics') {
        const res = await api.getBudgets();
        if (res.budgets?.length) setItems(res.budgets.map((b: any) => ({ ...b, name: b.analytic, type: b.type, period: b.period, achieved: b.achieved, sales: b.achieved, target: b.target })));
        else setItems(budgets.map(b => ({ ...b, name: b.analytic, type: b.type, period: b.period, achieved: b.achieved, sales: b.achieved, target: b.target })));
      }
    } catch {
      setItems(kind === 'contacts' ? contacts : kind === 'products' ? products : kind === 'accounts' ? accounts : kind === 'journals' ? journals : (budgets as any));
    }
  };

  useEffect(() => { loadItems(); }, [kind]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (kind === 'contacts') {
        const res = await api.createContact({ name: nameInput || 'New Contact', type: typeInput || 'Customer', email: descInput || 'contact@domain.com', address: 'Workspace HQ', status: 'Active' });
        setItems([ { ...res.contact, city: 'Workspace HQ' }, ...items ]);
      } else if (kind === 'products') {
        const res = await api.createProduct({ name: nameInput || 'New Product', category: typeInput || 'Goods', unitPrice: '120.00', costPrice: '60.00', status: 'In Stock' });
        setItems([ { ...res.product, sales: `$120.00`, cost: `$60.00` }, ...items ]);
      } else if (kind === 'accounts') {
        const res = await api.createAccount({ name: nameInput || 'New Account', type: typeInput || 'Asset', balance: '0.00' });
        setItems([ { ...res.account, balance: '$0.00' }, ...items ]);
      } else if (kind === 'journals') {
        const res = await api.createJournal({ name: nameInput || 'New Journal', type: typeInput || 'General', code: 'MISC' });
        setItems([ { ...res.journal, account: res.journal.name }, ...items ]);
      }
    } catch {
      setItems([ { id: Date.now(), name: nameInput || 'New Record', type: typeInput, email: descInput || 'active' }, ...items ]);
    }
    setModal(false);
    setNameInput('');
    setDescInput('');
  };

  const handleDeleteItem = async (id: any) => {
    try {
      if (kind === 'contacts') await api.deleteContact(id);
      else if (kind === 'products') await api.deleteProduct(id);
      else if (kind === 'accounts') await api.deleteAccount(id);
      else if (kind === 'journals') await api.deleteJournal(id);
    } catch (err) {
      console.error('Delete error', err);
    }
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const config = {
    contacts: { title: 'Contacts', eyebrow: 'ACCOUNT / MASTER DATA', detail: 'Customers and vendors your workspace relies on.', action: 'New contact', cols: ['Contact','Type','Email','Location','Balance'], icon: Users },
    products: { title: 'Products', eyebrow: 'ACCOUNT / MASTER DATA', detail: 'The goods and services that move through your books.', action: 'New product', cols: ['Product','Type','Category','Sales price','Cost'], icon: Package },
    analytics: { title: 'Analytical accounts', eyebrow: 'ACCOUNT / CONTROL', detail: 'Track performance against linked budgets.', action: 'New analytical account', cols: ['Analytic account','Type','Period','Achieved','Budget'], icon: Activity },
    accounts: { title: 'Chart of accounts', eyebrow: 'ACCOUNT / STRUCTURE', detail: 'A clean, dependable map of every account.', action: 'New account', cols: ['Account','Type','Balance'], icon: Landmark },
    journals: { title: 'Journals', eyebrow: 'ACCOUNT / STRUCTURE', detail: 'Default accounts for each kind of entry.', action: 'New journal', cols: ['Journal','Type','Default account'], icon: BookOpen },
  }[kind];

  const rows = items.filter((r: any) => JSON.stringify(r).toLowerCase().includes(query.toLowerCase()));

  return <><Breadcrumb section={config.eyebrow.split(' / ')[0]} page={config.title}/><PageTitle eyebrow={config.eyebrow} title={config.title} detail={config.detail} action={<Button onClick={() => setModal(true)} testId={`button-new-${kind}`}><Plus size={16}/>{config.action}</Button>}/><div className="toolbar"><div className="search-field"><Search size={16}/><input data-testid={`input-search-${kind}`} placeholder={`Search ${config.title.toLowerCase()}`} value={query} onChange={e => setQuery(e.target.value)}/></div><div className="toolbar-right"><Button variant="ghost" testId={`button-filter-${kind}`}><Filter size={15}/> Filter</Button><ViewToggle view={view} setView={setView}/></div></div>{view === 'list' ? <div className="table-card"><table><thead><tr>{config.cols.map(c => <th key={c}>{c}</th>)}<th/></tr></thead><tbody>{rows.map((r: any) => <tr key={r.id} data-testid={`row-${kind}-${r.id}`}><td><div className="cell-primary"><span className="row-icon"><config.icon size={15}/></span><div><b>{r.name || r.partner || r.label}</b><small>{r.id}</small></div></div></td><td>{r.type && <StatusPill status={r.type}/>}</td><td>{r.email || r.account || r.category || r.period || r.defaultAccount || '—'}</td>{kind === 'contacts' && <td>{r.city || r.address || 'Local'}</td>}{kind === 'products' && <td>{r.sales}</td>}{kind === 'analytics' && <td>{r.achieved}</td>}{kind === 'accounts' && <td className="money">{r.balance}</td>}{kind === 'journals' && <td className="text-cocoa">{r.account}</td>}<td><RowActions record={r} label={config.title.slice(0, -1).toLowerCase()} onDelete={() => handleDeleteItem(r.id)}/></td></tr>)}</tbody></table></div> : <div className="kanban-grid">{['Customer','Vendor','Service','Asset','Goods'].filter(group => rows.some((r: any) => r.type === group || r.category === group) || kind === 'contacts').map(group => <div className="kanban-column" key={group}><div className="kanban-head"><span>{group}</span><em>{rows.filter((r: any) => r.type === group || r.category === group).length}</em></div>{rows.filter((r: any) => r.type === group || r.category === group).map((r: any) => <div className="kanban-card" key={r.id}><div><b>{r.name || r.partner}</b><StatusPill status={r.type || r.status || 'Active'}/></div><small>{r.email || r.category || r.account || 'Active'}</small><span>{r.balance || r.sales || r.achieved || 'Active'}</span></div>)}</div>)}</div>}{modal && <CreateModal title={config.action} onClose={() => setModal(false)}><form className="modal-form" onSubmit={handleSave}><Field label={kind === 'accounts' ? 'Account name' : kind === 'journals' ? 'Journal name' : 'Name'} value={nameInput} onChange={setNameInput} placeholder={`Enter ${config.title.toLowerCase()} name`}/><SelectField label="Type" value={typeInput} onChange={setTypeInput} options={kind === 'accounts' ? ['Asset','Liability','Income','Expense','Bank','Cash','Capital'] : kind === 'contacts' ? ['Customer','Vendor'] : ['Goods','Services','General','Sales','Purchase']}/><Field label="Email / Notes" value={descInput} onChange={setDescInput} placeholder="Contact email or optional note"/><div className="modal-actions"><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button type="submit" testId={`button-save-${kind}`}>Create record</Button></div></form></CreateModal>}</>;
}

function TransactionList({ type }: { type: 'purchase'|'sales'|'journal' }) {
  const [location, setLocation] = useLocation();
  const [view, setView] = useState<'list'|'kanban'>('list');
  const [rows, setRows] = useState<any[]>([]);
  const isJournal = type === 'journal';
  const title = type === 'purchase' ? 'Purchase orders' : type === 'sales' ? 'Sales orders' : 'Journal entries';
  const singular = type === 'purchase' ? 'purchase order' : type === 'sales' ? 'sales order' : 'journal entry';
  const statuses = isJournal ? ['Draft','Posted'] : ['Draft','Confirmed','Billed'];

  useEffect(() => {
    async function loadData() {
      try {
        if (type === 'purchase') {
          const res = await api.getPurchaseOrders();
          if (res.purchaseOrders?.length) setRows(res.purchaseOrders.map((p: any) => ({ ...p, partner: p.vendorName, total: `$${parseFloat(p.totalAmount).toFixed(2)}` })));
          else setRows(purchaseOrders);
        } else if (type === 'sales') {
          const res = await api.getSalesOrders();
          if (res.salesOrders?.length) setRows(res.salesOrders.map((s: any) => ({ ...s, partner: s.customerName, total: `$${parseFloat(s.totalAmount).toFixed(2)}` })));
          else setRows(salesOrders);
        } else {
          const res = await api.getJournalEntries();
          if (res.journalEntries?.length) setRows(res.journalEntries.map((j: any) => ({ ...j, journal: j.journalName || 'General Journal', amount: `$${parseFloat(j.debitTotal || '0').toFixed(2)}` })));
          else setRows(journalEntries);
        }
      } catch {
        setRows(type === 'purchase' ? purchaseOrders : type === 'sales' ? salesOrders : journalEntries);
      }
    }
    loadData();
  }, [type]);

  const handleDeleteRow = async (id: any) => {
    try {
      if (type === 'journal') await api.deleteJournalEntry(id);
    } catch (err) {
      console.error('Delete error', err);
    }
    setRows(prev => prev.filter(r => (r.id || r.entryNo || r.orderNo) !== id));
  };

  return <><Breadcrumb section={isJournal ? 'Account' : type === 'purchase' ? 'Purchase' : 'Sales'} page={title}/><PageTitle eyebrow={`${isJournal ? 'ACCOUNTING' : type.toUpperCase()} / WORKFLOW`} title={title} detail={`Manage ${singular}s with a clear, considered trail.`} action={<Button onClick={() => setLocation(isJournal ? '/journal-entries/new' : type === 'purchase' ? '/purchase-orders/new' : '/sales-orders/new')} testId={`button-new-${type}`}><Plus size={16}/> New {singular}</Button>}/><div className="toolbar"><div className="search-field"><Search size={16}/><input placeholder={`Search ${title.toLowerCase()}`} data-testid={`input-search-${type}`}/></div><div className="toolbar-right"><Button variant="ghost"><Filter size={15}/> Filter</Button><ViewToggle view={view} setView={setView}/></div></div>{view === 'list' ? <div className="table-card"><table><thead><tr>{(isJournal ? ['Entry','Date','Journal','Memo','Amount','Status'] : ['Number', type === 'purchase' ? 'Vendor' : 'Customer','Date','Items','Total','Status']).map(x => <th key={x}>{x}</th>)}<th/></tr></thead><tbody>{rows.map((r, i) => <tr key={r.id || i} data-testid={`row-${type}-${r.id}`} onClick={() => !isJournal && setLocation(type === 'purchase' ? '/purchase-orders/PO-detail' : '/sales-orders/SO-detail')}><td><div className="cell-primary"><span className="doc-icon">{isJournal ? <BookOpen size={15}/> : <FileText size={15}/>}</span><div><b>{r.entryNo || r.orderNo || r.id}</b><small>{r.no || 'Auto-numbered record'}</small></div></div></td>{isJournal ? <><td>{r.date}</td><td>{r.journalName || r.journal || 'General Journal'}</td><td>{r.reference || r.partner || r.memo || 'Journal Entry'}</td><td className="money">{r.amount || `$${parseFloat(r.debitTotal || '0').toFixed(2)}`}</td></> : <><td>{r.partner}</td><td>{r.date}</td><td>{r.items || r.reference || 'Standard Order'}</td><td className="money">{r.total}</td></>}<td><StatusPill status={r.status || 'Posted'}/></td><td><RowActions record={r} label={singular} onView={() => !isJournal && setLocation(type === 'purchase' ? '/purchase-orders/PO-detail' : '/sales-orders/SO-detail')} onDelete={() => handleDeleteRow(r.id || r.entryNo || r.orderNo || i)}/></td></tr>)}</tbody></table></div> : <div className="kanban-grid transaction-kanban">{statuses.map(s => <div className="kanban-column" key={s}><div className="kanban-head"><span>{s}</span><em>{rows.filter(r => r.status === s).length}</em></div>{rows.filter(r => r.status === s).map(r => <div className="kanban-card" key={r.id}><div><b>{r.entryNo || r.orderNo || r.id}</b><StatusPill status={r.status || 'Posted'}/></div><strong>{r.reference || r.partner || r.memo}</strong><small>{r.date}</small><span>{r.amount || r.total}</span></div>)}</div>)}</div>}</>;
}

function DetailForm({ mode }: { mode: 'purchase'|'sales'|'journal' }) {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState('Draft');
  const [balanced, setBalanced] = useState(true);
  const [partner, setPartner] = useState('');
  const [dateVal, setDateVal] = useState('Mar 24, 2026');
  const [journalVal, setJournalVal] = useState('General Journal');
  const [refVal, setRefVal] = useState('March Office & Retainer');
  const [total, setTotal] = useState('4800.00');
  const isJournal = mode === 'journal';
  const isPurchase = mode === 'purchase';
  const label = isJournal ? 'Journal entry' : isPurchase ? 'Purchase order' : 'Sales order';

  const handleCreate = async () => {
    try {
      if (mode === 'purchase') {
        await api.createPurchaseOrder({ vendorName: partner || 'Morrow Architecture', totalAmount: total, status: 'Confirmed' });
        setLocation('/purchase-orders');
      } else if (mode === 'sales') {
        await api.createSalesOrder({ customerName: partner || 'Juniper & Co', totalAmount: total, status: 'Confirmed' });
        setLocation('/sales-orders');
      } else {
        await api.createJournalEntry({
          journalName: journalVal || 'General Journal',
          date: dateVal || 'Mar 24, 2026',
          reference: refVal || 'Manual Journal Entry',
          partner: partner || 'Internal Ledger',
          debitTotal: total || '4800.00',
          creditTotal: total || '4800.00',
          status: 'Posted'
        });
        setLocation('/journal-entries');
      }
    } catch {
      setLocation(isJournal ? '/journal-entries' : isPurchase ? '/purchase-orders' : '/sales-orders');
    }
  };

  return <><Breadcrumb section={isJournal ? 'Account' : isPurchase ? 'Purchase' : 'Sales'} page={`New ${label}`}/><PageTitle eyebrow={`${mode.toUpperCase()} / NEW`} title={`New ${label}`} detail={isJournal ? 'Record a precise, balanced movement in the books.' : 'Build the next record from a trusted starting point.'} action={<div className="stage-actions"><StatusPill status={step}/><Button variant="ghost" onClick={() => setLocation(isJournal ? '/journal-entries' : isPurchase ? '/purchase-orders' : '/sales-orders')}>Cancel</Button><Button onClick={handleCreate}>{isJournal ? 'Post entry' : 'Confirm'} <ArrowRight size={15}/></Button></div>}/><div className="form-layout"><section className="form-card"><div className="card-section-head"><div><span className="eyebrow">RECORD DETAILS</span><h3>{isJournal ? 'Entry information' : `${label} information`}</h3></div><span className="auto-number">{isJournal ? 'JE-2026-019' : isPurchase ? 'PO-2026-043' : 'SO-2026-039'}</span></div><div className="form-grid"><Field label={isJournal ? 'Accounting date' : `${isPurchase ? 'Vendor' : 'Customer'}`} value={isJournal ? dateVal : partner} onChange={isJournal ? setDateVal : setPartner} placeholder={isJournal ? 'Mar 24, 2026' : isPurchase ? 'Select vendor' : 'Select customer'}/><Field label={isJournal ? 'Journal' : 'Date'} value={isJournal ? journalVal : dateVal} onChange={isJournal ? setJournalVal : setDateVal} placeholder={isJournal ? 'General Journal' : 'Mar 24, 2026'}/><Field label={isJournal ? 'Reference / memo' : 'Total amount'} value={isJournal ? refVal : total} onChange={isJournal ? setRefVal : setTotal} placeholder={isJournal ? 'Short description' : '4800.00'}/></div></section>{!isJournal && <div className="amber-banner"><Zap size={16}/><span><b>Budget watch</b><br/>This commitment will use 8.4% of the linked Operations budget.</span><button>Review budget</button></div>}<section className="form-card line-items"><div className="card-section-head"><div><span className="eyebrow">LINE ITEMS</span><h3>{isJournal ? 'Debit & credit lines' : 'Products and services'}</h3></div><Button variant="ghost"><Plus size={14}/> Add line</Button></div><table><thead><tr>{(isJournal ? ['Account','Analytic tag','Debit','Credit'] : ['Product','Analytic tag','Qty','Unit price','Line total']).map(h => <th key={h}>{h}</th>)}</tr></thead><tbody><tr>{(isJournal ? ['1200 · Accounts Receivable','Growth','$4,800.00','—'] : ['Brand strategy sprint','Growth','1','$4,800.00','$4,800.00']).map((x,i) => <td key={i}><input defaultValue={x} data-testid={`input-line-${i}`}/></td>)}</tr><tr>{(isJournal ? ['4100 · Professional Services','Growth','—','$4,800.00'] : ['Design system retainer','Operations','1','$2,400.00','$2,400.00']).map((x,i) => <td key={i}><input defaultValue={x}/></td>)}</tr></tbody><tfoot><tr><td colSpan={isJournal ? 2 : 4}><b>{isJournal ? balanced ? 'Balanced and ready to post' : 'Totals do not match' : '2 line items'}</b></td><td className={isJournal && !balanced ? 'danger-text' : 'money'}>{isJournal ? `$${parseFloat(total).toFixed(2)}` : '$7,200.00'}</td></tr></tfoot></table>{isJournal && <div className={`balance-toggle ${balanced ? 'balanced' : ''}`}><span>{balanced ? <Check size={15}/> : <X size={15}/>} Visual balance state</span><button onClick={() => setBalanced(!balanced)} data-testid="button-toggle-balance">{balanced ? 'Show mismatch' : 'Mark balanced'}</button></div>}</section></div></>;
}

function PaymentModal({ partner, amount, docId, onClose, onPaid }: { partner: string; amount: string; docId?: string; onClose: () => void; onPaid: () => void }) {
  const [method, setMethod] = useState('Bank Transfer');
  const [note, setNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = amount.replace(/[^0-9.]/g, '');
    try {
      await api.createPayment({
        type: 'Receive',
        partnerName: partner,
        docId: docId || '',
        amount: cleanAmount || '1000.00',
        paymentDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        method,
        note
      });
    } catch (err) {
      console.error(err);
    }
    onPaid();
  };

  return <CreateModal title="Record payment" onClose={onClose}><div className="payment-context"><span className="row-icon"><CreditCard size={17}/></span><div><b>{partner}</b><small>Amount due</small></div><strong>{amount}</strong></div><form className="modal-form" onSubmit={handleSubmit}><SelectField label="Payment type" options={['Receive','Send']}/><Field label="Partner" value={partner}/><Field label="Amount" value={amount}/><SelectField label="Payment method" value={method} onChange={setMethod} options={['Bank Transfer','Credit Card (...4242)','Cash','ACH']}/><Field label="Note" value={note} onChange={setNote} placeholder="Optional note"/><div className="modal-actions"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" testId="button-confirm-payment">Confirm payment <Check size={15}/></Button></div></form></CreateModal>;
}

function BillingPage({ mode }: { mode: 'bill'|'invoice' }) {
  const [rows, setRows] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [partnerInput, setPartnerInput] = useState('');
  const [amountInput, setAmountInput] = useState('2400.00');

  const title = mode === 'bill' ? 'Vendor bills' : 'Customer invoices';
  const doc = mode === 'bill' ? 'Vendor bill' : 'Customer invoice';

  const loadData = async () => {
    try {
      if (mode === 'bill') {
        const res = await api.getVendorBills();
        if (res.vendorBills?.length) {
          setRows(res.vendorBills.map((b: any) => ({
            id: b.billId || `BILL-${b.id}`,
            no: b.refNo || 'REF',
            partner: b.vendorName,
            date: b.date,
            due: b.dueDate,
            total: `$${parseFloat(b.totalAmount).toFixed(2)}`,
            paid: `$${parseFloat(b.paidAmount || '0').toFixed(2)}`,
            status: b.status
          })));
        } else setRows(vendorBills);
      } else {
        const res = await api.getCustomerInvoices();
        if (res.customerInvoices?.length) {
          setRows(res.customerInvoices.map((i: any) => ({
            id: i.invoiceId || `INV-${i.id}`,
            no: i.refNo || 'REF',
            partner: i.customerName,
            date: i.date,
            due: i.dueDate,
            total: `$${parseFloat(i.totalAmount).toFixed(2)}`,
            paid: `$${parseFloat(i.paidAmount || '0').toFixed(2)}`,
            status: i.status
          })));
        } else setRows(customerInvoices);
      }
    } catch {
      setRows(mode === 'bill' ? vendorBills : customerInvoices);
    }
  };

  useEffect(() => { loadData(); }, [mode]);

  const handleCreateBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'bill') {
        await api.createVendorBill({ vendorName: partnerInput || 'New Vendor', totalAmount: amountInput || '1000.00', status: 'Not Paid' });
      } else {
        await api.createCustomerInvoice({ customerName: partnerInput || 'New Customer', totalAmount: amountInput || '1000.00', status: 'Not Paid' });
      }
    } catch {
      // fallback
    }
    setCreateModalOpen(false);
    setPartnerInput('');
    loadData();
  };

  return <><Breadcrumb section={mode === 'bill' ? 'Purchase' : 'Sales'} page={title}/><PageTitle eyebrow={`${mode === 'bill' ? 'PURCHASE' : 'SALES'} / SETTLEMENT`} title={title} detail="Keep every obligation visible until it is settled." action={<Button onClick={() => setCreateModalOpen(true)} testId={`button-new-${mode}`}><Plus size={16}/> New {doc.toLowerCase()}</Button>}/><div className="summary-strip"><div><span>Outstanding</span><strong>{mode === 'bill' ? '$7,890.50' : '$14,400.00'}</strong></div><div><span>Due this month</span><strong>{mode === 'bill' ? '$4,610.00' : '$9,600.00'}</strong></div><div><span>Settled this year</span><strong>{mode === 'bill' ? '$18,240.00' : '$42,810.00'}</strong></div></div><div className="table-card"><table><thead><tr><th>{mode === 'bill' ? 'Bill' : 'Invoice'}</th><th>{mode === 'bill' ? 'Vendor' : 'Customer'}</th><th>Bill date</th><th>Due date</th><th>Total</th><th>Amount due</th><th>Status</th><th/></tr></thead><tbody>{rows.map(r => <tr key={r.id} data-testid={`row-billing-${r.id}`}><td><div className="cell-primary"><span className="doc-icon"><FileText size={15}/></span><div><b>{r.id}</b><small>{r.no}</small></div></div></td><td>{r.partner}</td><td>{r.date}</td><td>{r.due}</td><td className="money">{r.total}</td><td className="money">{r.status === 'Paid' ? '$0.00' : r.total}</td><td><StatusPill status={r.status}/></td><td><Button variant="secondary" className="mini-btn" onClick={() => setSelected(r)} disabled={r.status === 'Paid'} testId={`button-pay-${r.id}`}>{r.status === 'Paid' ? 'Settled' : 'Pay'}</Button></td></tr>)}</tbody></table></div>{selected && <PaymentModal partner={selected.partner} amount={selected.total} docId={selected.id} onClose={() => setSelected(null)} onPaid={() => { setRows(rows.map(r => r.id === selected.id ? {...r, status: 'Paid', paid: r.total} : r)); setSelected(null); loadData(); }}/>}{createModalOpen && <CreateModal title={`New ${doc}`} onClose={() => setCreateModalOpen(false)}><form className="modal-form" onSubmit={handleCreateBilling}><Field label={mode === 'bill' ? 'Vendor Name' : 'Customer Name'} value={partnerInput} onChange={setPartnerInput} placeholder="Enter name"/><Field label="Total Amount ($)" value={amountInput} onChange={setAmountInput} placeholder="2400.00"/><div className="modal-actions"><Button variant="secondary" onClick={() => setCreateModalOpen(false)}>Cancel</Button><Button type="submit">Create {doc}</Button></div></form></CreateModal>}</>;
}

function BudgetsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [targetInput, setTargetInput] = useState('50000.00');
  const [, setLocation] = useLocation();

  const loadBudgets = async () => {
    try {
      const res = await api.getBudgets();
      if (res.budgets?.length) setItems(res.budgets);
      else setItems(budgets);
    } catch {
      setItems(budgets);
    }
  };

  useEffect(() => { loadBudgets(); }, []);

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createBudget({
        name: nameInput || 'New Operations Budget',
        period: 'Q1 2026',
        owner: 'Mara Chen',
        analytic: 'ANC-001 Operations',
        type: 'Expense',
        target: `$${parseFloat(targetInput || '50000').toFixed(2)}`,
        committed: '$0.00',
        achieved: '$0.00',
        pct: 0,
        status: 'Draft'
      });
      setItems([res.budget, ...items]);
    } catch {
      setItems([{ id: Date.now(), budgetId: 'BDG-99', name: nameInput || 'New Budget', period: 'Q1 2026', owner: 'Mara Chen', analytic: 'ANC-001 Operations', type: 'Expense', target: `$${targetInput}`, committed: '$0.00', achieved: '$0.00', pct: 0, status: 'Draft' }, ...items]);
    }
    setModalOpen(false);
  };

  const revise = async (b: any) => {
    const revised = await mockRevise({...b, id: `${b.id}-R`, name: `${b.name} Revised`, status: 'Draft', linked: b.id});
    setItems(v => [...v.map(x => x.id === b.id ? {...x, linked: revised.id} : x), revised]);
  };

  return <><Breadcrumb section="Reports" page="Budgets"/><PageTitle eyebrow="REPORTS / PLANNING" title="Budgets" detail="A measured view of what you planned, committed, and achieved." action={<Button onClick={() => setModalOpen(true)} testId="button-new-budget"><Plus size={16}/> New budget</Button>}/><div className="budget-grid">{items.map(b => <div className="budget-card" key={b.id} data-testid={`card-budget-${b.id}`}><div className="budget-card-top"><div><span className="eyebrow">{b.budgetId || b.id}</span><h3>{b.name}</h3><p>{b.period}</p></div><StatusPill status={b.status}/></div><div className="budget-owner"><span className="avatar avatar-small">{b.owner ? b.owner.split(' ').map((x: string) => x[0]).join('') : 'MC'}</span><span>Responsible <b>{b.owner || 'Mara Chen'}</b></span>{b.linked && <button onClick={() => setLocation('/budgets')} className="linked-badge" data-testid={`link-budget-${b.id}`}>Linked revision</button>}</div><div className="budget-progress"><div><span>Achieved</span><b>{b.pct || 0}%</b></div><div className="progress-track"><span style={{width: `${b.pct || 0}%`}}/></div></div><div className="budget-stats"><div><span>Committed</span><b>{b.committed || '$0.00'}</b></div><div><span>Achieved</span><b>{b.achieved || '$0.00'}</b></div><div><span>Target</span><b>{b.target}</b></div></div><div className="budget-bottom"><span>{b.analytic || 'ANC-001'} · {b.type}</span>{b.status === 'Confirmed' ? <Button variant="secondary" className="mini-btn" onClick={() => revise(b)} testId={`button-revise-${b.id}`}>Revise</Button> : <Button variant="ghost" className="mini-btn" onClick={() => setItems(items.map(x => x.id === b.id ? {...x,status:'Confirmed'} : x))}>Confirm</Button>}</div></div>)}</div>{modalOpen && <CreateModal title="New budget" onClose={() => setModalOpen(false)}><form className="modal-form" onSubmit={handleCreateBudget}><Field label="Budget Title" value={nameInput} onChange={setNameInput} placeholder="e.g. Studio Operations Q2"/><Field label="Target Budget ($)" value={targetInput} onChange={setTargetInput} placeholder="50000.00"/><div className="modal-actions"><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit">Create Budget</Button></div></form></CreateModal>}</>;
}
function AnalyticalReport() { const [view,setView]=useState<'list'|'kanban'>('list'); return <><Breadcrumb section="Reports" page="Analytical budgets"/><PageTitle eyebrow="REPORTS / ANALYSIS" title="Analytical budgets report" detail="A compact read on each linked analytical account." action={<Button variant="secondary"><Download size={15}/> Download</Button>}/><div className="toolbar"><div className="search-field"><Search size={16}/><input placeholder="Search analytical budgets"/></div><ViewToggle view={view} setView={setView}/></div>{view === 'list' ? <div className="table-card"><table><thead><tr><th>Budget</th><th>Start date</th><th>End date</th><th>Status</th><th>Budget</th><th/></tr></thead><tbody>{budgets.map(b=><tr key={b.id}><td><b>{b.name}</b><small className="block">{b.analytic}</small></td><td>Jan 01, 2026</td><td>Dec 31, 2026</td><td><StatusPill status={b.status}/></td><td className="money">{b.target}</td><td><Pie value={b.pct}/></td></tr>)}</tbody></table></div> : <div className="report-budget-kanban">{budgets.map(b=><div className="analytic-tile" key={b.id}><Pie value={b.pct}/><div><span className="eyebrow">{b.id}</span><h3>{b.name}</h3><p>{b.period}</p><StatusPill status={b.status}/></div></div>)}</div>}</>; }
function Pie({value}:{value:number}) { return <div className="pie" style={({ '--value': `${value * 3.6}deg` } as any)}><span>{value}%</span></div>; }

function ReportsPage({ type }: { type: 'pl'|'bs' }) { const bs=type==='bs'; return <><Breadcrumb section="Reports" page={bs ? 'Balance sheet' : 'Profit & loss'}/><PageTitle eyebrow="REPORTS / FINANCIALS" title={bs ? 'Balance sheet' : 'Profit & loss'} detail={bs ? 'A steady view of what the business owns and owes.' : 'Income and expenses, held in clear proportion.'} action={<div className="report-actions"><SelectField label="" options={['This quarter','This year','Last quarter']}/><button className="icon-btn" data-testid="button-print-report"><Printer size={17}/></button><button className="icon-btn" data-testid="button-download-report"><Download size={17}/></button></div>}/>{bs ? <div className="report-columns"><ReportSection title="Assets" rows={[['Operating Bank — Mercury','$84,219.42'],['Accounts Receivable','$32,278.00'],['Petty Cash','$1,280.00']]} total="$117,777.42"/><ReportSection title="Liabilities & Capital" rows={[['Accounts Payable','$9,955.20'],['Accrued Contractor Costs','$6,140.00'],['Owner Capital','$101,682.22']]} total="$117,777.42"/></div> : <div className="statement-card"><ReportSection title="Income" rows={[['Professional Services','$164,820.00'],['Product Sales','$28,440.00'],['Other income','$1,840.00']]} total="$195,100.00"/><ReportSection title="Expenses" rows={[['Contractor Expense','$48,210.50'],['Software & Subscriptions','$8,942.16'],['Office & occupancy','$12,480.00'],['Marketing & growth','$16,220.00']]} total="$85,852.66"/><div className="net-row"><span>Net income</span><strong>$109,247.34</strong><small>55.99% margin</small></div></div>}</>; }
function ReportSection({title,rows,total}:{title:string;rows:string[][];total:string}) { return <section className="report-section"><div className="report-section-head"><h3>{title}</h3><span>{rows.length} accounts</span></div>{rows.map(r=><div className="report-row" key={r[0]}><span>{r[0]}</span><b>{r[1]}</b></div>)}<div className="report-total"><span>Total {title.toLowerCase()}</span><strong>{total}</strong></div></section>; }

function UserPage() { const [,setLocation]=useLocation(); return <><Breadcrumb section="Manage" page="Create user"/><PageTitle eyebrow="ADMIN / ACCESS" title="Create user" detail="Invite someone into the workspace with the right level of reach."/><div className="form-card user-form"><div className="card-section-head"><div><span className="eyebrow">NEW WORKSPACE MEMBER</span><h3>Identity & access</h3></div><span className="row-icon"><UserPlus size={18}/></span></div><div className="form-grid"><Field label="Name" placeholder="Eli Brooks"/><Field label="Login ID" placeholder="eli.brooks" helper="6–12 characters · must be unique"/><Field label="E-mail" placeholder="eli@company.com" helper="Must not be a duplicate"/><SelectField label="Role" options={['User','Accountant','Administrator']}/><Field label="Password" placeholder="••••••••" type="password" helper="8+ chars · lowercase · uppercase · special"/><Field label="Re-enter password" placeholder="••••••••" type="password"/></div><div className="form-card-note"><ShieldCheck size={15}/> Admin and Accountant accounts are created internally. Public signups always start as User.</div><div className="form-actions"><Button variant="secondary" onClick={() => setLocation('/dashboard')}>Cancel</Button><Button onClick={() => setLocation('/dashboard')} testId="button-create-user">Create user <ArrowRight size={15}/></Button></div></div></>; }

function Portal({ role, setRole }: { role?: Role; setRole?: (r: Role) => void }) { 
  const [rows,setRows]=useState(customerInvoices); 
  const [menu,setMenu]=useState(false); 
  const [tab, setTab] = useState<'invoices'|'ledger'>('invoices');
  const [, setLocation] = useLocation();
  
  return <div className="portal-page">
    <header className="portal-bar">
      <Link href="/" className="brand-lockup brand-dark" data-testid="link-portal-logo"><Logo/><span>ANCHOR</span></Link>
      <span className="portal-divider"/><span className="portal-workspace">Hearth & Form Studio</span>
      <div className="portal-right">
        {role && setRole && (
          <div className="role-switcher-dropdown">
            <select value={role} onChange={e => {
              const newRole = e.target.value as Role;
              setRole(newRole);
              if (newRole !== 'User') setLocation('/dashboard');
            }} className="role-badge-select" data-testid="select-portal-role">
              <option value="Admin">Admin Role</option>
              <option value="Accountant">Accountant Role</option>
              <option value="User">User Role</option>
            </select>
          </div>
        )}
        <button className="icon-btn"><HelpCircle size={17}/></button>
        <button className="portal-account" onClick={()=>setMenu(!menu)} data-testid="button-portal-account">
          <span className="avatar avatar-small">MC</span>Mara Chen<ChevronDown size={14}/>
        </button>
        {menu&&<div className="account-menu">
          <Link href="/forgot-password" data-testid="link-portal-reset">Password Reset</Link>
          <Link href="/" data-testid="link-portal-logout">Log Out</Link>
        </div>}
      </div>
    </header>
    
    <main className="portal-main-grid">
      <div className="portal-content">
        <div className="portal-header-band">
          <div>
            <div className="eyebrow">CUSTOMER PORTAL</div>
            <h1>Your account, in one place.</h1>
            <p className="portal-lede">Hello Mara. Here is the current view of your account with Hearth & Form Studio.</p>
          </div>
          <div className="portal-client-badge">
            <span className="avatar avatar-medium">HF</span>
            <div>
              <b>Hearth & Form Studio</b>
              <small>Client Account · ID: ACC-88421</small>
            </div>
          </div>
        </div>
        
        <div className="portal-summary-grid">
          <div className="portal-summary-card">
            <div className="summary-card-head">
              <span>Open balance</span>
              <CreditCard size={17}/>
            </div>
            <strong>$14,400.00</strong>
            <small>2 unpaid invoices</small>
          </div>

          <div className="portal-summary-card">
            <div className="summary-card-head">
              <span>Next due</span>
              <Clock size={17}/>
            </div>
            <strong>Apr 09, 2026</strong>
            <small>INV/2026/0010 ($9,600.00)</small>
          </div>

          <div className="portal-summary-card">
            <div className="summary-card-head">
              <span>Total Invoiced</span>
              <Receipt size={17}/>
            </div>
            <strong>$34,000.00</strong>
            <small>5 invoices recorded</small>
          </div>

          <div className="portal-summary-card">
            <div className="summary-card-head">
              <span>Account status</span>
              <ShieldCheck size={17}/>
            </div>
            <strong className="green-text">In good standing</strong>
            <small>Verified client account</small>
          </div>
        </div>
        
        <div className="portal-tabs">
          <button className={tab === 'invoices' ? 'active' : ''} onClick={() => setTab('invoices')}>Invoices</button>
          <button className={tab === 'ledger' ? 'active' : ''} onClick={() => setTab('ledger')}>Recent Payments</button>
        </div>

        {tab === 'invoices' ? (
          <div className="portal-table">
            <div className="portal-table-head">
              <span/>
              <span>Invoice</span>
              <span>Invoice date</span>
              <span>Due date</span>
              <span>Amount due</span>
              <span>Status</span>
              <span/>
            </div>
            {rows.map(r=><div className="portal-row" key={r.id} data-testid={`portal-invoice-${r.id}`}>
              <ChevronRight size={14} className="row-chevron"/>
              <div>
                <b>{r.id}</b>
                <small className="ref-code">{r.no}</small>
              </div>
              <span>{r.date}</span>
              <span>{r.due}</span>
              <strong>{r.status==='Paid' ? '$0.00' : r.total}</strong>
              <div className="status-pill-wrap"><StatusPill status={r.status}/></div>
              <div className="portal-row-actions">
                <button className="icon-btn" title="Download PDF"><Download size={15}/></button>
                <Button variant={r.status==='Paid'?'ghost':'primary'} className="mini-btn" onClick={()=>setRows(rows.map(x=>x.id===r.id?{...x,status:'Paid',paid:x.total}:x))} testId={`button-portal-pay-${r.id}`}>{r.status==='Paid'?'Paid':'Pay now'}</Button>
              </div>
            </div>)}
          </div>
        ) : (
          <div className="portal-table">
            <div className="portal-table-head">
              <span/>
              <span>Payment Date</span>
              <span>Reference</span>
              <span>Method</span>
              <span>Amount</span>
              <span>Status</span>
              <span/>
            </div>
            <div className="portal-row">
              <ChevronRight size={14} className="row-chevron"/>
              <span>Mar 12, 2026</span>
              <span>INV-0032</span>
              <span>Credit Card (...4242)</span>
              <strong>$2,400.00</strong>
              <div className="status-pill-wrap"><StatusPill status="Confirmed"/></div>
              <div className="portal-row-actions"><button className="icon-btn" title="Download Receipt"><Download size={15}/></button></div>
            </div>
            <div className="portal-row">
              <ChevronRight size={14} className="row-chevron"/>
              <span>Feb 10, 2026</span>
              <span>INV-0028</span>
              <span>ACH Transfer</span>
              <strong>$4,800.00</strong>
              <div className="status-pill-wrap"><StatusPill status="Confirmed"/></div>
              <div className="portal-row-actions"><button className="icon-btn" title="Download Receipt"><Download size={15}/></button></div>
            </div>
          </div>
        )}
        <div className="portal-note"><ShieldCheck size={16}/><span><b>Payments are secure.</b> Your payment is recorded directly to the workspace ledger.</span></div>
      </div>
      
      <aside className="portal-sidebar">
        <div className="sidebar-card">
          <h3>Billing Information</h3>
          <p>
            <strong>Mara Chen</strong><br/>
            Hearth & Form Studio<br/>
            123 Main St, Suite 400<br/>
            New York, NY 10001<br/>
            <small style={{ color: '#8a7b6c', display: 'block', marginTop: '6px' }}>Tax ID: US-9842104</small>
          </p>
          <button className="text-link mt-2">Update details</button>
        </div>

        <div className="sidebar-card">
          <h3>Saved Payment Methods</h3>
          <div className="payment-method-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', fontSize: '11px', color: 'var(--ink)' }}>
            <CreditCard size={18} style={{ color: 'var(--cocoa)' }}/>
            <div>
              <b>Visa ending in 4242</b>
              <small style={{ display: 'block', color: '#8c7e70', fontSize: '9px' }}>Expires 08/28 · Default method</small>
            </div>
          </div>
          <button className="text-link mt-2" style={{ fontSize: '10px' }}>+ Add payment method</button>
        </div>

        <div className="sidebar-card">
          <h3>Contact Accountant</h3>
          <form className="contact-form" onSubmit={e => {e.preventDefault(); alert("Message sent");}}>
            <textarea placeholder="Ask a question about an invoice or payment..." rows={3}/>
            <Button type="submit" className="w-full">Send Message</Button>
          </form>
        </div>
      </aside>
    </main>
  </div>;
}

function Beacon() { 
  const [open, setOpen] = useState(false); 
  const [listening, setListening] = useState(false); 
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<any[]>([]); 
  const [input, setInput] = useState(''); 
  const [, setLocation] = useLocation(); 

  const ask = (text: string) => { 
    if (!text.trim()) return; 
    const lower = text.toLowerCase();
    setMessages(v => [...v, { from: 'user', text }]);
    setInput('');
    setTyping(true);
    
    setTimeout(() => {
      setTyping(false);
      let replyText = "Here is what I found in your workspace.";
      let route: string | undefined = undefined;
      let cardType: string | undefined = undefined;

      if (lower.includes('add journal') || lower.includes('create journal') || lower.includes('how do i add journal') || lower.includes('new journal')) {
        replyText = "Opening the New Journal Entry form now. Enter the date, journal type, memo reference, and debit/credit line amounts.";
        route = '/journal-entries/new';
      } else if (lower.includes('journal')) {
        replyText = "Navigating to Journal Entries. Here you can inspect all double-entry ledger postings.";
        route = '/journal-entries';
      } else if (lower.includes('add contact') || lower.includes('new contact') || lower.includes('create contact')) {
        replyText = "Opening Contacts directory. Click '+ New contact' or fill out the master record modal.";
        route = '/contacts';
      } else if (lower.includes('contact') || lower.includes('customer') || lower.includes('vendor')) {
        replyText = "Navigating to your Contacts directory (Customers & Vendors).";
        route = '/contacts';
      } else if (lower.includes('add product') || lower.includes('create product') || lower.includes('new product')) {
        replyText = "Opening Products catalog. Click '+ New product' to add goods or services to your catalog.";
        route = '/products';
      } else if (lower.includes('product') || lower.includes('catalog')) {
        replyText = "Opening your Products & Services catalog.";
        route = '/products';
      } else if (lower.includes('add invoice') || lower.includes('create invoice') || lower.includes('new invoice')) {
        replyText = "Opening Customer Invoices. Click '+ New customer invoice' to issue a new bill.";
        route = '/customer-invoices';
      } else if (lower.includes('unpaid') || lower.includes('invoice')) {
        replyText = "You have unpaid invoices. Opening Customer Invoices dashboard.";
        route = '/customer-invoices';
        cardType = 'invoices';
      } else if (lower.includes('add bill') || lower.includes('create bill') || lower.includes('vendor bill')) {
        replyText = "Opening Vendor Bills. Click '+ New vendor bill' to log an incoming bill.";
        route = '/vendor-bills';
      } else if (lower.includes('sales order') || lower.includes('sales')) {
        replyText = "Navigating to Sales Orders workflow.";
        route = '/sales-orders';
      } else if (lower.includes('purchase order') || lower.includes('purchase')) {
        replyText = "Navigating to Purchase Orders workflow.";
        route = '/purchase-orders';
      } else if (lower.includes('profit') || lower.includes('p&l') || lower.includes('income')) {
        replyText = "Opening the Profit & Loss statement report.";
        route = '/reports/profit-loss';
      } else if (lower.includes('balance') || lower.includes('sheet')) {
        replyText = "Opening Balance Sheet report. Total assets equal total liabilities & capital at $117,777.42.";
        route = '/reports/balance-sheet';
      } else if (lower.includes('budget')) {
        replyText = "Navigating to Cost Center Budgets & Analytical Reports.";
        route = '/budgets';
      } else if (lower.includes('account') || lower.includes('chart')) {
        replyText = "Opening Chart of Accounts register.";
        route = '/chart-of-accounts';
      }

      setMessages(v => [...v, {
        from: 'beacon',
        text: replyText,
        link: route,
        card: cardType
      }]);

      if (route) {
        setLocation(route);
      }
    }, 600);
  }; 
  
  return <>{open&&<motion.div initial={{opacity:0,scale:.96,y:12}} animate={{opacity:1,scale:1,y:0}} className="beacon-panel">
    <div className="beacon-head">
      <div className="beacon-title"><span className="beacon-symbol"><Zap size={16}/></span><div><b>Beacon</b><small>Ready when you are</small></div></div>
      <button className="icon-btn" onClick={()=>setOpen(false)} data-testid="button-close-beacon"><X size={17}/></button>
    </div>
    <div className="beacon-body">
      {messages.length===0&&<div className="beacon-welcome"><Sparkles size={19}/><p>Ask me to take you somewhere, or ask about your data.</p><div>{['How do I add journal entries','Show unpaid invoices','Go to contacts'].map(s=><button key={s} onClick={()=>ask(s)} data-testid={`button-suggestion-${s.slice(0,4).toLowerCase()}`}>{s}</button>)}</div></div>}
      
      {messages.map((m,i)=><div className={`beacon-message ${m.from}`} key={i}>
        <span>{m.text}</span>
        {m.card === 'invoices' && <div className="beacon-card">
          <div className="bc-row"><span>INV/2026/0012</span><strong>$4,800.00</strong><Button variant="secondary" className="mini-btn" onClick={()=>setLocation('/customer-invoices')}>Pay</Button></div>
          <div className="bc-row"><span>INV/2026/0010</span><strong>$9,600.00</strong><Button variant="secondary" className="mini-btn" onClick={()=>setLocation('/customer-invoices')}>Pay</Button></div>
        </div>}
        {m.link&&<button onClick={()=>setLocation(m.link!)} data-testid="button-beacon-navigation"><ArrowRight size={13}/> Open linked page</button>}
      </div>)}
      {typing && <div className="beacon-message beacon"><div className="typing-indicator"><span/><span/><span/></div></div>}
    </div>
    <form className="beacon-input" onSubmit={e=>{e.preventDefault();ask(input)}}>
      <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask Beacon anything... (e.g. 'how do I add journal')"/>
      <button type="button" className={listening?'listening':''} onClick={()=>{setListening(true);window.setTimeout(()=>setListening(false),1400)}} data-testid="button-beacon-mic"><Zap size={15}/></button>
    </form>
  </motion.div>}
  <button className={`beacon-trigger beacon-pulse ${open?'active':''}`} onClick={()=>setOpen(!open)} data-testid="button-open-beacon"><Zap size={20}/><span>Beacon</span></button></>; 
}

function RoutedApp() {
  const [role, setRoleState] = useState<Role>(() => (localStorage.getItem('anchor-role') as Role) || 'Admin');
  const [location] = useLocation();
  const setRole = (r: Role) => { setRoleState(r); localStorage.setItem('anchor-role', r); };
  
  const auth = ['/','/login','/signup','/forgot-password'].includes(location);
  if (auth) return <Switch><Route path="/" component={Landing}/><Route path="/login" component={() => <Login role={role} setRole={setRole}/>}/><Route path="/signup" component={() => <Signup role={role} setRole={setRole}/>}/><Route path="/forgot-password" component={ForgotPassword}/></Switch>;
  
  if (role === 'User') {
    return <>
      <Portal role={role} setRole={setRole}/>
      <Beacon/>
    </>;
  }

  return <AppShell role={role} setRole={setRole}>
    <Switch>
      <Route path="/dashboard" component={Dashboard}/>
      {role === 'Admin' && <Route path="/users/new" component={UserPage}/>}
      <Route path="/contacts" component={()=><MasterPage kind="contacts"/>}/>
      <Route path="/products" component={()=><MasterPage kind="products"/>}/>
      <Route path="/analytics" component={()=><MasterPage kind="analytics"/>}/>
      <Route path="/chart-of-accounts" component={()=><MasterPage kind="accounts"/>}/>
      <Route path="/journals" component={()=><MasterPage kind="journals"/>}/>
      <Route path="/journal-entries" component={()=><TransactionList type="journal"/>}/>
      <Route path="/journal-entries/new" component={()=><DetailForm mode="journal"/>}/>
      <Route path="/purchase-orders" component={()=><TransactionList type="purchase"/>}/>
      <Route path="/purchase-orders/new" component={()=><DetailForm mode="purchase"/>}/>
      <Route path="/purchase-orders/:id" component={()=><DetailForm mode="purchase"/>}/>
      <Route path="/vendor-bills" component={()=><BillingPage mode="bill"/>}/>
      <Route path="/sales-orders" component={()=><TransactionList type="sales"/>}/>
      <Route path="/sales-orders/new" component={()=><DetailForm mode="sales"/>}/>
      <Route path="/sales-orders/:id" component={()=><DetailForm mode="sales"/>}/>
      <Route path="/customer-invoices" component={()=><BillingPage mode="invoice"/>}/>
      <Route path="/budgets" component={BudgetsPage}/>
      <Route path="/analytical-budgets-report" component={AnalyticalReport}/>
      <Route path="/reports/profit-loss" component={()=><ReportsPage type="pl"/>}/>
      <Route path="/reports/balance-sheet" component={()=><ReportsPage type="bs"/>}/>
      <Route path="/portal" component={() => <Portal role={role} setRole={setRole}/>}/>
      <Route component={Dashboard}/>
    </Switch>
  </AppShell>;
}
function App() { return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/,'')}><ErrorBoundary><RoutedApp/></ErrorBoundary></WouterRouter><Toaster/></TooltipProvider></QueryClientProvider>; }
export default App;