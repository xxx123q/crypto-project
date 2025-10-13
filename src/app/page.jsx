"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Homepage() {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    async function loadData() {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1"
      );
      const data = await res.json();
      setCoins(data);
    }
    loadData();
  }, []);

  return (
    <div>
      <h1>Cryto List</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Symbol</th>
            <th>Price</th>
            <th>24h volume</th>
            <th>Market Cap</th>
          </tr>
        </thead>
        <tbody>
          {coins.map((coin) => (
            <tr key={coin.id}>
              <td>
                <Link href={`/coin/${coin.id}`}>{coin.name}</Link>
              </td>
              <td>{coin.symbol}</td>
              <td>${coin.current_price}</td>
              <td>${coin.total_volume}</td>
              <td>${coin.market_cap}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
