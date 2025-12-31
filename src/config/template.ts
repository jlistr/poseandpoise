import type { PortfolioTemplate, TemplateId } from '@/types';

export const TEMPLATES: PortfolioTemplate[] = [
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Elegant editorial layout with dynamic image galleries and sophisticated typography',
    isAvailable: true,
    isPremium: false,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, focused design that lets your photos take center stage',
    isAvailable: false,
    isPremium: false,
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional comp card layout favored by agencies worldwide',
    isAvailable: false,
    isPremium: false,
  },
];

export const getTemplate = (id: TemplateId): PortfolioTemplate | undefined => {
  return TEMPLATES.find(t => t.id === id);
};

export const getAvailableTemplates = (): PortfolioTemplate[] => {
  return TEMPLATES.filter(t => t.isAvailable);
};

export const DEFAULT_TEMPLATE: TemplateId = 'editorial';` `