# Christelle Template - Product Requirements Document

## Template Overview

**Template Name:** Christelle
**Template ID:** `christelle`
**Version:** 1.0.0
**Target Market:** Editorial & High-Fashion Models, Art Photography Portfolios
**Inspiration:** christellecroisile.com

## Executive Summary

The Christelle template is an elegant, editorial-focused portfolio template designed for professional models seeking a high-fashion, minimalist aesthetic. Inspired by the dramatic visual storytelling of Christelle Croisile's portfolio, this template features bold typography, a sophisticated black/white/red color palette, and project-based gallery organization.

## Target Audience

- **Primary:** Professional editorial and fashion models
- **Secondary:** Art photographers, visual artists, creative professionals
- **Experience Level:** Established professionals with curated portfolios
- **Geographic Focus:** Global, with emphasis on fashion capitals

## Key Features

### 1. Hero Section
- Full-screen hero with dramatic background imagery
- Large, elegant typography for model name
- Subtle agency/role indicator
- Animated scroll indicator

### 2. Gallery Section
- Masonry grid layout with varied image sizes
- Hover effects with subtle zoom and caption reveal
- Lightbox for full-screen image viewing
- Project-based organization support

### 3. About Section
- Two-column layout (image + content)
- Model statistics display (height, bust, waist, hips, hair, eyes)
- Bio text with elegant typography
- Location information

### 4. Services Section
- Clean card-based layout
- Service descriptions with optional pricing
- Hover effects for interactivity
- Default services if none configured

### 5. Contact Section
- Full contact form (name, email, message)
- Social media links (Instagram, TikTok, Website)
- Professional inquiry focus

## Technical Specifications

### Data Interface
Uses standard `PortfolioData` interface from `@/types/portfolio`:

```typescript
interface PortfolioData {
  profile: ProfileData;      // displayName, username, bio, avatarUrl, agency, location
    stats: ModelStats;         // heightCm, bustCm, waistCm, hipsCm, shoeSize, hairColor, eyeColor
      photos: PortfolioPhoto[];  // id, url, thumbnailUrl, caption, sortOrder, isVisible
        services: ServiceItem[];   // id, title, description, price
          social: SocialLinks;       // instagram, tiktok, website
            compCard: CompCardData;
              compCards: SavedCompCard[];
                settings: PortfolioSettings;
                }
                ```

                ### Color Variables
                - Primary Black: `#0A0A0A`
                - Off White: `#F5F5F3`
                - Accent Red: `#C41E3A`
                - Text Gray: `rgba(10, 10, 10, 0.7)`

                ### Typography
                - Font Family: Inter (-apple-system fallback)
                - Display: Light weight, 0.3em letter-spacing, uppercase
                - Body: Regular weight, clean sans-serif
                - Labels: Extra-small, 0.2em letter-spacing, uppercase

                ### Responsive Breakpoints
                - Mobile: < 768px
                - Tablet: 768px - 1024px
                - Desktop: > 1024px

                ## User Stories

                ### As a Model Owner:
                1. I want to showcase my portfolio with dramatic, editorial-quality presentation
                2. I want my stats (measurements) displayed in a professional format
                3. I want potential clients to easily contact me through a form
                4. I want my social media prominently linked

                ### As a Visitor/Client:
                1. I want to browse photos in an elegant gallery format
                2. I want to view images in full-screen for detail
                3. I want to learn about the model's experience and availability
                4. I want to easily contact the model for bookings

                ## Accessibility Requirements

                - WCAG AA compliance
                - Alt text for all images
                - Keyboard navigation support
                - Sufficient color contrast ratios
                - Screen reader compatible

                ## Performance Targets

                - Lighthouse score: 90+
                - LCP (Largest Contentful Paint): < 2.5s
                - FID (First Input Delay): < 100ms
                - CLS (Cumulative Layout Shift): < 0.1

                ## Integration Points

                ### Required Integrations:
                - Supabase (data storage)
                - Vercel/Next.js Image optimization
                - Contact form submission handling

                ### Optional Integrations:
                - Instagram feed widget
                - Analytics tracking
                - Booking calendar

                ## Success Metrics

                - Template selection rate among premium subscribers
                - Portfolio completion rate
                - Contact form submission rate
                - Average time on page

                ## Risk Mitigation

                | Risk | Impact | Mitigation |
                |------|--------|------------|
                | Large image load times | High | Implement progressive loading, optimized thumbnails |
                | Form spam | Medium | Add reCAPTCHA or honeypot fields |
                | Mobile gallery UX | Medium | Touch-optimized gestures, responsive grid |

                ## Revision History

                | Version | Date | Changes |
                |---------|------|---------|
                | 1.0.0 | 2026-01-01 | Initial release |

                ---

                *Document maintained by Pose & Poise Product Team*