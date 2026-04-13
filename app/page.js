"use client";

import { useState } from "react";

export default function Home() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [budget, setBudget] = useState("");
  const [interests, setInterests] = useState("");
  const [itinerary, setItinerary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setItinerary("");

    try {
      const res = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination,
          days,
          budget,
          interests: interests.split(","),
        }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
      } else {
        setItinerary(data.itinerary);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <main style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>🌍 AI Trip Planner</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          required
        />
        <br /><br />

        <input
          type="number"
          placeholder="Days"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          required
        />
        <br /><br />

        <input
          type="text"
          placeholder="Budget (low / medium / high)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          required
        />
        <br /><br />

        <input
          type="text"
          placeholder="Interests (comma separated)"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
        />
        <br /><br />

        <button type="submit">Generate Trip</button>
      </form>

      <br />

      {/* ✅ Loading UI */}
      {loading && <p>⏳ Planning your trip... please wait</p>}

      {/* ✅ Output */}
      {itinerary && (
        <div style={{ whiteSpace: "pre-wrap" }}>
          <h2>📅 Your Itinerary</h2>
          <p>{itinerary}</p>
        </div>
      )}
    </main>
  );
}
