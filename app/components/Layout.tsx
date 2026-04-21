'use client';

interface HeroProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
}

export function Hero({ eyebrow, title, subtitle }: HeroProps) {
  return (
    <section className="hero">
      <div className="hero-content">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="hero h1">{title}</h1>
        <p className="hero-subtitle">{subtitle}</p>
      </div>
    </section>
  );
}

interface TabsProps {
  tabs: Array<{ id: string; label: string; icon?: string }>;
  activeTab: string;
  onChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="tab-group">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon && <span>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-text">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn btn-primary" style={{ marginTop: '1.5rem' }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
