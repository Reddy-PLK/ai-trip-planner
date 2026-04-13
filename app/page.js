// app/page.js
"use client";

import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    destination: "",
    days: "",
    budget: "",
    interests: [],
  });

  const [itinerary, setItinerary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const interestOptions = [
    "🍜 Food & Cuisine",
    "🏔️ Adventure & Outdoors",
    "🎭 Culture & History",
    "🛍️ Shopping",
    "🎨 Art & Museums",
    "🌿 Nature & Wildlife",
    "🎉 Nightlife",
    "🧘 Wellness & Spa",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInterestToggle = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.destination || !formData.days || !formData.budget) {
      setError("Please fill in destination, days, and budget.");
      return;
    }

    setLoading(true);
    setError("");
    setItinerary("");

    try {
      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setItinerary(data.itinerary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItinerary = (text) => {
    return text.split("\n").map((line, index) => {
      // "Day X:" headers
      if (line.match(/^Day \d+:/i)) {
        return (
          <h3
            key={index}
            className="text-lg font-bold text-blue-700 mt-6 mb-2 border-b border-blue-100 pb-1"
          >
            {line}
          </h3>
        );
      }
      // Section headers like "Trip Overview" or "Practical Tips"
      if (line.match(/^(Trip Overview|Practical Tips|##)/i)) {
        return (
          <h3 key={index} className="text-lg font-bold text-indigo-700 mt-6 mb-2">
            {line.replace(/^##\s*/, "")}
          </h3>
        );
      }
      // Lines with **bold** text
      if (line.includes("**")) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={index} className="text-gray-700 leading-relaxed">
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <strong key={i} className="text-gray-900">
                  {part}
                </strong>
              ) : (
                part
              )
            )}
          </p>
        );
      }
      // Bullet points
      if (line.startsWith("- ") || line.startsWith("• ")) {
        return (
          <p key={index} className="text-gray-700 leading-relaxed pl-4 flex gap-2">
            <span className="text-blue-400">•</span>
            <span>{line.replace(/^[-•]\s*/, "")}</span>
          </p>
        );
      }
      // Empty lines
      if (line.trim() === "") {
        return <div key={index} className="h-2" />;
      }
      // Regular text
      return (
        <p key={index} className="text-gray-700 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 px-4 text-center shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">✈️ AI Trip Planner</h1>
        <p className="text-blue-100 text-lg max-w-xl mx-auto">
          Tell us your travel dreams. We'll build your perfect itinerary in seconds.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* INPUT FORM */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🗺️ Plan Your Trip</h2>

          {/* Destination + Days */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📍 Destination
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                placeholder="e.g. Tokyo, Japan"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📅 Number of Days
              </label>
              <input
                type="number"
                name="days"
                value={formData.days}
                onChange={handleInputChange}
                placeholder="e.g. 7"
                min="1"
                max="30"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          {/* Budget */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              💰 Budget
            </label>
            <select
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
            >
              <option value="">Select your budget range</option>
              <option value="budget">🪙 Budget (Under $50/day)</option>
              <option value="moderate">💵 Moderate ($50–$150/day)</option>
              <option value="luxury">💎 Luxury ($150+/day)</option>
            </select>
          </div>

          {/* Interests */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              ❤️ Interests{" "}
              <span className="text-gray-400 font-normal">(select all that apply)</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                    formData.interests.includes(interest)
                      ? "bg-blue-600 border-blue-600 text-white shadow-md scale-105"
                      : "bg-white border-gray-200 text-gray-700 hover:border-blue-300"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl text-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? "🤖 Generating your itinerary..." : "✨ Generate My Itinerary"}
          </button>
        </form>

        {/* LOADING */}
        {loading && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
            <div className="text-6xl mb-4 animate-bounce">🌍</div>
            <p className="text-xl font-semibold text-gray-700">Our AI is planning your trip...</p>
            <p className="text-gray-400 mt-2">This takes about 10–15 seconds</p>
          </div>
        )}

        {/* ITINERARY RESULT */}
        {itinerary && !loading && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              🗓️ Your Personalized Itinerary
            </h2>
            <div className="space-y-2">{renderItinerary(itinerary)}</div>
            <button
              onClick={() => {
                setItinerary("");
                window.scrollTo(0, 0);
              }}
              className="mt-8 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition"
            >
              ← Plan Another Trip
            </button>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <footer className="text-center py-8 text-gray-400 text-sm">
        Built with ❤️ using Next.js + Claude AI
      </footer>
    </main>
  );
}