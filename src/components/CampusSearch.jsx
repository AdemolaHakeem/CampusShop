import { useState, useRef, useEffect } from 'react';
import { Input, Typography, Empty, Spin } from 'antd';
import { Search, Building2, Check } from 'lucide-react';
import { searchCampuses } from '../services/campuses';

const { Text } = Typography;

const DEBOUNCE_MS = 350;

const CampusSearch = ({ value, onChange }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [focused, setFocused] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Instantly search on keystroke — data is local, no debounce needed
  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedLabel('');

    // Clear the parent value when user types (deselects)
    if (value && onChange) {
      onChange(null, '');
    }

    // Search immediately — filter happens in-memory
    searchCampuses(val).then((campuses) => {
      if (mountedRef.current) setResults(campuses);
    }).catch(() => {
      if (mountedRef.current) setResults([]);
    });
  };

  const handleSelect = (campus) => {
    setSelectedLabel(campus.name);
    setQuery('');
    setResults([]);
    setFocused(false);
    if (onChange) {
      onChange(campus.id, campus.name);
    }
  };

  const handleClear = () => {
    setSelectedLabel('');
    setQuery('');
    setResults([]);
    if (onChange) onChange(null, '');
    if (inputRef.current) inputRef.current.focus();
  };

  const showDropdown = focused && (results.length > 0 || searching || query.length > 0);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Input field */}
      {selectedLabel && !query ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 48,
            padding: '4px 12px',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-primary)',
            cursor: 'pointer',
            gap: 8,
          }}
          onClick={() => {
            if (inputRef.current) inputRef.current.focus();
            setFocused(true);
          }}
        >
          <Building2 size={16} color="#0062ff" />
          <Text style={{ flex: 1, fontSize: 14 }}>{selectedLabel}</Text>
          <span
            onClick={(e) => { e.stopPropagation(); handleClear(); }}
            style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1 }}
          >
            &times;
          </span>
        </div>
      ) : (
        <Input
          ref={inputRef}
          size="large"
          placeholder="Search for your school or university..."
          prefix={<Search size={16} color="#0062ff" />}
          suffix={searching ? <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--border-color)', borderTopColor: '#0062ff', animation: 'campusSpin 0.6s linear infinite', display: 'inline-block' }} /> : null}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          style={{ height: 48, borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)' }}
        />
      )}

      {/* Dropdown */}
      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            background: '#fff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            maxHeight: 320,
            overflow: 'auto',
            zIndex: 1000,
          }}
        >
          {searching && results.length === 0 && query.length >= 2 && (
            <div style={{ padding: 24, textAlign: 'center' }}>
              <Spin size="small" />
            </div>
          )}

          {!searching && results.length === 0 && query.length >= 2 && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No institutions found"
              style={{ margin: '16px 0', padding: '0 16px' }}
            />
          )}

          {query.length < 2 && (
            <div style={{ padding: '16px 20px' }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Type at least 2 characters to search
              </Text>
            </div>
          )}

          {results.map((campus) => (
            <div
              key={campus.id}
              onClick={() => handleSelect(campus)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 16px',
                cursor: 'pointer',
                transition: 'background 0.15s',
                borderBottom: '1px solid rgba(0,0,0,0.04)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,98,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Building2 size={16} color="#0062ff" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ display: 'block', fontSize: 14, lineHeight: 1.4 }}>
                  {campus.name}
                </Text>
                {campus.domain && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {campus.domain}
                  </Text>
                )}
              </div>
              {value === campus.id && (
                <Check size={14} color="#0062ff" style={{ flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampusSearch;
