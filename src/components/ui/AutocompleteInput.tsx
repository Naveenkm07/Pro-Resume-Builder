import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { SuggestionSource } from '../../services/suggestions';
import { DefaultSuggestionSource } from '../../services/suggestions';

type AutocompleteInputProps = {
  value: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  source?: SuggestionSource;
  delimiters?: RegExp;
  limit?: number;
  onSelectSuggestion?: (suggestion: string) => void;
};

const DEFAULT_DELIMITERS = /[,;•\u2022]/;

const isDelimiterChar = (ch: string, delimiters: RegExp) => delimiters.test(ch);

const getTokenBounds = (text: string, caret: number, delimiters: RegExp) => {
  const safeCaret = Math.max(0, Math.min(caret, text.length));

  let start = safeCaret;
  while (start > 0 && !isDelimiterChar(text[start - 1], delimiters)) start -= 1;

  let end = safeCaret;
  while (end < text.length && !isDelimiterChar(text[end], delimiters)) end += 1;

  return { start, end, caret: safeCaret };
};

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  placeholder,
  className,
  style,
  disabled,
  source = DefaultSuggestionSource,
  delimiters = DEFAULT_DELIMITERS,
  limit,
  onSelectSuggestion,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const blurCloseTimer = useRef<number | null>(null);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [caret, setCaret] = useState(0);

  const tokenBounds = useMemo(() => getTokenBounds(value, caret, delimiters), [value, caret, delimiters]);

  const query = useMemo(() => {
    const token = value.slice(tokenBounds.start, tokenBounds.caret);
    return token.trim();
  }, [tokenBounds.start, tokenBounds.caret, value]);

  const suggestions = useMemo(() => {
    if (!query) return [];
    return source.getSuggestions(query, limit);
  }, [limit, query, source]);

  useEffect(() => {
    if (!query) {
      setOpen(false);
      setActiveIndex(0);
      return;
    }

    if (suggestions.length === 0) {
      setOpen(false);
      setActiveIndex(0);
      return;
    }

    setOpen(true);
    setActiveIndex((prev) => Math.min(Math.max(prev, 0), suggestions.length - 1));
  }, [query, suggestions.length]);

  const applySuggestion = (suggestion: string) => {
    const left = value.slice(0, tokenBounds.start);
    const right = value.slice(tokenBounds.end);

    const needsLeadingSpace = left.length > 0 && !/\s$/.test(left);
    const leftWithSpace = needsLeadingSpace && left.length > 0 && !isDelimiterChar(left[left.length - 1], delimiters) ? `${left} ` : left;

    const next = `${leftWithSpace}${suggestion}${right}`;
    onChange(next);
    source.recordUse(suggestion);
    onSelectSuggestion?.(suggestion);

    setOpen(false);

    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      const nextCaret = (leftWithSpace + suggestion).length;
      el.focus();
      el.setSelectionRange(nextCaret, nextCaret);
      setCaret(nextCaret);
    });
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
      return;
    }

    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      const s = suggestions[activeIndex];
      if (s) applySuggestion(s);
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      return;
    }
  };

  const onBlur: React.FocusEventHandler<HTMLInputElement> = () => {
    if (blurCloseTimer.current) window.clearTimeout(blurCloseTimer.current);
    blurCloseTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  const onFocus: React.FocusEventHandler<HTMLInputElement> = () => {
    if (blurCloseTimer.current) window.clearTimeout(blurCloseTimer.current);
    if (suggestions.length > 0 && query) setOpen(true);
  };

  const onSelect: React.ReactEventHandler<HTMLInputElement> = (e) => {
    const el = e.currentTarget;
    setCaret(el.selectionStart ?? 0);
  };

  const onClick: React.MouseEventHandler<HTMLInputElement> = (e) => {
    const el = e.currentTarget;
    setCaret(el.selectionStart ?? 0);
  };

  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange(e.target.value);
    setCaret(e.target.selectionStart ?? e.target.value.length);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={value}
        onChange={onInputChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        onFocus={onFocus}
        onSelect={onSelect}
        onClick={onClick}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        style={style}
        autoComplete="off"
      />

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-dark-border bg-dark-card shadow-lg overflow-hidden">
          <div className="max-h-56 overflow-auto">
            {suggestions.map((s, idx) => (
              <div
                key={`${s}-${idx}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  applySuggestion(s);
                }}
                className={`px-3 py-2 text-sm cursor-pointer ${
                  idx === activeIndex ? 'bg-dark-surface text-white' : 'text-gray-200 hover:bg-dark-surface'
                }`}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
