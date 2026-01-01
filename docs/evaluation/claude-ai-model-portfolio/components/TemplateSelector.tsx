'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface TemplateRecommendation {
  templateType: string;
  reasoning: string;
  features: string[];
}

export default function TemplateSelector() {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<TemplateRecommendation | null>(null);
  const [experience, setExperience] = useState('');
  const [interests, setInterests] = useState('');

  const getTemplateRecommendation = async () => {
    if (!experience || !interests) {
      alert('Please fill in both fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `As a modeling portfolio expert, recommend the best portfolio template type for a model with the following profile:

Experience: ${experience}
Interests/Focus: ${interests}

Provide your recommendation in this JSON format:
{
  "templateType": "Editorial/Commercial/Runway/Fitness/Fashion/Lifestyle",
  "reasoning": "Brief explanation why this template suits them",
  "features": ["feature1", "feature2", "feature3"]
}`,
            },
          ],
          system: 'You are an expert in modeling portfolios and website design. Provide practical, actionable recommendations based on the model\'s experience and interests.',
        }),
      });

      const data = await response.json();
      const content = data.content[0].text;
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setRecommendation(parsed);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to get recommendation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Choose Your Template</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Your Modeling Experience
          </label>
          <textarea
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="e.g., 3 years of runway and editorial work, featured in Vogue..."
            className="w-full p-3 border rounded-lg min-h-[100px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Your Focus & Interests
          </label>
          <textarea
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="e.g., High fashion editorial, commercial campaigns, fitness modeling..."
            className="w-full p-3 border rounded-lg min-h-[100px]"
          />
        </div>

        <button
          onClick={getTemplateRecommendation}
          disabled={loading}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Get AI Recommendation
            </>
          )}
        </button>
      </div>

      {recommendation && (
        <div className="mt-6 p-6 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="text-xl font-bold mb-4">
            Recommended: {recommendation.templateType} Template
          </h3>
          <p className="text-gray-700 mb-4">{recommendation.reasoning}</p>
          <div>
            <h4 className="font-semibold mb-2">Key Features:</h4>
            <ul className="list-disc list-inside space-y-1">
              {recommendation.features.map((feature, idx) => (
                <li key={idx} className="text-gray-600">{feature}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
