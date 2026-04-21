'use client';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'idea' | 'generating' | 'approved' | 'rose';
  className?: string;
}

export function Badge({ children, variant = 'rose', className = '' }: BadgeProps) {
  const baseClass = 'badge';
  const variantClasses = {
    idea: 'badge-idea',
    generating: 'badge-generating',
    approved: 'badge-approved',
    rose: 'badge-rose',
  };

  return (
    <span className={`${baseClass} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const statusMap: Record<string, 'idea' | 'generating' | 'approved'> = {
    'Ideia': 'idea',
    'Gerado': 'generating',
    'Aprovado': 'approved',
  };

  const variant = statusMap[status] || 'idea';

  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  );
}
