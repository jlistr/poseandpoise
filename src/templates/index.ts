// =============================================================================
// FILE: templates/index.ts
// PURPOSE: Central registry for all portfolio templates
// =============================================================================

import type { TemplateComponent, TemplateMetadata } from '@/types/portfolio';

// Import all template components
// Each template is a self-contained folder with its own components
import { RoseTemplate } from './rose/RoseTemplate';
import { PoiseTemplate } from './poise/PoiseTemplate';
import { LumiereTemplate } from './lumiere/LumiereTemplate';
import { NoirTemplate } from './noir/NoirTemplate';

// =============================================================================
// TEMPLATE REGISTRY
// Maps template IDs to their React components
// =============================================================================

export const TEMPLATES: Record<string, TemplateComponent> = {
  rose: RoseTemplate,
  poise: PoiseTemplate,
  lumiere: LumiereTemplate,
  noir: NoirTemplate,
};

// =============================================================================
// TEMPLATE METADATA
// Used by the template selector UI in the dashboard
// =============================================================================

export const TEMPLATE_METADATA: TemplateMetadata[] = [
  {
    id: 'rose',
    name: 'Rosé',
    description: 'Soft editorial blush with feminine elegance',
    isPremium: false,
    thumbnailUrl: '/templates/rose-preview.jpg',
    accentColor: '#FF7AA2',
  },
  {
    id: 'poise',
    name: 'Poise',
    description: 'Timeless elegance with warm neutrals',
    isPremium: false,
    thumbnailUrl: '/templates/poise-preview.jpg',
    accentColor: '#C4A484',
  },
  {
    id: 'lumiere',
    name: 'Lumière',
    description: 'Golden hour warmth with editorial flair',
    isPremium: false,
    thumbnailUrl: '/templates/lumiere-preview.jpg',
    accentColor: '#A78E14',
  },
  {
    id: 'noir',
    name: 'Noir',
    description: 'Bold monochrome with dramatic contrast',
    isPremium: true, // Premium template - requires Pro subscription
    thumbnailUrl: '/templates/noir-preview.jpg',
    accentColor: '#FFFFFF',
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get a template component by ID
 * Falls back to Rose template if ID not found
 */
export function getTemplate(templateId: string): TemplateComponent {
  return TEMPLATES[templateId] ?? TEMPLATES.rose;
}

/**
 * Get template metadata by ID
 */
export function getTemplateMetadata(templateId: string): TemplateMetadata | undefined {
  return TEMPLATE_METADATA.find(t => t.id === templateId);
}

/**
 * Get all available templates (filtered by subscription tier if needed)
 */
export function getAvailableTemplates(isPro: boolean): TemplateMetadata[] {
  if (isPro) {
    return TEMPLATE_METADATA;
  }
  return TEMPLATE_METADATA.filter(t => !t.isPremium);
}

/**
 * Check if a template is accessible for a given subscription tier
 */
export function canAccessTemplate(templateId: string, isPro: boolean): boolean {
  const metadata = getTemplateMetadata(templateId);
  if (!metadata) return false;
  return isPro || !metadata.isPremium;
}