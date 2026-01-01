// =============================================================================
// FILE: templates/index.ts
// PURPOSE: Central registry for all portfolio templates
// =============================================================================

import type { TemplateComponent, TemplateMetadata } from '@/types/portfolio';

// Import all template components
// Each template is a self-contained folder with its own components
// Internal folder names (rose, poise, lumiere, noir) map to conceptual names
import { RoseTemplate } from './rose/RoseTemplate';
import { PoiseTemplate } from './poise/PoiseTemplate';
import { LumiereTemplate } from './lumiere/LumiereTemplate';
import { NoirTemplate } from './noir/NoirTemplate';

// =============================================================================
// TEMPLATE REGISTRY
// Maps template IDs to their React components
// 
// Naming Convention (conceptual names that evoke mood & industry focus):
// - Elysian: Soft commercial/lifestyle (rose folder)
// - Altar: Classic bridal/luxury (poise folder)  
// - Solstice: High-performance fitness (lumiere folder)
// - Obsidian: Moody editorial/fashion (noir folder)
// =============================================================================

export const TEMPLATES: Record<string, TemplateComponent> = {
  elysian: RoseTemplate,      // Soft, warm, approachable - Commercial/Lifestyle
  altar: PoiseTemplate,       // Minimalist, sophisticated - Bridal/Luxury
  solstice: LumiereTemplate,  // Dynamic, raw, powerful - Fitness/Athletic
  obsidian: NoirTemplate,     // Moody, high-contrast, edgy - Editorial/Fashion
};

// =============================================================================
// TEMPLATE METADATA
// Used by the template selector UI in the dashboard
// Each template showcases unique layout, gallery style, and aesthetic
// =============================================================================

export const TEMPLATE_METADATA: TemplateMetadata[] = [
  {
    id: 'elysian',
    name: 'Elysian',
    description: 'Soft, warm 3-column gallery with feminine elegance',
    isPremium: false,
    thumbnailUrl: '/templates/elysian-preview.jpg',
    accentColor: '#FF7AA2',
    // Layout characteristics
    layout: 'hero-split',
    heroStyle: 'left-aligned',
    galleryStyle: 'grid-3',
    navStyle: 'minimal',
    industryFocus: 'Commercial/Lifestyle',
  },
  {
    id: 'altar',
    name: 'Altar',
    description: 'Minimalist sophistication with clean 3-column grid',
    isPremium: false,
    thumbnailUrl: '/templates/altar-preview.jpg',
    accentColor: '#C4A484',
    // Layout characteristics
    layout: 'hero-fullscreen',
    heroStyle: 'centered',
    galleryStyle: 'grid-3',
    navStyle: 'classic',
    industryFocus: 'Bridal/Luxury',
  },
  {
    id: 'solstice',
    name: 'Solstice',
    description: 'Dynamic cinematic filmstrip with raw energy',
    isPremium: false,
    thumbnailUrl: '/templates/solstice-preview.jpg',
    accentColor: '#D4A574',
    // Layout characteristics
    layout: 'filmstrip',
    heroStyle: 'overlay',
    galleryStyle: 'filmstrip',
    navStyle: 'floating',
    industryFocus: 'Fitness/Athletic',
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    description: 'Bold 2-column with dramatic high-contrast imagery',
    isPremium: true, // Premium template - requires Pro subscription
    thumbnailUrl: '/templates/obsidian-preview.jpg',
    accentColor: '#FFFFFF',
    // Layout characteristics
    layout: 'grid-first',
    heroStyle: 'right-aligned',
    galleryStyle: 'grid-2',
    navStyle: 'hidden',
    industryFocus: 'Editorial/Fashion',
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

/**
 * Get templates by industry focus
 */
export function getTemplatesByIndustry(industry: string): TemplateMetadata[] {
  return TEMPLATE_METADATA.filter(t => 
    t.industryFocus?.toLowerCase().includes(industry.toLowerCase())
  );
}
