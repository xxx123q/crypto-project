"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Homepage() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 50;

  useEffect(() => {
    async function fetchTotalCoins() {
      const res = await fetch("https://api.coingecko.com/api/v3/coins/list");
      const coinList = await res.json();
      const listLength = coinList.length;
      setTotalPages(Math.ceil(listLength / perPage));
    }
    fetchTotalCoins();
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const currency = "usd";
      const order = "market_cap_desc";
      const pageNumber = page;
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=${order}&per_page=${perPage}&page=${pageNumber}`
      );
      const data = await res.json();
      setCoins(data);
      setLoading(false);
    }
    loadData();
  }, [page]);

  if (loading) return <p>Loading...</p>;

  const getPageNumbers = () => {
    const totalPageShowing = 5;
    let start = Math.max(1, page - Math.floor(totalPageShowing / 2));
    let end = start + totalPageShowing - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - totalPageShowing + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

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
      <button
        onClick={() => setPage((p) => Math.max(p - 1, 1))}
        disabled={page === 1}
      >
        ← Prev
      </button>

      {getPageNumbers().map((pageNum) => (
        <button key={pageNum} onClick={() => setPage(pageNum)}>
          {pageNum}
        </button>
      ))}

      <button
        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
        disabled={page === totalPages}
      >
        Next →
      </button>
    </div>
  );
}
