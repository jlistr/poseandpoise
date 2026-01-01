'use client';

import React from 'react';
import { colors, fonts, type StepInfo } from '../types';

interface StepIndicatorProps {
  steps: StepInfo[];
}

export function StepIndicator({ steps }: StepIndicatorProps): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        marginBottom: '3rem',
      }}
    >
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Dot */}
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: step.completed || step.current ? colors.camel : colors.border,
                transition: 'background-color 0.3s ease',
              }}
            />
            {/* Label */}
            <span
              style={{
                fontSize: '11px',
                fontFamily: fonts.body,
                fontWeight: 400,
                letterSpacing: '0.15em',
                color: step.current ? colors.textPrimary : colors.textMuted,
                transition: 'color 0.3s ease',
              }}
            >
              {step.name}
            </span>
          </div>
          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              style={{
                width: '2rem',
                height: '1px',
                backgroundColor: colors.border,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

