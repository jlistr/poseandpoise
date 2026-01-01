'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';

interface BioInput {
  name: string;
  experience: string;
  specialties: string;
  achievements: string;
  personality: string;
}

export default function BioGenerator() {
  const [loading, setLoading] = useState(false);
  const [generatedBio, setGeneratedBio] = useState('');
  const [copied, setCopied] = useState(false);
  const [input, setInput] = useState<BioInput>({
    name: '',
    experience: '',
    specialties: '',
    achievements: '',
    personality: '',
  });

  const generateBio = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Write a professional modeling bio for:

Name: ${input.name}
Experience: ${input.experience}
Specialties: ${input.specialties}
Notable Achievements: ${input.achievements}
Personality/Style: ${input.personality}

Create an engaging, professional bio that:
- Is 150-200 words
- Highlights their unique qualities
- Sounds natural and authentic
- Is written in third person
- Emphasizes their professional strengths
- Ends with a call-to-action for bookings

Write ONLY the bio, no preamble or explanation.`,
            },
          ],
          system: 'You are an expert copywriter specializing in professional modeling bios. Write compelling, authentic content that helps models stand out.',
        }),
      });

      const data = await response.json();
      setGeneratedBio(data.content[0].text.trim());
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate bio');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedBio);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold">AI Bio Generator</h2>
        <Sparkles className="w-6 h-6 text-purple-500" />
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          <input
            type="text"
            value={input.name}
            onChange={(e) => setInput({ ...input, name: e.target.value })}
            placeholder="Your name"
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Experience</label>
          <textarea
            value={input.experience}
            onChange={(e) => setInput({ ...input, experience: e.target.value })}
            placeholder="Years of experience, types of work done..."
            className="w-full p-3 border rounded-lg min-h-[80px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Specialties & Niches
          </label>
          <textarea
            value={input.specialties}
            onChange={(e) => setInput({ ...input, specialties: e.target.value })}
            placeholder="Editorial, commercial, runway, fitness, etc."
            className="w-full p-3 border rounded-lg min-h-[80px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Notable Achievements
          </label>
          <textarea
            value={input.achievements}
            onChange={(e) => setInput({ ...input, achievements: e.target.value })}
            placeholder="Brands worked with, publications featured in..."
            className="w-full p-3 border rounded-lg min-h-[80px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Personality/Style
          </label>
          <textarea
            value={input.personality}
            onChange={(e) => setInput({ ...input, personality: e.target.value })}
            placeholder="Professional yet approachable, edgy, classic elegance..."
            className="w-full p-3 border rounded-lg min-h-[80px]"
          />
        </div>

        <button
          onClick={generateBio}
          disabled={loading || !input.name}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Bio...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Professional Bio
            </>
          )}
        </button>
      </div>

      {generatedBio && (
        <div className="space-y-4">
          <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg">Generated Bio</h3>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg hover:bg-gray-50 text-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {generatedBio}
            </p>
          </div>

          <button
            onClick={generateBio}
            className="text-purple-600 hover:underline text-sm"
          >
            Regenerate bio
          </button>
        </div>
      )}
    </div>
  );
}
