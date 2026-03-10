"use client";

import { useState } from "react";

const TravelAssistant = () => {

  const [question, setQuestion] = useState("");

  return (
    <div className="bg-white shadow-xl rounded-xl p-5 h-full">

      <h2 className="font-semibold text-lg mb-4">
        🤖 AI Travel Assistant
      </h2>

      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask about restaurants, travel tips..."
        className="w-full border rounded-lg px-3 py-2 mb-4"
      />

      <button className="w-full bg-indigo-600 text-white py-2 rounded-lg">
        Ask AI
      </button>

      <div className="mt-6 text-sm text-gray-500">

        <p className="font-medium mb-2">Suggestions:</p>

        <ul className="space-y-1">
          <li>• Best cafes near my hotel</li>
          <li>• Hidden places to explore</li>
          <li>• Travel budget tips</li>
          <li>• Best sunset spots</li>
        </ul>

      </div>

    </div>
  );
};

export default TravelAssistant;