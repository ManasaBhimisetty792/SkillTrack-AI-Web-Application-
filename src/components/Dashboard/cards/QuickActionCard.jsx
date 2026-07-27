import React from 'react';
import { motion } from 'framer-motion';

export const QuickActionCard = ({ actions = [] }) => {
  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0 0 0.85rem 0', color: 'var(--color-text)' }}>
        Quick Actions
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem' }}>
        {actions.map((act, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={act.onClick}
            type="button"
            className={act.primary ? 'btn-primary' : 'btn-secondary'}
            style={{
              padding: '0.65rem 0.75rem',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              gap: '0.4rem',
              width: '100%',
              borderRadius: 'var(--radius-md)',
            }}
          >
            {act.icon} <span>{act.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionCard;
