'use client';

import { ReactNode } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className = '', ...props }: InputProps) {
  return (
    <div className="form-group">
      {label && <label htmlFor={props.id}>{label}</label>}
      <input
        className={`input-base ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && <p className="input-error-text">{error}</p>}
      {hint && <p className="input-hint">{hint}</p>}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  charLimit?: number;
}

export function TextArea({
  label,
  error,
  hint,
  charLimit,
  className = '',
  value = '',
  onChange,
  ...props
}: TextAreaProps) {
  const charCount = String(value).length;
  const isNearLimit = charLimit && charCount > charLimit * 0.8;

  return (
    <div className="form-group">
      {label && <label htmlFor={props.id}>{label}</label>}
      <textarea
        className={`input-base ${error ? 'input-error' : ''} ${className}`}
        value={value}
        onChange={onChange}
        {...props}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
        <div>
          {error && <p style={{ fontSize: '0.75rem', color: 'var(--color-rose-primary)' }}>{error}</p>}
          {hint && <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{hint}</p>}
        </div>
        {charLimit && (
          <p style={{ fontSize: '0.75rem', fontWeight: '500', color: isNearLimit ? 'var(--color-rose-primary)' : 'var(--color-text-muted)' }}>
            {charCount}/{charLimit}
          </p>
        )}
      </div>
    </div>
  );
}
