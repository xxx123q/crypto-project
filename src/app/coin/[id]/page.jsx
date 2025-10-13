"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";

export default function CoinDetail({ params }) {
  const { id } = use(params);
  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCoinData() {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}?localization=false`
      );
      const data = await res.json();
      setCoin(data);
      setLoading(false);
    }
    fetchCoinData();
  }, [id]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <Link href="/">back</Link>
      <p>
        {coin.name} {coin.symbol}
      </p>
      <p>{coin.description.en}</p>
    </div>
  );
}
