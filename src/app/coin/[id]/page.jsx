"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";

export default function CoinDetail({ params }) {
  const { id } = use(params);
  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCoinData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/${id}?localization=false`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch coin data");
        }

        const data = await res.json();
        if (!data || !data.name || !data.symbol || !data.market_data) {
          throw new Error("Coin data is incomplete");
        }
        setCoin(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCoinData();
  }, [id]);

  if (loading) return <p>Loading...</p>;

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
        <Link href="/">
          <button>Go Back to List</button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/">← Back</Link>
      {coin.image?.large && (
        <img src={coin.image.large} alt={`${coin.name} logo`} />
      )}
      <h1>
        {coin.name} ({coin.symbol.toUpperCase()})
      </h1>
      <p>
        <strong>Price: </strong>
        {coin.market_data?.current_price?.usd || "Price not available"}
      </p>
      <p>
        <strong>24h High: </strong>
        {coin.market_data?.high_24h?.usd || "N/A"}
      </p>
      <p>
        <strong>24h Low: </strong>
        {coin.market_data?.low_24h?.usd || "N/A"}
      </p>
      <p>{coin.description?.en || "Description not available."}</p>
    </div>
  );
}
