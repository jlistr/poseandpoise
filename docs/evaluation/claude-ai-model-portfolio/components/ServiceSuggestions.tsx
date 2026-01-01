'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface Service {
  name: string;
  description: string;
  rationale: string;
}

interface ProfileData {
  experience: string;
  specialties: string;
  bodyType: string;
  age: number;
}

export default function ServiceSuggestions() {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [profile, setProfile] = useState<ProfileData>({
    experience: '',
    specialties: '',
    bodyType: '',
    age: 0,
  });

  const suggestServices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Based on this model's profile, suggest appropriate modeling services they should offer:

Experience: ${profile.experience}
Specialties: ${profile.specialties}
Body Type: ${profile.bodyType}
Age: ${profile.age}

Provide 5-7 service suggestions in JSON format:
[
  {
    "name": "Service Name",
    "description": "What this service entails",
    "rationale": "Why this fits their profile"
  }
]`,
            },
          ],
          system: 'You are a modeling industry expert who understands different modeling niches and what services models should offer based on their profiles.',
        }),
      });

      const data = await response.json();
      const content = data.content[0].text;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        setServices(JSON.parse(jsonMatch[0]));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to get service suggestions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Service Suggestions</h2>

      <div className="grid gap-4">
        <input
          type="text"
          placeholder="Experience (e.g., 5 years runway and editorial)"
          value={profile.experience}
          onChange={(e) =>
            setProfile({ ...profile, experience: e.target.value })
          }
          className="w-full p-3 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Specialties (e.g., High fashion, commercial)"
          value={profile.specialties}
          onChange={(e) =>
            setProfile({ ...profile, specialties: e.target.value })
          }
          className="w-full p-3 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Body Type (e.g., Athletic, Petite, Plus-size)"
          value={profile.bodyType}
          onChange={(e) =>
            setProfile({ ...profile, bodyType: e.target.value })
          }
          className="w-full p-3 border rounded-lg"
        />
        <input
          type="number"
          placeholder="Age"
          value={profile.age || ''}
          onChange={(e) =>
            setProfile({ ...profile, age: parseInt(e.target.value) || 0 })
          }
          className="w-full p-3 border rounded-lg"
        />
      </div>

      <button
        onClick={suggestServices}
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Suggestions...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Get AI Service Suggestions
          </>
        )}
      </button>

      {services.length > 0 && (
        <div className="grid gap-4 mt-6">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200"
            >
              <h3 className="font-bold text-lg mb-2">{service.name}</h3>
              <p className="text-gray-700 mb-2">{service.description}</p>
              <p className="text-sm text-indigo-600 italic">
                {service.rationale}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
