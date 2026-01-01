# Cursor Prompt: Onboarding Profile Step Redesign

## Objective
Refactor the onboarding "Profile" step from a three-column layout to a single-column, centered layout. This redesign removes visual clutter, fixes state bugs, and creates a focused user experience aligned with our luxury editorial aesthetic.

---

## Context & Design System

**Tech Stack:** Next.js 15, TypeScript, Supabase, Tailwind CSS
**Fonts:** Cormorant Garamond (headings), Outfit (body/UI)
**Color Palette:**
- Cream/Background: `#FAF9F7`
- Charcoal/Primary: `#1A1A1A`
- Camel/Accent: `#C4A484`
- White: `#FFFFFF`
- Border Light: `rgba(26, 26, 26, 0.2)` or `#E8E4DE`
- Text Secondary: `rgba(26, 26, 26, 0.7)`
- Text Muted: `rgba(26, 26, 26, 0.4)` or `#999`
- Success Green: `#4CAF50`
- Instagram Pink: `#E1306C`

**Icons:** Use SVG icons from `@/components/icons/Icons`. Never use emojis. Create new icons if needed.

---

## Layout Changes

### REMOVE These Elements

1. **Left Sidebar Panel ("AI-Powered Tools")**
   - Remove the entire left column containing:
     - "AI-POWERED TOOLS" header
     - "Save time with smart automation" subheading
     - "Auto-Detect Location" card
     - "Connect Socials" card (highlighted state)
     - "Agency Details" card
   - **Rationale:** The user is already experiencing these features inline; advertising them in a sidebar is redundant.

2. **Floating "Your Information" Panel**
   - Remove the floating overlay panel on the right that shows:
     - "Your Information" header with "4 fields collected"
     - Location field display
     - Instagram field display
     - Website field display
     - Agency field display
     - "Synced" indicator
   - **Rationale:** Creates visual clutter and overlaps content. Replace with inline progress indicator.

3. **Bottom AI Chat Input**
   - Remove the "Type a message or click a tool to get started..." input field
   - Remove the "Skip AI setup" link
   - **Rationale:** Competes with the main form for attention; single skip action is cleaner.

### REPOSITION These Elements

1. **Main Form Container**
   - Change from: Right-aligned in a multi-column grid
   - Change to: Centered, single-column layout with `max-w-2xl mx-auto`
   - Wrap in a white card with `rounded-2xl`, `p-8`, subtle shadow, and `1px solid #E8E4DE` border

2. **Step Indicator**
   - Keep the PROFILE → ABOUT → SERVICES → TEMPLATE → PHOTOS progression
   - Center horizontally above the form card
   - Increase dot size slightly to `w-2.5 h-2.5` for better visibility
   - Active/completed dots: `#C4A484`
   - Inactive dots: `#E8E4DE`
   - Step labels: Active uses `#1A1A1A`, inactive uses `#999`

---

## Component Structure

```
OnboardingProfile/
├── Header (existing site header with UPGRADE button)
├── Main Content (centered, max-w-2xl)
│   ├── StepIndicator
│   ├── FormCard
│   │   ├── Title & Description
│   │   ├── LocationDetection (stateful component)
│   │   ├── SocialConnectionButtons
│   │   ├── Divider ("OR ENTER MANUALLY")
│   │   ├── ManualInputFields
│   │   └── ActionButtons (SKIP / CONTINUE)
│   └── InlineProgressIndicator (conditional)
└── Footer
```

---

## State Management

### Location Detection State Machine

Create a TypeScript type for location status:

```typescript
type LocationStatus = 'idle' | 'detecting' | 'found' | 'error';
```

**State Transitions:**
1. Component mounts → Set status to `'detecting'`
2. Geolocation API call succeeds → Set status to `'found'`, populate location string
3. Geolocation API call fails → Set status to `'error'`, show manual entry option

**Critical Fix:** The current implementation shows BOTH "Detecting your location..." AND "Found you!" simultaneously. This is a state conflict. Only ONE state should render at a time using conditional rendering:

```typescript
{locationStatus === 'detecting' && (
  // Show detecting UI
)}
{locationStatus === 'found' && (
  // Show found UI
)}
{locationStatus === 'error' && (
  // Show error/manual entry UI
)}
```

### Form Data State

```typescript
interface ProfileFormData {
  location: string;
  instagram: string;
  tiktok: string;
  website: string;
  agency: string;
}

const [formData, setFormData] = useState<ProfileFormData>({
  location: '',
  instagram: '',
  tiktok: '',
  website: '',
  agency: ''
});
```

### Collected Fields Counter

Calculate dynamically for the inline progress indicator:

```typescript
const collectedFields = Object.values(formData).filter(Boolean).length;
```

---

## UI Component Specifications

### 1. Location Detection Box

**Container:**
- Background: `#FAF9F7`
- Padding: `16px`
- Border radius: `12px` (rounded-xl)
- Margin bottom: `32px`

**Icon Container (left):**
- Size: `40px × 40px`
- Border radius: `50%` (fully round)
- Detecting state background: `#FFF8E7` (warm cream)
- Found state background: `#E8F5E9` (light green)

**Icon:**
- Detecting: MapPin icon, color `#C4A484`, add `animate-pulse` class
- Found: Check icon, color `#4CAF50`

**Text:**
- Primary text: `font-medium text-sm`, color `#1A1A1A`
- Secondary text: `text-xs mt-1`, color `#999`

**Detecting copy:** "Detecting your location..." / "This helps us suggest relevant opportunities"
**Found copy:** "Found you in {location}" / "This helps us suggest appropriate services and connect you with local markets"

**Location format:** Use "City, State Abbrev, Country" format (e.g., "New Braunfels, TX, USA") — NOT "New Braunfels, United States of America (the)"

---

### 2. Social Connection Section

**Section Header:**
- Text: "CONNECT YOUR SOCIALS"
- Style: `text-xs tracking-widest`, color `#C4A484`
- Include Sparkles icon (size 12) before text
- Margin bottom: `16px`

**Button Row:**
- Two buttons side-by-side with `gap-3`
- Each button: `flex-1` to share width equally

**Connect Instagram Button:**
- Background: `#E1306C` (Instagram pink)
- Text: White
- Include Instagram icon (size 16) before text
- Padding: `12px 16px`
- Border radius: `8px` (rounded-lg)
- Hover: `opacity-90`
- Font: `text-sm font-medium`

**Connect TikTok Button:**
- Background: `#1A1A1A` (Charcoal)
- Text: White
- Include TikTok icon (size 16) before text
- Same dimensions as Instagram button

**Divider:**
- Horizontal rule with text in center
- Text: "OR ENTER MANUALLY"
- Style: `text-xs`, color `#999`
- Lines: `h-px`, background `#E8E4DE`

---

### 3. Manual Input Fields

**Field Spacing:** `space-y-4` between fields

**Label Style:**
- `flex items-center gap-2 text-sm mb-2`
- Color: `#1A1A1A`
- Include relevant icon (size 14) before label text
- Optional indicator: `(optional)` in `#999`

**Input Style:**
- Background: transparent (white)
- Border: `1px solid #E8E4DE`
- Padding: `10px 12px`
- Font: `text-sm`
- Border radius: `8px`
- Focus state: Change border color to `#C4A484`
- Placeholder color: `#999`

**@ Prefix (Instagram/TikTok):**
- Attached prefix box on left
- Background: `#FAF9F7`
- Border: `1px solid #E8E4DE` (no right border)
- Border radius: `8px 0 0 8px` on prefix, `0 8px 8px 0` on input
- Text: "@" in `#999`

**Fields to include:**
1. Instagram (with @ prefix) — placeholder: "yourhandle"
2. TikTok (with @ prefix) — placeholder: "yourhandle"
3. Website — placeholder: "https://yourwebsite.com"
4. Agency (marked optional) — placeholder: "Your representation"

---

### 4. Action Buttons

**Container:** `flex gap-3 mt-8`

**SKIP Button:**
- Background: transparent
- Border: `1px solid #E8E4DE`
- Text: `#666`
- Padding: `12px 24px`
- Border radius: `8px`
- Font: `text-sm font-medium`
- Hover: `opacity-80`
- Width: `flex-1`

**CONTINUE Button:**
- Background: `#1A1A1A`
- Text: White
- Include ChevronRight icon (size 16) after text
- Padding: `12px 24px`
- Border radius: `8px`
- Font: `text-sm font-medium`
- Hover: `opacity-90`
- Width: `flex-1`
- Flex layout to center text + icon with `gap-2`

---

### 5. Inline Progress Indicator (NEW — Replaces Floating Panel)

**Visibility:** Only render when `collectedFields > 0`

**Container:**
- Position: Below the form card with `mt-6`
- Background: White
- Border: `1px solid #E8E4DE`
- Padding: `16px`
- Border radius: `12px`
- Layout: `flex items-center justify-between`

**Left Side:**
- Camel circle with check: `w-8 h-8 rounded-full`, background `#C4A484`, white Check icon (size 14)
- Text: "{count} field{s} collected"
- Bold the count: `font-medium`
- Text color: `#1A1A1A`

**Right Side:**
- Green check icon (size 12) + "Auto-saved" text
- Color: `#4CAF50`
- Font: `text-xs`

---

## Interactive Behaviors

### On Component Mount
1. Set `locationStatus` to `'detecting'`
2. Call browser Geolocation API or IP-based location service
3. After response (or simulated 2-second delay for demo):
   - Success: Set `locationStatus` to `'found'`, update `formData.location`
   - Failure: Set `locationStatus` to `'error'`

### On Input Change
- Update corresponding field in `formData` state
- Progress indicator updates automatically via `collectedFields` calculation

### On "Connect Instagram" Click
- Trigger OAuth flow or show connection modal
- On success, populate `formData.instagram` with returned handle

### On "Connect TikTok" Click
- Trigger OAuth flow or show connection modal
- On success, populate `formData.tiktok` with returned handle

### On "SKIP" Click
- Navigate to next onboarding step (ABOUT) without saving current data
- Or save partial data and continue

### On "CONTINUE" Click
- Validate form data (optional fields can be empty)
- Save to Supabase `profiles` table
- Navigate to next onboarding step (ABOUT)

---

## Accessibility Requirements

1. All form inputs must have associated `<label>` elements
2. Focus states must be visible (camel border color)
3. Buttons must have clear focus rings
4. Location detection should have aria-live region for status updates
5. Progress indicator should use aria-label for screen readers

---

## File Structure Suggestion

```
app/
└── onboarding/
    └── profile/
        ├── page.tsx                    # Main page component
        ├── components/
        │   ├── StepIndicator.tsx       # Reusable for all onboarding steps
        │   ├── LocationDetection.tsx   # Location auto-detect component
        │   ├── SocialConnections.tsx   # OAuth buttons + manual inputs
        │   ├── ProfileForm.tsx         # Form container with all fields
        │   └── ProgressIndicator.tsx   # Inline "X fields collected" bar
        └── hooks/
            └── useGeolocation.ts       # Custom hook for location detection
```

---

## Testing Checklist

- [ ] Location detection shows only ONE state at a time (never both detecting AND found)
- [ ] Location displays in "City, State, Country" format (not verbose)
- [ ] All input fields update state correctly
- [ ] Progress indicator appears when at least one field has value
- [ ] Progress indicator updates count dynamically
- [ ] SKIP button navigates without requiring form completion
- [ ] CONTINUE button saves data and navigates
- [ ] Instagram/TikTok @ prefix displays correctly
- [ ] Hover states work on all buttons
- [ ] Focus states show camel border on inputs
- [ ] Component is fully responsive on mobile

---

## Reference Implementation

See the artifact file `onboarding-improved.jsx` in the project knowledge for a working React implementation of this design. Convert to TypeScript and adapt to the existing project patterns.
