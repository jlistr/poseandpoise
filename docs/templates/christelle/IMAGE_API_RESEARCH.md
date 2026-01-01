# Image API Research for Christelle Template

## Purpose
Research image generation and stock photo APIs that can provide stunning, editorial-quality images to showcase the Christelle template to potential customers.

---

## Recommended APIs

### 1. **Unsplash Source API** (FREE - Recommended for Templates)
**Best for:** Immediate implementation, no API key required

```javascript
// Direct URL pattern for model/fashion images
const getUnsplashImage = (query, width = 1200, height = 1600) => {
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(query)}`;
};

// Usage examples for Christelle template:
const heroImage = getUnsplashImage('fashion model portrait', 1920, 1080);
const galleryImages = [
  getUnsplashImage('editorial fashion', 800, 1066),
  getUnsplashImage('model black and white', 800, 1066),
  getUnsplashImage('fashion photography', 800, 1066),
];
```

**Pros:** Free, no API key, high-quality editorial images
**Cons:** Random results, less control over specific images

---

### 2. **Pexels API** (FREE with API Key)
**Best for:** Production use with reliable results

```javascript
// API setup
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

const fetchPexelsImages = async (query, perPage = 10) => {
  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${query}&per_page=${perPage}&orientation=portrait`,
    {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    }
  );
  return response.json();
};

// Usage for template showcase:
const images = await fetchPexelsImages('fashion model editorial');
```

**Pros:** Free tier (200 requests/month), high-quality curated images, reliable
**Cons:** Requires API key, rate limited

---

### 3. **Replicate FLUX API** (AI Generation - Premium)
**Best for:** Unique, AI-generated model showcase images

```javascript
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const generateModelImage = async () => {
  const output = await replicate.run(
    "black-forest-labs/flux-1.1-pro",
    {
      input: {
        prompt: "Professional fashion model portrait, editorial photography, dramatic lighting, black and white, high contrast, studio setting, vogue style, elegant pose",
        aspect_ratio: "3:4",
        output_format: "webp",
        output_quality: 90,
      }
    }
  );
  return output;
};
```

**Pricing:** $0.04 per image (FLUX Schnell) / $0.055 per image (FLUX Pro)
**Pros:** Unique images, full creative control, no copyright concerns
**Cons:** Cost per image, requires API key

---

## Implementation Strategy

### For Template Preview/Showcase:
1. Use **Unsplash Source** for initial development (free, instant)
2. Generate 5-10 high-quality images with **Replicate FLUX** for official showcase
3. Store generated images in Supabase storage for consistent display

### Recommended Prompts for FLUX:

```javascript
const christellePrompts = {
  hero: "Dramatic close-up portrait of a fashion model, editorial photography, high contrast black and white, dramatic studio lighting, professional beauty photography, vogue magazine style",
  
  gallery: [
    "Full body fashion model pose, minimalist studio, editorial style, high fashion, dramatic lighting",
    "Fashion model profile portrait, artistic photography, black and white, dramatic shadows",
    "Editorial fashion photography, model in elegant pose, studio setting, high contrast",
    "Beauty portrait, fashion model, artistic lighting, editorial style, dramatic shadows",
  ],
  
  about: "Professional headshot of fashion model, confident expression, soft studio lighting, editorial portrait photography",
};
```

---

## Cost Estimate

### One-time Template Showcase Generation:
| Images | API | Cost |
|--------|-----|------|
| 1 Hero | FLUX Pro | $0.055 |
| 6 Gallery | FLUX Pro | $0.33 |
| 1 About | FLUX Pro | $0.055 |
| 2 Extras | FLUX Pro | $0.11 |
| **Total** | | **~$0.55** |

### Alternative: Use Unsplash (Free)
- Hero: 1 curated selection
- Gallery: 6 curated selections
- About: 1 curated selection
- **Total Cost: $0**

---

## Recommendation

For **initial development and testing**: Use Unsplash Source (free)

For **production template showcase**: Generate 10 images with FLUX Pro (~$0.55) and store in Supabase for consistent, unique display.

---

## Quick Implementation

```javascript
// utils/templateImages.ts
export const getChristelleShowcaseImages = () => ({
  hero: 'https://source.unsplash.com/1920x1080/?fashion,model,editorial',
  gallery: [
    'https://source.unsplash.com/800x1066/?model,portrait,bw',
    'https://source.unsplash.com/800x1066/?fashion,photography',
    'https://source.unsplash.com/800x1066/?editorial,model',
    'https://source.unsplash.com/800x1066/?fashion,beauty',
    'https://source.unsplash.com/800x1066/?model,artistic',
    'https://source.unsplash.com/800x1066/?fashion,portrait',
  ],
  about: 'https://source.unsplash.com/600x800/?model,headshot',
});
```

