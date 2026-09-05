import { useEffect, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  Activity, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, BarChart3, Bell, BookOpen,
  BriefcaseBusiness, Calculator, Check, ChevronDown,
  CreditCard, Download, FileBarChart, FileText, Filter, HelpCircle, Home, Landmark,
  LayoutGrid, LifeBuoy, List, LogOut, MoreHorizontal, Package, PanelLeft,
  Plus, Printer, Receipt, Search, Settings, ShieldCheck, Sparkles, TrendingUp,
  UserPlus, Users, X, Zap
} from 'lucide-react';
import {
  accounts, budgets, contacts, customerInvoices, journalEntries, journals, products,
  purchaseOrders, salesOrders, vendorBills
} from '@/mock-data';
import { mockPay, mockRevise } from '@/services/mock-services';

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

function MasterPage({ kind }: { kind: 'contacts'|'products'|'analytics'|'accounts'|'journals' }) {
  const [view, setView] = useState<'list'|'kanban'>('list'); const [query, setQuery] = useState(''); const [modal, setModal] = useState(false);
  const config = {
    contacts: { title: 'Contacts', eyebrow: 'ACCOUNT / MASTER DATA', detail: 'Customers and vendors your workspace relies on.', action: 'New contact', rows: contacts, cols: ['Contact','Type','Email','Location','Balance'], icon: Users },
    products: { title: 'Products', eyebrow: 'ACCOUNT / MASTER DATA', detail: 'The goods and services that move through your books.', action: 'New product', rows: products, cols: ['Product','Type','Category','Sales price','Cost'], icon: Package },
    analytics: { title: 'Analytical accounts', eyebrow: 'ACCOUNT / CONTROL', detail: 'Track performance against linked budgets.', action: 'New analytical account', rows: budgets.map(b => ({...b, id: b.id, name: b.analytic, type: b.type, category: b.period, sales: b.achieved, cost: b.target})), cols: ['Analytic account','Type','Period','Achieved','Budget'], icon: Activity },
    accounts: { title: 'Chart of accounts', eyebrow: 'ACCOUNT / STRUCTURE', detail: 'A clean, dependable map of every account.', action: 'New account', rows: accounts, cols: ['Account','Type','Balance'], icon: Landmark },
    journals: { title: 'Journals', eyebrow: 'ACCOUNT / STRUCTURE', detail: 'Default accounts for each kind of entry.', action: 'New journal', rows: journals, cols: ['Journal','Type','Default account'], icon: BookOpen },
  }[kind];
  const rows = config.rows.filter((r: any) => JSON.stringify(r).toLowerCase().includes(query.toLowerCase()));
  return <><Breadcrumb section={config.eyebrow.split(' / ')[0]} page={config.title}/><PageTitle eyebrow={config.eyebrow} title={config.title} detail={config.detail} action={<Button onClick={() => setModal(true)} testId={`button-new-${kind}`}><Plus size={16}/>{config.action}</Button>}/><div className="toolbar"><div className="search-field"><Search size={16}/><input data-testid={`input-search-${kind}`} placeholder={`Search ${config.title.toLowerCase()}`} value={query} onChange={e => setQuery(e.target.value)}/></div><div className="toolbar-right"><Button variant="ghost" testId={`button-filter-${kind}`}><Filter size={15}/> Filter</Button><ViewToggle view={view} setView={setView}/></div></div>{view === 'list' ? <div className="table-card"><table><thead><tr>{config.cols.map(c => <th key={c}>{c}</th>)}<th/></tr></thead><tbody>{rows.map((r: any, i) => <tr key={r.id} data-testid={`row-${kind}-${r.id}`}><td><div className="cell-primary"><span className="row-icon"><config.icon size={15}/></span><div><b>{r.name || r.partner || r.label}</b><small>{r.id}</small></div></div></td><td>{r.type && <StatusPill status={r.type}/>}</td><td>{r.email || r.account || r.category || r.period || r.defaultAccount || '—'}</td>{kind === 'contacts' && <td>{r.city}</td>}{kind === 'products' && <td>{r.sales}</td>}{kind === 'analytics' && <td>{r.achieved}</td>}{kind === 'accounts' && <td className="money">{r.balance}</td>}{kind === 'journals' && <td className="text-cocoa">{r.account}</td>}<td><button className="more-btn" data-testid={`button-more-${kind}-${r.id}`}><MoreHorizontal size={17}/></button></td></tr>)}</tbody></table></div> : <div className="kanban-grid">{['Customer','Vendor','Service','Asset'].filter(group => rows.some((r: any) => r.type === group) || kind === 'contacts').map(group => <div className="kanban-column" key={group}><div className="kanban-head"><span>{group}</span><em>{rows.filter((r: any) => r.type === group).length || 2}</em></div>{rows.filter((r: any) => kind === 'contacts' ? r.type === group : true).slice(0,3).map((r: any) => <div className="kanban-card" key={r.id}><div><b>{r.name || r.partner}</b><StatusPill status={r.type || 'Confirmed'}/></div><small>{r.email || r.category || r.items || r.account}</small><span>{r.balance || r.sales || r.achieved || 'Active'}</span></div>)}</div>)}</div>}{modal && <CreateModal title={config.action} onClose={() => setModal(false)}><form className="modal-form" onSubmit={e => {e.preventDefault();setModal(false)}}><Field label={kind === 'accounts' ? 'Account name' : kind === 'journals' ? 'Journal name' : 'Name'} placeholder={`Enter ${config.title.toLowerCase()} name`}/><SelectField label="Type" options={kind === 'accounts' ? ['Asset','Liability','Income','Expense','Bank','Cash','Capital'] : kind === 'contacts' ? ['Customer','Vendor'] : ['Service','Goods','Combo']}/><Field label="Description" placeholder="Optional note"/><div className="modal-actions"><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button type="submit" testId={`button-save-${kind}`}>Create record</Button></div></form></CreateModal>}</>;
}

function TransactionList({ type }: { type: 'purchase'|'sales'|'journal' }) {
  const [location, setLocation] = useLocation(); const [view, setView] = useState<'list'|'kanban'>('list'); const [rows, setRows] = useState<any[]>(type === 'purchase' ? purchaseOrders : type === 'sales' ? salesOrders : journalEntries);
  const isJournal = type === 'journal'; const title = type === 'purchase' ? 'Purchase orders' : type === 'sales' ? 'Sales orders' : 'Journal entries'; const singular = type === 'purchase' ? 'purchase order' : type === 'sales' ? 'sales order' : 'journal entry';
  const statuses = isJournal ? ['Draft','Posted'] : ['Draft','Confirmed','Billed'];
  return <><Breadcrumb section={isJournal ? 'Account' : type === 'purchase' ? 'Purchase' : 'Sales'} page={title}/><PageTitle eyebrow={`${isJournal ? 'ACCOUNTING' : type.toUpperCase()} / WORKFLOW`} title={title} detail={`Manage ${singular}s with a clear, considered trail.`} action={<Button onClick={() => setLocation(isJournal ? '/journal-entries/new' : type === 'purchase' ? '/purchase-orders/new' : '/sales-orders/new')} testId={`button-new-${type}`}><Plus size={16}/> New {singular}</Button>}/><div className="toolbar"><div className="search-field"><Search size={16}/><input placeholder={`Search ${title.toLowerCase()}`} data-testid={`input-search-${type}`}/></div><div className="toolbar-right"><Button variant="ghost"><Filter size={15}/> Filter</Button><ViewToggle view={view} setView={setView}/></div></div>{view === 'list' ? <div className="table-card"><table><thead><tr>{(isJournal ? ['Entry','Date','Journal','Memo','Amount','Status'] : ['Number', type === 'purchase' ? 'Vendor' : 'Customer','Date','Items','Total','Status']).map(x => <th key={x}>{x}</th>)}<th/></tr></thead><tbody>{rows.map((r, i) => <tr key={r.id} data-testid={`row-${type}-${r.id}`} onClick={() => !isJournal && setLocation(type === 'purchase' ? '/purchase-orders/PO-detail' : '/sales-orders/SO-detail')}><td><div className="cell-primary"><span className="doc-icon">{isJournal ? <BookOpen size={15}/> : <FileText size={15}/>}</span><div><b>{r.id}</b><small>{r.no || 'Auto-numbered record'}</small></div></div></td><td>{r.partner || r.date}</td><td>{r.partner ? r.date : r.journal}</td><td>{r.items || r.memo}</td><td className="money">{r.total || r.amount}</td><td><StatusPill status={r.status}/></td><td><button className="more-btn"><MoreHorizontal size={17}/></button></td></tr>)}</tbody></table></div> : <div className="kanban-grid transaction-kanban">{statuses.map(s => <div className="kanban-column" key={s}><div className="kanban-head"><span>{s}</span><em>{rows.filter(r => r.status === s).length}</em></div>{rows.filter(r => r.status === s).map(r => <div className="kanban-card" key={r.id}><div><b>{r.id}</b><StatusPill status={r.status}/></div><strong>{r.partner || r.memo}</strong><small>{r.date}</small><span>{r.total || r.amount}</span></div>)}</div>)}</div>}</>;
}

function DetailForm({ mode }: { mode: 'purchase'|'sales'|'journal' }) {
  const [, setLocation] = useLocation(); const [step, setStep] = useState('Draft'); const [balanced, setBalanced] = useState(false); const isJournal = mode === 'journal'; const isPurchase = mode === 'purchase'; const label = isJournal ? 'Journal entry' : isPurchase ? 'Purchase order' : 'Sales order';
  return <><Breadcrumb section={isJournal ? 'Account' : isPurchase ? 'Purchase' : 'Sales'} page={`New ${label}`}/><PageTitle eyebrow={`${mode.toUpperCase()} / NEW`} title={`New ${label}`} detail={isJournal ? 'Record a precise, balanced movement in the books.' : 'Build the next record from a trusted starting point.'} action={<div className="stage-actions"><StatusPill status={step}/><Button variant="ghost" onClick={() => setLocation(isJournal ? '/journal-entries' : isPurchase ? '/purchase-orders' : '/sales-orders')}>Cancel</Button><Button onClick={() => setStep(isJournal ? 'Posted' : 'Confirmed')}>{isJournal ? 'Post entry' : 'Confirm'} <ArrowRight size={15}/></Button></div>}/><div className="form-layout"><section className="form-card"><div className="card-section-head"><div><span className="eyebrow">RECORD DETAILS</span><h3>{isJournal ? 'Entry information' : `${label} information`}</h3></div><span className="auto-number">{isJournal ? 'JE-2026-019' : isPurchase ? 'P00043' : 'S00039'}</span></div><div className="form-grid"><Field label={isJournal ? 'Accounting date' : `${isPurchase ? 'Vendor' : 'Customer'}`} placeholder={isJournal ? 'Mar 24, 2026' : isPurchase ? 'Select vendor' : 'Select customer'}/><Field label={isJournal ? 'Journal' : 'Date'} placeholder={isJournal ? 'Select journal' : 'Mar 24, 2026'}/><Field label={isJournal ? 'Reference / memo' : 'Payment terms'} placeholder={isJournal ? 'Short description' : 'Net 30'}/></div></section>{!isJournal && <div className="amber-banner"><Zap size={16}/><span><b>Budget watch</b><br/>This commitment will use 8.4% of the linked Operations budget.</span><button>Review budget</button></div>}<section className="form-card line-items"><div className="card-section-head"><div><span className="eyebrow">LINE ITEMS</span><h3>{isJournal ? 'Debit & credit lines' : 'Products and services'}</h3></div><Button variant="ghost"><Plus size={14}/> Add line</Button></div><table><thead><tr>{(isJournal ? ['Account','Analytic tag','Debit','Credit'] : ['Product','Analytic tag','Qty','Unit price','Line total']).map(h => <th key={h}>{h}</th>)}</tr></thead><tbody><tr>{(isJournal ? ['1200 · Accounts Receivable','Growth','$4,800.00','—'] : ['Brand strategy sprint','Growth','1','$4,800.00','$4,800.00']).map((x,i) => <td key={i}><input defaultValue={x} data-testid={`input-line-${i}`}/></td>)}</tr><tr>{(isJournal ? ['4100 · Professional Services','Growth','—','$4,800.00'] : ['Design system retainer','Operations','1','$2,400.00','$2,400.00']).map((x,i) => <td key={i}><input defaultValue={x}/></td>)}</tr></tbody><tfoot><tr><td colSpan={isJournal ? 2 : 4}><b>{isJournal ? balanced ? 'Balanced and ready to post' : 'Totals do not match' : '2 line items'}</b></td><td className={isJournal && !balanced ? 'danger-text' : 'money'}>{isJournal ? '$4,800.00' : '$7,200.00'}</td></tr></tfoot></table>{isJournal && <div className={`balance-toggle ${balanced ? 'balanced' : ''}`}><span>{balanced ? <Check size={15}/> : <X size={15}/>} Visual balance state</span><button onClick={() => setBalanced(!balanced)} data-testid="button-toggle-balance">{balanced ? 'Show mismatch' : 'Mark balanced'}</button></div>}</section></div></>;
}

function PaymentModal({ partner, amount, onClose, onPaid }: { partner: string; amount: string; onClose: () => void; onPaid: () => void }) {
  return <CreateModal title="Record payment" onClose={onClose}><div className="payment-context"><span className="row-icon"><CreditCard size={17}/></span><div><b>{partner}</b><small>Amount due</small></div><strong>{amount}</strong></div><form className="modal-form" onSubmit={e => {e.preventDefault(); onPaid();}}><SelectField label="Payment type" options={['Send','Receive']}/><Field label="Partner" value={partner}/><Field label="Amount" value={amount}/><Field label="Payment date" value="Mar 24, 2026"/><SelectField label="Payment via" options={['Bank','Cash']}/><Field label="Note" placeholder="Optional note"/><div className="payment-options"><label className="check-label"><input type="checkbox"/> Print receipt</label><label className="check-label"><input type="checkbox"/> Send confirmation</label></div><div className="modal-actions"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" testId="button-confirm-payment">Confirm payment <Check size={15}/></Button></div></form></CreateModal>;
}
function BillingPage({ mode }: { mode: 'bill'|'invoice' }) {
  const [rows, setRows] = useState<any[]>(mode === 'bill' ? vendorBills : customerInvoices); const [selected, setSelected] = useState<any | null>(null); const title = mode === 'bill' ? 'Vendor bills' : 'Customer invoices'; const doc = mode === 'bill' ? 'Vendor bill' : 'Customer invoice';
  return <><Breadcrumb section={mode === 'bill' ? 'Purchase' : 'Sales'} page={title}/><PageTitle eyebrow={`${mode === 'bill' ? 'PURCHASE' : 'SALES'} / SETTLEMENT`} title={title} detail="Keep every obligation visible until it is settled." action={<Button testId={`button-new-${mode}`}><Plus size={16}/> New {doc.toLowerCase()}</Button>}/><div className="summary-strip"><div><span>Outstanding</span><strong>{mode === 'bill' ? '$7,890.50' : '$14,400.00'}</strong></div><div><span>Due this month</span><strong>{mode === 'bill' ? '$4,610.00' : '$9,600.00'}</strong></div><div><span>Settled this year</span><strong>{mode === 'bill' ? '$18,240.00' : '$42,810.00'}</strong></div></div><div className="table-card"><table><thead><tr><th>{mode === 'bill' ? 'Bill' : 'Invoice'}</th><th>{mode === 'bill' ? 'Vendor' : 'Customer'}</th><th>Bill date</th><th>Due date</th><th>Total</th><th>Amount due</th><th>Status</th><th/></tr></thead><tbody>{rows.map(r => <tr key={r.id} data-testid={`row-billing-${r.id}`}><td><div className="cell-primary"><span className="doc-icon"><FileText size={15}/></span><div><b>{r.id}</b><small>{r.no}</small></div></div></td><td>{r.partner}</td><td>{r.date}</td><td>{r.due}</td><td className="money">{r.total}</td><td className="money">{r.paid === '$0.00' ? r.total : r.paid === r.total ? '$0.00' : '$2,610.00'}</td><td><StatusPill status={r.status}/></td><td><Button variant="secondary" className="mini-btn" onClick={() => setSelected(r)} disabled={r.status === 'Paid'} testId={`button-pay-${r.id}`}>{r.status === 'Paid' ? 'Settled' : 'Pay'}</Button></td></tr>)}</tbody></table></div>{selected && <PaymentModal partner={selected.partner} amount={selected.total} onClose={() => setSelected(null)} onPaid={() => { mockPay(selected.id); setRows(rows.map(r => r.id === selected.id ? {...r, status: 'Paid', paid: r.total} : r)); setSelected(null); }}/>}</>;
}

function BudgetsPage() {
  const [items, setItems] = useState<any[]>(budgets); const [, setLocation] = useLocation();
  const revise = async (b: any) => { const revised = await mockRevise({...b, id: `${b.id}-R`, name: `${b.name} Revised`, status: 'Draft', linked: b.id}); setItems(v => [...v.map(x => x.id === b.id ? {...x, linked: revised.id} : x), revised]); };
  return <><Breadcrumb section="Reports" page="Budgets"/><PageTitle eyebrow="REPORTS / PLANNING" title="Budgets" detail="A measured view of what you planned, committed, and achieved." action={<Button testId="button-new-budget"><Plus size={16}/> New budget</Button>}/><div className="budget-grid">{items.map(b => <div className="budget-card" key={b.id} data-testid={`card-budget-${b.id}`}><div className="budget-card-top"><div><span className="eyebrow">{b.id}</span><h3>{b.name}</h3><p>{b.period}</p></div><StatusPill status={b.status}/></div><div className="budget-owner"><span className="avatar avatar-small">{b.owner.split(' ').map((x: string) => x[0]).join('')}</span><span>Responsible <b>{b.owner}</b></span>{b.linked && <button onClick={() => setLocation('/budgets')} className="linked-badge" data-testid={`link-budget-${b.id}`}>Linked revision</button>}</div><div className="budget-progress"><div><span>Achieved</span><b>{b.pct}%</b></div><div className="progress-track"><span style={{width: `${b.pct}%`}}/></div></div><div className="budget-stats"><div><span>Committed</span><b>{b.committed}</b></div><div><span>Achieved</span><b>{b.achieved}</b></div><div><span>To achieve</span><b>{b.target}</b></div></div><div className="budget-bottom"><span>{b.analytic} · {b.type}</span>{b.status === 'Confirmed' ? <Button variant="secondary" className="mini-btn" onClick={() => revise(b)} testId={`button-revise-${b.id}`}>Revise</Button> : <Button variant="ghost" className="mini-btn" onClick={() => setItems(items.map(x => x.id === b.id ? {...x,status:'Confirmed'} : x))}>Confirm</Button>}</div></div>)}</div></>;
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
        <div className="eyebrow">CUSTOMER PORTAL</div>
        <h1>Your account, in one place.</h1>
        <p className="portal-lede">Hello Mara. Here is the current view of your account with Hearth & Form Studio.</p>
        
        <div className="portal-summary">
          <div><span>Open balance</span><strong>$14,400.00</strong></div>
          <div><span>Next due</span><strong>Apr 09, 2026</strong></div>
          <div><span>Account status</span><strong className="green-text">In good standing</strong></div>
        </div>
        
        <div className="portal-tabs">
          <button className={tab === 'invoices' ? 'active' : ''} onClick={() => setTab('invoices')}>Invoices</button>
          <button className={tab === 'ledger' ? 'active' : ''} onClick={() => setTab('ledger')}>Recent Payments</button>
        </div>

        {tab === 'invoices' ? (
          <div className="portal-table">
            <div className="portal-table-head"><span>Invoice</span><span>Invoice date</span><span>Due date</span><span>Amount due</span><span>Status</span><span/></div>
            {rows.map(r=><div className="portal-row" key={r.id} data-testid={`portal-invoice-${r.id}`}>
              <div><b>{r.id}</b><small>{r.no}</small></div>
              <span>{r.date}</span><span>{r.due}</span>
              <strong>{r.status==='Paid' ? '$0.00' : r.total}</strong>
              <StatusPill status={r.status}/>
              <div className="portal-row-actions">
                <button className="icon-btn" title="Download PDF"><Download size={15}/></button>
                <Button variant={r.status==='Paid'?'ghost':'primary'} className="mini-btn" onClick={()=>setRows(rows.map(x=>x.id===r.id?{...x,status:'Paid',paid:x.total}:x))} testId={`button-portal-pay-${r.id}`}>{r.status==='Paid'?'Paid':'Pay now'}</Button>
              </div>
            </div>)}
          </div>
        ) : (
          <div className="portal-table">
            <div className="portal-table-head"><span>Payment Date</span><span>Reference</span><span>Method</span><span>Amount</span><span/></div>
            <div className="portal-row"><span>Mar 12, 2026</span><span>INV-0032</span><span>Credit Card (...4242)</span><strong>$2,400.00</strong><StatusPill status="Confirmed"/></div>
            <div className="portal-row"><span>Feb 10, 2026</span><span>INV-0028</span><span>ACH Transfer</span><strong>$4,800.00</strong><StatusPill status="Confirmed"/></div>
          </div>
        )}
        <div className="portal-note"><ShieldCheck size={16}/><span><b>Payments are secure.</b> Your payment is recorded directly to the workspace ledger.</span></div>
      </div>
      
      <aside className="portal-sidebar">
        <div className="sidebar-card">
          <h3>Billing Information</h3>
          <p>Mara Chen<br/>Hearth & Form Studio<br/>123 Main St, Suite 400<br/>New York, NY 10001</p>
          <button className="text-link mt-2">Update details</button>
        </div>
        <div className="sidebar-card">
          <h3>Contact Accountant</h3>
          <form className="contact-form" onSubmit={e => {e.preventDefault(); alert("Message sent");}}>
            <textarea placeholder="How can we help?" rows={3}/>
            <Button type="submit" className="w-full">Send Message</Button>
          </form>
        </div>
      </aside>
    </main>
  </div>;
}

function Beacon() { 
  const [open,setOpen]=useState(false); 
  const [listening,setListening]=useState(false); 
  const [typing, setTyping] = useState(false);
  const [messages,setMessages]=useState<any[]>([]); 
  const [input,setInput]=useState(''); 
  const [,setLocation]=useLocation(); 

  const ask=(text:string)=>{ 
    if(!text.trim()) return; 
    setMessages(v=>[...v,{from:'user',text}]);
    setInput('');
    setTyping(true);
    
    setTimeout(() => {
      setTyping(false);
      const isUnpaid = text.toLowerCase().includes('unpaid');
      setMessages(v=>[...v,{
        from:'beacon',
        text: isUnpaid ? 'You have 2 unpaid invoices totaling $14,400.00.' : text.toLowerCase().includes('journal')?'Opening journal entries for you.':'The balance sheet is balanced at $117,777.42.',
        link:text.toLowerCase().includes('journal')?'/journal-entries':text.toLowerCase().includes('balance')?'/reports/balance-sheet':undefined,
        card: isUnpaid ? 'invoices' : undefined
      }]);
    }, 800);
  }; 
  
  return <>{open&&<motion.div initial={{opacity:0,scale:.96,y:12}} animate={{opacity:1,scale:1,y:0}} className="beacon-panel">
    <div className="beacon-head">
      <div className="beacon-title"><span className="beacon-symbol"><Zap size={16}/></span><div><b>Beacon</b><small>Ready when you are</small></div></div>
      <button className="icon-btn" onClick={()=>setOpen(false)} data-testid="button-close-beacon"><X size={17}/></button>
    </div>
    <div className="beacon-body">
      {messages.length===0&&<div className="beacon-welcome"><Sparkles size={19}/><p>Ask me to take you somewhere, or ask about your data.</p><div>{['Show unpaid invoices','Go to journal entries','Open balance sheet'].map(s=><button key={s} onClick={()=>ask(s)} data-testid={`button-suggestion-${s.slice(0,4).toLowerCase()}`}>{s}</button>)}</div></div>}
      
      {messages.map((m,i)=><div className={`beacon-message ${m.from}`} key={i}>
        <span>{m.text}</span>
        {m.card === 'invoices' && <div className="beacon-card">
          <div className="bc-row"><span>INV-0042</span><strong>$9,600.00</strong><Button variant="secondary" className="mini-btn">Pay</Button></div>
          <div className="bc-row"><span>INV-0041</span><strong>$4,800.00</strong><Button variant="secondary" className="mini-btn">Pay</Button></div>
        </div>}
        {m.link&&<button onClick={()=>setLocation(m.link!)} data-testid="button-beacon-navigation"><ArrowRight size={13}/> Open linked page</button>}
      </div>)}
      {typing && <div className="beacon-message beacon"><div className="typing-indicator"><span/><span/><span/></div></div>}
    </div>
    <form className="beacon-input" onSubmit={e=>{e.preventDefault();ask(input)}}>
      <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask Beacon anything"/>
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