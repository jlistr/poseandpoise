'use client';

import { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';

interface PhotoMetadata {
  fileName: string;
  suggestedPhotographer?: string;
  suggestedStudio?: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
}

export default function PhotoOrganizer() {
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<PhotoMetadata[]>([]);

  const analyzePhotos = async () => {
    if (photos.length === 0) return;

    setLoading(true);
    try {
      // Convert images to base64
      const imagePromises = photos.map(async (photo) => {
        const base64 = await fileToBase64(photo);
        return {
          fileName: photo.name,
          base64: base64.split(',')[1], // Remove data:image/jpeg;base64, prefix
          type: photo.type,
        };
      });

      const imageData = await Promise.all(imagePromises);

      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze these modeling photos and extract metadata. Look for:
- Photographer watermarks or signatures
- Studio logos or backgrounds
- EXIF data hints in visible elements
- Professional studio characteristics

For each image, provide JSON:
{
  "fileName": "name",
  "suggestedPhotographer": "name or null",
  "suggestedStudio": "name or null",
  "confidence": "high/medium/low",
  "reasoning": "why you made this suggestion"
}

Return an array of these objects.`,
                },
                ...imageData.map((img) => ({
                  type: 'image' as const,
                  source: {
                    type: 'base64' as const,
                    media_type: img.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                    data: img.base64,
                  },
                })),
              ],
            },
          ],
          maxTokens: 4000,
        }),
      });

      const data = await response.json();
      const content = data.content[0].text;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        setMetadata(JSON.parse(jsonMatch[0]));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to analyze photos');
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Photo Organization Assistant</h2>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setPhotos(Array.from(e.target.files || []))}
          className="hidden"
          id="photo-upload"
        />
        <label
          htmlFor="photo-upload"
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <Camera className="w-12 h-12 text-gray-400" />
          <span className="text-gray-600">
            Click to upload photos ({photos.length} selected)
          </span>
        </label>
      </div>

      {photos.length > 0 && (
        <button
          onClick={analyzePhotos}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing {photos.length} photos...
            </>
          ) : (
            `Analyze ${photos.length} Photos with AI`
          )}
        </button>
      )}

      {metadata.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Analysis Results</h3>
          {metadata.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-white rounded-lg border shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold">{item.fileName}</h4>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    item.confidence === 'high'
                      ? 'bg-green-100 text-green-800'
                      : item.confidence === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {item.confidence} confidence
                </span>
              </div>
              {item.suggestedPhotographer && (
                <p className="text-sm">
                  <span className="font-medium">Photographer:</span>{' '}
                  {item.suggestedPhotographer}
                </p>
              )}
              {item.suggestedStudio && (
                <p className="text-sm">
                  <span className="font-medium">Studio:</span>{' '}
                  {item.suggestedStudio}
                </p>
              )}
              <p className="text-sm text-gray-600 mt-2">{item.reasoning}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
