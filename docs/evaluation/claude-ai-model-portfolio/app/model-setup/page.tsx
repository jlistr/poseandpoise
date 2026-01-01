'use client';

import TemplateSelector from '@/components/TemplateSelector';
import PhotoOrganizer from '@/components/PhotoOrganizer';
import ProfileGeolocation from '@/components/ProfileGeolocation';
import ServiceSuggestions from '@/components/ServiceSuggestions';
import ImageMeasurementAnalysis from '@/components/ImageMeasurementAnalysis';
import CompCardExtractor from '@/components/CompCardExtractor';
import BioGenerator from '@/components/BioGenerator';

export default function ModelSetupPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 space-y-16">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            AI-Powered Model Portfolio Setup
          </h1>
          <p className="text-lg text-gray-600">
            Streamline your portfolio creation with Claude AI automation
          </p>
        </header>

        {/* Step 1: Template Selection */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold mb-2">
              Step 1
            </span>
            <h2 className="text-3xl font-bold text-gray-900">Template Selection</h2>
            <p className="text-gray-600 mt-2">
              Get AI recommendations for the best portfolio template based on your experience
            </p>
          </div>
          <TemplateSelector />
        </section>

        {/* Step 2: Photo Organization */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-2">
              Step 2
            </span>
            <h2 className="text-3xl font-bold text-gray-900">Photo Organization</h2>
            <p className="text-gray-600 mt-2">
              Automatically detect photographers and studios from your photos
            </p>
          </div>
          <PhotoOrganizer />
        </section>

        {/* Step 3: Profile Setup */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-2">
              Step 3
            </span>
            <h2 className="text-3xl font-bold text-gray-900">Profile Location</h2>
            <p className="text-gray-600 mt-2">
              Auto-detect your location or enter it manually
            </p>
          </div>
          <ProfileGeolocation />
        </section>

        {/* Step 4: Service Suggestions */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold mb-2">
              Step 4
            </span>
            <h2 className="text-3xl font-bold text-gray-900">Service Suggestions</h2>
            <p className="text-gray-600 mt-2">
              AI-powered recommendations for services to offer based on your profile
            </p>
          </div>
          <ServiceSuggestions />
        </section>

        {/* Step 5A: Image Analysis */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold mb-2">
              Step 5A
            </span>
            <h2 className="text-3xl font-bold text-gray-900">Physical Measurement Analysis</h2>
            <p className="text-gray-600 mt-2">
              AI estimation of measurements from photos (with limitations)
            </p>
          </div>
          <ImageMeasurementAnalysis />
        </section>

        {/* Step 5B: Comp Card Scanner */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-2">
              Step 5B (Recommended)
            </span>
            <h2 className="text-3xl font-bold text-gray-900">Comp Card Scanner</h2>
            <p className="text-gray-600 mt-2">
              Quick and accurate stats extraction from your composite card
            </p>
          </div>
          <CompCardExtractor />
        </section>

        {/* Step 5C: Bio Generator */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold mb-2">
              Step 5C
            </span>
            <h2 className="text-3xl font-bold text-gray-900">Professional Bio Generator</h2>
            <p className="text-gray-600 mt-2">
              Create a compelling bio with AI assistance
            </p>
          </div>
          <BioGenerator />
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm py-8">
          <p>Powered by Claude Sonnet 4.5 API</p>
          <p className="mt-2">
            All AI features require an Anthropic API key configured in your environment
          </p>
        </footer>
      </div>
    </div>
  );
}
