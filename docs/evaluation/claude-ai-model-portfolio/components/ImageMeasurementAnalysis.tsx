'use client';

import { useState } from 'react';
import { ScanLine, Loader2, AlertCircle } from 'lucide-react';

interface MeasurementAnalysis {
  height?: string;
  waist?: string;
  bust?: string;
  shoeSize?: string;
  hairColor?: string;
  eyeColor?: string;
  confidence: 'high' | 'medium' | 'low';
  analysis: string;
  recommendations: string[];
  missingInfo: string[];
}

export default function ImageMeasurementAnalysis() {
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<MeasurementAnalysis | null>(null);

  const analyzeImages = async () => {
    if (photos.length === 0) {
      alert('Please upload at least one photo');
      return;
    }

    setLoading(true);
    try {
      const imagePromises = photos.map(async (photo) => {
        const base64 = await fileToBase64(photo);
        return {
          base64: base64.split(',')[1],
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
                  text: `Analyze these modeling photos to estimate physical measurements. Be VERY CAREFUL and conservative in your estimates. Only provide measurements you have reasonable confidence in.

Look for:
- Full body shots for height estimation (using proportions and reference objects)
- Close-ups for hair and eye color
- Body composition photos for measurements
- Comp cards or modeling sheets that might show measurements

Provide analysis in JSON format:
{
  "height": "estimate with unit or null",
  "waist": "estimate or null",
  "bust": "estimate or null",
  "shoeSize": "estimate or null",
  "hairColor": "description or null",
  "eyeColor": "description or null",
  "confidence": "high/medium/low",
  "analysis": "Detailed explanation of what you can see and your reasoning",
  "recommendations": ["What additional photos would help", "Specific angles or poses needed"],
  "missingInfo": ["List what you cannot determine from these photos"]
}

IMPORTANT: 
- Be honest about limitations
- Don't guess if you're not confident
- Explain your reasoning clearly
- Height estimates are very difficult without reference objects
- Measurements like bust/waist are nearly impossible without clear reference or the person telling you`,
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
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setAnalysis(JSON.parse(jsonMatch[0]));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to analyze images');
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
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold">AI Measurement Analysis</h2>
        <AlertCircle className="w-5 h-5 text-amber-500" />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> AI analysis of measurements from photos has
          limitations. For best results, upload high-quality full-body shots
          with reference objects, or better yet, upload your comp card if you
          have one.
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setPhotos(Array.from(e.target.files || []))}
          className="hidden"
          id="measurement-upload"
        />
        <label
          htmlFor="measurement-upload"
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <ScanLine className="w-12 h-12 text-gray-400" />
          <span className="text-gray-600">
            Upload photos for analysis ({photos.length} selected)
          </span>
          <span className="text-xs text-gray-500">
            Best: Full body shots, comp cards, professional photos
          </span>
        </label>
      </div>

      {photos.length > 0 && (
        <button
          onClick={analyzeImages}
          disabled={loading}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing {photos.length} photos...
            </>
          ) : (
            <>
              <ScanLine className="w-5 h-5" />
              Analyze Measurements
            </>
          )}
        </button>
      )}

      {analysis && (
        <div className="space-y-6">
          <div
            className={`p-4 rounded-lg ${
              analysis.confidence === 'high'
                ? 'bg-green-50 border border-green-200'
                : analysis.confidence === 'medium'
                ? 'bg-yellow-50 border border-yellow-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold">Confidence Level:</span>
              <span className="uppercase text-sm">{analysis.confidence}</span>
            </div>
            <p className="text-sm text-gray-700">{analysis.analysis}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <h3 className="font-bold mb-3">Detected Measurements</h3>
              <dl className="space-y-2 text-sm">
                {analysis.height && (
                  <>
                    <dt className="font-medium">Height:</dt>
                    <dd className="text-gray-700">{analysis.height}</dd>
                  </>
                )}
                {analysis.waist && (
                  <>
                    <dt className="font-medium">Waist:</dt>
                    <dd className="text-gray-700">{analysis.waist}</dd>
                  </>
                )}
                {analysis.bust && (
                  <>
                    <dt className="font-medium">Bust:</dt>
                    <dd className="text-gray-700">{analysis.bust}</dd>
                  </>
                )}
                {analysis.shoeSize && (
                  <>
                    <dt className="font-medium">Shoe Size:</dt>
                    <dd className="text-gray-700">{analysis.shoeSize}</dd>
                  </>
                )}
                {analysis.hairColor && (
                  <>
                    <dt className="font-medium">Hair Color:</dt>
                    <dd className="text-gray-700">{analysis.hairColor}</dd>
                  </>
                )}
                {analysis.eyeColor && (
                  <>
                    <dt className="font-medium">Eye Color:</dt>
                    <dd className="text-gray-700">{analysis.eyeColor}</dd>
                  </>
                )}
              </dl>
            </div>

            <div className="p-4 bg-white rounded-lg border">
              <h3 className="font-bold mb-3">Missing Information</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {analysis.missingInfo.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-bold mb-3">Recommendations for Better Results</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-900">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
