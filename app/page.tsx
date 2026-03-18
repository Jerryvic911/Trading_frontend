"use client";
import { useState, useEffect } from "react";

export default function Home() {
  interface Signal {
    pair: string;
    signal: "CALL" | "PUT";
    score: number;
  }

  interface HistoryItem extends Signal {
    time: string;
  }

  const [data, setData] = useState<Signal | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSignal = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/signal`);
      const json = await res.json();

      setData(json);

      // Add to history
      setHistory((prev) => [
        {
          ...json,
          time: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 4), // keep last 5 signals
      ]);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSignal();
    const interval = setInterval(fetchSignal, 20000);
    return () => clearInterval(interval);
  }, []);

  const getColor = (signal: string): string => {
    if (signal === "CALL") return "text-green-500";
    if (signal === "PUT") return "text-red-500";
    return "text-gray-500";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-lg text-center w-80">
        <h1 className="text-2xl font-bold mb-4">Trading Dashboard</h1>

        {loading && <p>Loading...</p>}

        {data && (
          <>
            <p>Pair: {data.pair}</p>
            <p className={`text-3xl font-bold ${getColor(data.signal)}`}>
              {data.signal}
            </p>
            <p>Score: {data.score}</p>
          </>
        )}

        <button
          onClick={fetchSignal}
          className="mt-4 bg-blue-600 px-4 py-2 rounded-lg"
        >
          Refresh
        </button>
      </div>

      {/* HISTORY */}
      <div className="mt-6 w-80">
        <h2 className="text-lg font-bold mb-2">Signal History</h2>

        {history.map((item, index) => (
          <div
            key={index}
            className="bg-gray-800 p-3 rounded-lg mb-2 flex justify-between"
          >
            <span>{item.time}</span>
            <span className={getColor(item.signal)}>
              {item.signal}
            </span>
            <span>{item.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}