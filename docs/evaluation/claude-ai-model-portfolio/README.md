# Claude AI Model Portfolio - Smart Automation Features

This package contains React/Next.js components that integrate Claude Sonnet 4.5 for intelligent automation in a model portfolio website.

## Features Included

- **Template Selection**: AI-powered template recommendations based on model experience
- **Photo Organization**: Automatic photographer/studio detection from images
- **Geolocation**: Auto-detect city/country for profile
- **Service Suggestions**: AI recommendations for modeling services to offer
- **Image Analysis**: Physical measurement estimation from photos
- **Comp Card Scanner**: Extract stats from composite cards (image/PDF)
- **Bio Generator**: AI-powered professional bio creation

## Prerequisites

- Node.js 18+ installed
- Next.js 14+ project
- Anthropic API key

## Installation

### 1. Install Dependencies

```bash
npm install @anthropic-ai/sdk
```

### 2. Set Up Environment Variables

Create a `.env.local` file in your project root:

```env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
```

**Also add to Vercel Dashboard** (if deploying):
- Go to your Vercel project settings
- Add `ANTHROPIC_API_KEY` to Environment Variables

### 3. Copy Files to Your Project

Copy the following files to your Next.js project:

```
your-nextjs-project/
├── app/
│   ├── api/
│   │   └── claude/
│   │       └── route.ts          (Copy this)
│   └── model-setup/
│       └── page.tsx               (Copy this)
└── components/
    ├── TemplateSelector.tsx       (Copy this)
    ├── PhotoOrganizer.tsx         (Copy this)
    ├── ProfileGeolocation.tsx     (Copy this)
    ├── ServiceSuggestions.tsx     (Copy this)
    ├── ImageMeasurementAnalysis.tsx (Copy this)
    ├── CompCardExtractor.tsx      (Copy this)
    └── BioGenerator.tsx           (Copy this)
```

### 4. Install Lucide Icons (if not already installed)

```bash
npm install lucide-react
```

## Usage

### Access the Full Demo Page

Navigate to: `http://localhost:3000/model-setup`

This page demonstrates all features together.

### Use Individual Components

Import and use components individually in your pages:

```tsx
import TemplateSelector from '@/components/TemplateSelector';
import BioGenerator from '@/components/BioGenerator';

export default function YourPage() {
  return (
    <div>
      <TemplateSelector />
      <BioGenerator />
    </div>
  );
}
```

## Component Details

### TemplateSelector
- Analyzes model experience and interests
- Recommends optimal portfolio template type
- Provides reasoning and feature suggestions

### PhotoOrganizer
- Scans photos for photographer watermarks/signatures
- Detects studio logos and backgrounds
- Returns confidence levels for each detection

### ProfileGeolocation
- Auto-detects user's city and country
- Fallback to manual entry if geolocation fails
- Uses free BigDataCloud API (no key required)

### ServiceSuggestions
- Analyzes model profile (experience, age, body type)
- Suggests 5-7 relevant modeling services
- Provides rationale for each suggestion

### ImageMeasurementAnalysis
- Attempts to estimate physical measurements from photos
- Provides honest confidence levels (high/medium/low)
- Recommends additional photos needed for accuracy
- Lists what cannot be determined

### CompCardExtractor
- Extracts text from comp card images or PDFs
- Parses stats: height, measurements, shoe size, etc.
- Includes contact info extraction
- One-click apply to profile

### BioGenerator
- Creates professional modeling bio (150-200 words)
- Third-person perspective
- Customized based on experience and achievements
- Copy to clipboard functionality

## API Route Information

The `/api/claude/route.ts` file handles all Claude API requests:

- Model: `claude-sonnet-4-5-20250929` (Sonnet 4.5)
- Default max_tokens: 4000
- Supports text, images, and PDF documents
- Error handling included

## Customization

### Styling
All components use Tailwind CSS classes. Customize colors and styles by modifying the className attributes.

### API Configuration
Modify `/app/api/claude/route.ts` to adjust:
- Max tokens limit
- System prompts
- Error handling

### Integration
These components are designed to work with your existing profile/setup flow. You'll need to:
- Connect form data to your database
- Implement the "Apply to Profile" logic
- Add proper authentication/authorization

## Important Notes

### Image Analysis Limitations
- AI cannot accurately measure from photos without reference objects
- Comp card scanning is the most reliable method
- Always verify AI-generated measurements

### API Costs
- Claude Sonnet 4.5 pricing applies
- Image analysis uses more tokens
- Monitor usage in Anthropic dashboard

### Privacy
- Images are sent to Anthropic's API
- No data is stored by these components
- Review Anthropic's privacy policy

## Support

For Claude API documentation:
- https://docs.anthropic.com

For issues with these components:
- Check console for error messages
- Verify API key is set correctly
- Ensure all dependencies are installed

## License

These components are provided as-is for your model portfolio project.
