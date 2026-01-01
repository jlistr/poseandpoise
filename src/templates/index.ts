// =============================================================================
// FILE: templates/index.ts
// PURPOSE: Central registry for all portfolio templates
// =============================================================================

import type { TemplateComponent, TemplateMetadata } from '@/types/portfolio';

// Import all template components
// Each template is a self-contained folder with its own components
// Note: Internal folder names kept as legacy (rose, poise, etc.) but IDs updated
import { RoseTemplate } from './rose/RoseTemplate';
import { PoiseTemplate } from './poise/PoiseTemplate';
import { LumiereTemplate } from './lumiere/LumiereTemplate';
import { NoirTemplate } from './noir/NoirTemplate';

// =============================================================================
// TEMPLATE REGISTRY
// Maps template IDs to their React components
// New naming: Elysian (rose), Ivory (poise), Solstice (lumiere), Obsidian (noir)
// =============================================================================

export const TEMPLATES: Record<string, TemplateComponent> = {
  elysian: RoseTemplate,
  ivory: PoiseTemplate,
  solstice: LumiereTemplate,
  obsidian: NoirTemplate,
};

// =============================================================================
// TEMPLATE METADATA
// Used by the template selector UI in the dashboard
// =============================================================================

export const TEMPLATE_METADATA: TemplateMetadata[] = [
  {
    id: 'elysian',
    name: 'Elysian',
    description: 'Split hero with elegant masonry gallery',
    isPremium: false,
    thumbnailUrl: '/templates/elysian-preview.jpg',
    accentColor: '#F5D5D8',
  },
  {
    id: 'ivory',
    name: 'Ivory',
    description: 'Centered hero with clean 3-column grid',
    isPremium: false,
    thumbnailUrl: '/templates/ivory-preview.jpg',
    accentColor: '#C4A484',
  },
  {
    id: 'solstice',
    name: 'Solstice',
    description: 'Cinematic filmstrip with vintage warmth',
    isPremium: false,
    thumbnailUrl: '/templates/solstice-preview.jpg',
    accentColor: '#D4A574',
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    description: 'Bold 2-column with dramatic full-bleed images',
    isPremium: true, // Premium template - requires Pro subscription
    thumbnailUrl: '/templates/obsidian-preview.jpg',
    accentColor: '#FFFFFF',
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get a template component by ID
 * Falls back to Elysian template if ID not found
 */
export function getTemplate(templateId: string): TemplateComponent {
  return TEMPLATES[templateId] ?? TEMPLATES.elysian;
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