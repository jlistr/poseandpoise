# Pose & Poise — Visual Style Guide

> Brand guidelines for poseandpoise.studio

---

## 01 Typography

### Font Families

**Primary / Display / Headlines**
```css
font-family: 'Cormorant Garamond', Georgia, serif;
```
Weights: Light 300, Regular 400, Medium 500, SemiBold 600, Light Italic, Regular Italic

**Secondary / Body / UI Elements**
```css
font-family: 'Outfit', sans-serif;
```
Weights: Light 300, Regular 400, Medium 500

**Google Fonts Import**
```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Outfit:wght@300;400;500&display=swap');
```

### Type Scale

| Name | Size | Weight | Line Height | Letter Spacing | Font |
|------|------|--------|-------------|----------------|------|
| Hero H1 | `clamp(48px, 8vw, 96px)` | 300 | 1.05 | -1px | Cormorant Garamond |
| Section H2 | `clamp(36px, 6vw, 64px)` | 300 | 1.15 | 0 | Cormorant Garamond |
| Feature H2 | `clamp(36px, 5vw, 56px)` | 300 | 1.15 | 0 | Cormorant Garamond |
| Card H3 | `24px` | 400 | 1.3 | 0 | Cormorant Garamond |
| Logo / Brand | `18px` | 300 | 1.4 | 4px | Cormorant Garamond, uppercase |
| Body Large | `17px` | 300 | 1.8 | 0 | Outfit |
| Body | `15px-16px` | 300 | 1.7 | 0 | Outfit |
| Body Small | `14px` | 300 | 1.7 | 0 | Outfit |
| Label / Overline | `12px` | 400 | 1.4 | 4px | Outfit, uppercase |
| Caption / Fine Print | `12px` | 400 | 1.4 | 0 | Outfit |
| Micro Label | `11px` | 400 | 1.4 | 2px | Outfit, uppercase |

---

## 02 Colors

### Primary Palette

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Cream / Background | `#FAF9F7` | `rgb(250, 249, 247)` | Primary background, light sections |
| Charcoal / Primary | `#1A1A1A` | `rgb(26, 26, 26)` | Text, buttons, dark sections |
| Camel / Accent | `#C4A484` | `rgb(196, 164, 132)` | Highlights, CTAs, decorative elements |
| White | `#FFFFFF` | `rgb(255, 255, 255)` | Cards, feature section background |

### Opacity & Transparency

| Name | Value | Usage |
|------|-------|-------|
| Text Secondary | `rgba(26, 26, 26, 0.7)` | Body text, descriptions |
| Text Tertiary | `rgba(26, 26, 26, 0.6)` | Feature descriptions |
| Text Muted | `rgba(26, 26, 26, 0.4)` | Captions, fine print |
| Border Light | `rgba(26, 26, 26, 0.2)` | Input borders |
| Border Subtle | `rgba(26, 26, 26, 0.05)` | Card borders |
| Accent Transparent | `rgba(196, 164, 132, 0.3)` | Hover states |
| Accent Light | `rgba(196, 164, 132, 0.2)` | Decorative circles |
| Accent Wash | `rgba(196, 164, 132, 0.1)` | Decorative rectangles |
| Light Text Secondary | `rgba(250, 249, 247, 0.6)` | Dark section body text |

---

## 03 Spacing

### Padding Scale

| Name | Value | Usage |
|------|-------|-------|
| Section XL | `140px` | CTA sections |
| Section L | `120px` | Feature sections |
| Section M | `80px` | Main content |
| Container | `48px` | Page padding, nav, footer |
| Card | `40px` | Feature cards |
| Component L | `32px` | Large spacing |
| Component M | `24px` | Medium spacing |
| Component S | `16px` | Small spacing |
| Element | `8px` | Tight spacing |

### Gap Scale

| Name | Value |
|------|-------|
| Section Gap | `80px` |
| Grid Gap L | `48px` |
| Grid Gap M | `40px` |
| Card Gap | `24px` |
| Element Gap | `16px` |
| Tight Gap | `8px` |

---

## 04 Components

### Buttons

```css
.button {
  background: #1A1A1A;
  color: #FAF9F7;
  border: none;
  padding: 18px 48px;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.button:hover {
  background: #C4A484;
  transform: translateY(-2px);
  box-shadow: 0 10px 40px rgba(196, 164, 132, 0.3);
}

/* Accent Variant */
.button-accent {
  background: #C4A484;
  color: #1A1A1A;
}

.button-accent:hover {
  background: #1A1A1A;
  color: #FAF9F7;
}
```

### Inputs

```css
.input {
  background: transparent;
  border: 1px solid rgba(26, 26, 26, 0.2);
  padding: 18px 24px;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  width: 100%;
  max-width: 320px;
  outline: none;
  transition: border-color 0.3s ease;
}

.input:focus {
  border-color: #C4A484;
}

.input::placeholder {
  color: rgba(26, 26, 26, 0.4);
  letter-spacing: 1px;
}
```

### Feature Cards

```css
.feature-card {
  padding: 40px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(26, 26, 26, 0.05);
  transition: all 0.4s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.06);
  border-color: rgba(196, 164, 132, 0.3);
}
```

### Navigation Links

```css
.nav-link {
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #1A1A1A;
  text-decoration: none;
  transition: color 0.3s ease;
  cursor: pointer;
}

.nav-link:hover {
  color: #C4A484;
}
```

---

## 05 Effects & Animations

### Shadows

| Name | Value |
|------|-------|
| Button Hover | `0 10px 40px rgba(196, 164, 132, 0.3)` |
| Card Hover | `0 20px 60px rgba(0, 0, 0, 0.06)` |

### Blur & Backdrop

```css
.glass-effect {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
}
```

### Transitions & Easings

```css
/* Primary Easing - Buttons, Cards */
transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

/* Simple Easing - Links, Borders */
transition: all 0.3s ease;
```

### Keyframe Animations

```css
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Animation Delays (Staggered Entrance)

```css
.delay-1 { animation-delay: 0.2s; }
.delay-2 { animation-delay: 0.4s; }
.delay-3 { animation-delay: 0.6s; }
.delay-4 { animation-delay: 0.8s; }
.delay-5 { animation-delay: 1s; }
```

---

## 06 Decorative Elements

### Accent Line

```css
.accent-line {
  width: 40px;
  height: 1px;
  background: #C4A484;
  margin: 24px 0;
}
```

### Decorative Shapes

```css
/* Rectangle */
.deco-rectangle {
  background: linear-gradient(135deg, 
    rgba(196, 164, 132, 0.1) 0%, 
    rgba(196, 164, 132, 0.03) 100%);
}

/* Circle */
.deco-circle {
  border: 1px solid rgba(196, 164, 132, 0.2);
  border-radius: 50%;
}
```

---

## 07 Borders & Radius

### Border Styles

| Name | Value |
|------|-------|
| Card Border | `1px solid rgba(26, 26, 26, 0.05)` |
| Card Border Hover | `1px solid rgba(196, 164, 132, 0.3)` |
| Input Border | `1px solid rgba(26, 26, 26, 0.2)` |
| Input Border Focus | `1px solid #C4A484` |
| Divider | `1px solid rgba(26, 26, 26, 0.1)` |
| Decorative Circle | `1px solid rgba(196, 164, 132, 0.2)` |

### Border Radius

The design uses `border-radius: 0` throughout for a sharp, editorial aesthetic.

**Exceptions:**
- Decorative circles: `border-radius: 50%`
- Code blocks: `border-radius: 4px`

---

## CSS Variables (Optional)

```css
:root {
  /* Colors */
  --color-cream: #FAF9F7;
  --color-charcoal: #1A1A1A;
  --color-camel: #C4A484;
  --color-white: #FFFFFF;
  
  /* Text Opacity */
  --text-secondary: rgba(26, 26, 26, 0.7);
  --text-tertiary: rgba(26, 26, 26, 0.6);
  --text-muted: rgba(26, 26, 26, 0.4);
  
  /* Borders */
  --border-light: rgba(26, 26, 26, 0.2);
  --border-subtle: rgba(26, 26, 26, 0.05);
  
  /* Accent Variants */
  --accent-transparent: rgba(196, 164, 132, 0.3);
  --accent-light: rgba(196, 164, 132, 0.2);
  --accent-wash: rgba(196, 164, 132, 0.1);
  
  /* Typography */
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body: 'Outfit', sans-serif;
  
  /* Transitions */
  --ease-primary: cubic-bezier(0.4, 0, 0.2, 1);
  --transition-fast: 0.3s ease;
  --transition-smooth: 0.4s var(--ease-primary);
  
  /* Shadows */
  --shadow-button: 0 10px 40px rgba(196, 164, 132, 0.3);
  --shadow-card: 0 20px 60px rgba(0, 0, 0, 0.06);
}
```

---

*Style Guide v1.0 — poseandpoise.studio*
