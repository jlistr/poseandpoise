'use client';

import { useState } from 'react';
import { FileText, Loader2, CheckCircle2 } from 'lucide-react';

interface CompCardData {
  name?: string;
  height?: string;
  waist?: string;
  bust?: string;
  hips?: string;
  shoeSize?: string;
  hairColor?: string;
  eyeColor?: string;
  dressSize?: string;
  agency?: string;
  phoneNumber?: string;
  email?: string;
  rawText: string;
  confidence: 'high' | 'medium' | 'low';
}

export default function CompCardExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CompCardData | null>(null);

  const extractCompCard = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const base64 = await fileToBase64(file);
      const fileType = file.type;
      const isImage = fileType.startsWith('image/');
      const isPDF = fileType === 'application/pdf';

      const content: any[] = [
        {
          type: 'text',
          text: `Extract all modeling statistics and contact information from this comp card. 

Look for:
- Name
- Height (ft/in or cm)
- Bust, Waist, Hips measurements
- Dress/Clothing size
- Shoe size
- Hair color
- Eye color
- Agency name
- Contact information

Return JSON format:
{
  "name": "value or null",
  "height": "value or null",
  "waist": "value or null",
  "bust": "value or null",
  "hips": "value or null",
  "shoeSize": "value or null",
  "hairColor": "value or null",
  "eyeColor": "value or null",
  "dressSize": "value or null",
  "agency": "value or null",
  "phoneNumber": "value or null",
  "email": "value or null",
  "rawText": "all text extracted from the card",
  "confidence": "high/medium/low"
}`,
        },
      ];

      if (isImage) {
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: fileType,
            data: base64.split(',')[1],
          },
        });
      } else if (isPDF) {
        content.push({
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: base64.split(',')[1],
          },
        });
      }

      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content,
            },
          ],
          maxTokens: 4000,
        }),
      });

      const result = await response.json();
      const text = result.content[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setData(JSON.parse(jsonMatch[0]));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to extract comp card data');
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

  const applyToProfile = () => {
    // This would integrate with your profile form
    console.log('Applying data to profile:', data);
    alert('Data applied to profile! (Implement actual profile update logic)');
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Comp Card Scanner</h2>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          <strong>Recommended:</strong> Upload your composite card (image or PDF)
          for quick and accurate stats extraction.
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
          id="compcard-upload"
        />
        <label
          htmlFor="compcard-upload"
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <FileText className="w-12 h-12 text-gray-400" />
          <span className="text-gray-600">
            {file ? file.name : 'Upload Comp Card (Image or PDF)'}
          </span>
        </label>
      </div>

      {file && (
        <button
          onClick={extractCompCard}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Extracting Data...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              Extract Comp Card Data
            </>
          )}
        </button>
      )}

      {data && (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-lg ${
              data.confidence === 'high'
                ? 'bg-green-50 border border-green-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold">
                Extraction Confidence: {data.confidence.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(data)
              .filter(([key]) => key !== 'rawText' && key !== 'confidence')
              .map(([key, value]) =>
                value ? (
                  <div key={key} className="p-3 bg-white rounded-lg border">
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      {key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, (str) => str.toUpperCase())}
                    </div>
                    <div className="font-semibold">{value as string}</div>
                  </div>
                ) : null
              )}
          </div>

          <button
            onClick={applyToProfile}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Apply to Profile
          </button>

          <details className="p-4 bg-gray-50 rounded-lg">
            <summary className="cursor-pointer font-medium">
              View Raw Extracted Text
            </summary>
            <pre className="mt-3 text-xs whitespace-pre-wrap text-gray-700">
              {data.rawText}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
