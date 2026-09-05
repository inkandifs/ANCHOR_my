import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

export interface ComboboxOption {
  label: string;
  value: string;
  sub?: string;
  data?: any;
}

interface ComboboxProps {
  label?: string;
  placeholder?: string;
  options: (string | ComboboxOption)[];
  value?: string;
  onChange?: (value: string, selectedData?: any) => void;
  testId?: string;
}

export function Combobox({ label, placeholder = 'Search...', options, value = '', onChange, testId }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options
  const normalizedOptions: ComboboxOption[] = options.map(opt =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  const selectedOpt = normalizedOptions.find(o => o.value === value || o.label === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const filtered = normalizedOptions.filter(o =>
    o.label.toLowerCase().includes(query.toLowerCase()) ||
    (o.sub && o.sub.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSelect = (opt: ComboboxOption) => {
    if (onChange) onChange(opt.value, opt.data);
    setOpen(false);
    setQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChange) onChange('', undefined);
    setQuery('');
  };

  return (
    <div className="combobox-container" ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {label && (
        <span className="field-label" style={{ display: 'block', marginBottom: '5px', fontSize: '11px', fontWeight: 600, color: 'var(--cocoa)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
          {label}
        </span>
      )}
      <div
        className="combobox-input-wrapper"
        data-testid={testId}
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0 11px',
          height: '38px',
          background: 'rgba(238,234,225,.6)',
          border: open ? '1px solid var(--olive)' : '1px solid var(--line)',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'border-color .15s'
        }}
      >
        <Search size={15} style={{ color: '#918475', flexShrink: 0 }} />
        {open ? (
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={placeholder}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '12px',
              color: 'var(--ink)'
            }}
          />
        ) : (
          <span style={{ flexGrow: 1, fontSize: '12px', color: selectedOpt ? 'var(--ink)' : '#968b7d', fontWeight: selectedOpt ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedOpt ? selectedOpt.label : value || placeholder}
          </span>
        )}
        {(value || selectedOpt) && (
          <button
            type="button"
            onClick={handleClear}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#918475', padding: '2px', display: 'flex', alignItems: 'center' }}
          >
            <X size={14} />
          </button>
        )}
        <ChevronDown size={14} style={{ color: '#918475', flexShrink: 0, transition: 'transform .15s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </div>

      {open && (
        <div
          className="combobox-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 200,
            background: '#f4f0e6',
            border: '1px solid rgba(117,97,78,.35)',
            borderRadius: '6px',
            boxShadow: '0 8px 20px rgba(45,34,23,.18)',
            maxHeight: '220px',
            overflowY: 'auto',
            padding: '4px 0'
          }}
        >
          {filtered.length > 0 ? (
            filtered.map(opt => (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: (value === opt.value || value === opt.label) ? 'rgba(112,117,78,.14)' : 'transparent',
                  color: 'var(--ink)',
                  fontSize: '12px',
                  fontWeight: (value === opt.value || value === opt.label) ? 600 : 400,
                  transition: 'background .12s'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(112,117,78,.12)')}
                onMouseLeave={e => (e.currentTarget.style.background = (value === opt.value || value === opt.label) ? 'rgba(112,117,78,.14)' : 'transparent')}
              >
                <span>{opt.label}</span>
                {opt.sub && <small style={{ color: '#887b6d', fontSize: '10px' }}>{opt.sub}</small>}
              </div>
            ))
          ) : (
            <div style={{ padding: '10px 12px', fontSize: '11px', color: '#887b6d', fontStyle: 'italic' }}>
              No matching results
            </div>
          )}
        </div>
      )}
    </div>
  );
}
