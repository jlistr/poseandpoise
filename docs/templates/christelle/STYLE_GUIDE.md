# Christelle Template - Brand Style Guide

## BRAND GUIDELINES
### Template: Christelle
*Visual Style Guide — Pose & Poise Template Library*

---

## 01 Typography

### FONT FAMILIES
**Inter** - Primary / Display / Headlines / Body

```css
font-family: 'Inter', -apple-system, sans-serif;
```

| Weight | Usage |
|--------|-------|
| Light 300 | Hero headlines, display text |
| Regular 400 | Body text, descriptions |
| Medium 500 | Emphasis, labels |
| SemiBold 600 | Buttons, navigation |

### TYPE SCALE
| Element | Size | Weight | Letter-Spacing |
|---------|------|--------|----------------|
| Hero H1 | clamp(48px, 8vw, 96px) | 300 | 0.3em |
| Section H2 | clamp(30px, 5vw, 48px) | 300 | 0.3em |
| Body | 15-16px | 300-400 | 0 |
| Label | 12px | 400 | 0.2em |

---

## 02 Colors

### PRIMARY PALETTE
| Color | Hex | Usage |
|-------|-----|-------|
| Primary Black | #0A0A0A | Text, dark sections |
| Off White | #F5F5F3 | Primary background |
| Accent Red | #C41E3A | CTAs, accents, highlights |
| Pure White | #FFFFFF | Cards, overlays |

### OPACITY & TRANSPARENCY
| Name | RGBA Value | Usage |
|------|------------|-------|
| Text Secondary | rgba(10, 10, 10, 0.7) | Body text |
| Text Muted | rgba(10, 10, 10, 0.4) | Captions |
| Border Light | rgba(10, 10, 10, 0.1) | Card borders |
| Light Text Secondary | rgba(245, 245, 243, 0.7) | Text on dark |
| Overlay Dark | rgba(0, 0, 0, 0.3) | Hero overlay |

---

## 03 Spacing

### PADDING SCALE
| Name | Value | Usage |
|------|-------|-------|
| Section XL | 128px | Major sections |
| Section L | 96px | Feature sections |
| Container | 32px | Page padding |
| Card | 32px | Card internal |

### BORDER RADIUS
| Name | Value |
|------|-------|
| None | 0px (primary style) |
| Subtle | 2px (optional) |

---

## 04 Components

### BUTTONS
```css
.btn-primary {
  background: #0A0A0A;
  color: #F5F5F3;
  padding: 16px 48px;
  font-size: 12px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
.btn-primary:hover { background: #C41E3A; }
```

### NAVIGATION LINKS
```css
.nav-link {
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(10, 10, 10, 0.7);
}
.nav-link:hover { color: #C41E3A; }
```

---

## 05 Effects & Animations

### TRANSITIONS
- Color: 0.3s ease
- Transform: 0.5s ease
- Border: 0.3s ease

### IMAGE HOVER
```css
.image-hover img { transition: transform 0.7s ease; }
.image-hover:hover img { transform: scale(1.05); }
```

---

## 06 Photography Guidelines

### IMAGE STYLE
- High-contrast editorial aesthetic
- Dramatic lighting
- Professional quality only

### IMAGE SIZES
| Context | Aspect Ratio | Min Resolution |
|---------|--------------|----------------|
| Hero | 16:9 | 1920x1080 |
| Gallery | 3:4 | 800x1066 |
| Thumbnail | 3:4 | 400x533 |

---

## 07 Grid System

### GALLERY GRID
- 2 columns (mobile)
- 3 columns (tablet)
- 4 columns (desktop)
- Gap: 16px

---

*Christelle Template Style Guide — Pose & Poise*
