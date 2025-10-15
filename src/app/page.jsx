"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Homepage() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState({
    key: "market_cap",
    direction: "desc",
  });
  const [searchItem, setSearchItem] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const perPage = 50;

  //get number of coin
  useEffect(() => {
    async function fetchTotalCoins() {
      setError(null);
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/coins/list");
        if (!res.ok) throw new Error("Failed to fetch coins list.");
        const coinList = await res.json();
        const listLength = coinList.length;
        setTotalPages(Math.ceil(listLength / perPage));
      } catch (err) {
        setError(err.message);
      }
    }
    fetchTotalCoins();
  }, []);

  //load coin data
  useEffect(() => {
    async function loadCoinData() {
      setLoading(true);
      setError(null);
      try {
        const currency = "usd";
        const order = "market_cap_desc";
        const pageNumber = page;
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=${order}&per_page=${perPage}&page=${pageNumber}`
        );
        if (!res.ok) throw new Error("Failed to load coin data.");
        const coinData = await res.json();
        setCoins(coinData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadCoinData();
  }, [page]);

  //deal with search function
  useEffect(() => {
    if (!searchItem.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    async function fetchSearchResults() {
      setError(null);
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/search?query=${searchItem}`
        );
        if (!res.ok) throw new Error("Search failed.");
        const dropDownResult = await res.json();
        setSearchResults(dropDownResult.coins || []);
        setShowDropdown(true);
      } catch (err) {
        setSearchResults([]);
        setError(err.message);
      }
    }
    fetchSearchResults();
  }, [searchItem]);

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

  const handleSort = (key) => {
    let direction = "asc";
    if (sort.key === key && sort.direction === "asc") {
      direction = "desc";
    }
    setSort({ key, direction });

    setCoins((prevCoins) => {
      return [...prevCoins].sort((a, b) => {
        if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
        if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
        return 0;
      });
    });
  };

  const getSortArrow = (key) => {
    if (sort.key !== key) return "";
    return sort.direction === "asc" ? " ↑" : " ↓";
  };

  const handleSearch = () => {
    if (!selectedCoin && searchResults.length === 0) return;
    const coin = selectedCoin || searchResults[0];
    if (coin) {
      router.push(`/coin/${coin.id}`);
      setShowDropdown(false);
      setSearchItem("");
      setSelectedCoin(null);
    }
  };

  return (
    <div>
      <h1>Cryto List</h1>
      {error && <div style={{ color: "red" }}>Error: {error}</div>}{" "}
      <div>
        <input
          type="text"
          placeholder="Search for a coin..."
          value={searchItem}
          onChange={(e) => {
            setSearchItem(e.target.value);
            setSelectedCoin(null);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
        {showDropdown && (
          <div>
            {searchResults.length > 0 ? (
              searchResults.slice(0, 5).map((coin) => (
                <div
                  key={coin.id}
                  onClick={() => {
                    setSelectedCoin(coin);
                    setSearchItem(coin.name);
                    setShowDropdown(false);
                  }}
                >
                  {coin.name}
                </div>
              ))
            ) : (
              <div>No results found</div>
            )}
          </div>
        )}

        <button
          onClick={handleSearch}
          disabled={searchResults.length === 0 && !selectedCoin}
        >
          Search
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort("name")}>
              Name{getSortArrow("name")}
            </th>
            <th onClick={() => handleSort("current_price")}>
              Price{getSortArrow("current_price")}
            </th>
            <th onClick={() => handleSort("total_volume")}>
              24h Volume{getSortArrow("total_volume")}
            </th>
            <th onClick={() => handleSort("market_cap")}>
              Market Cap{getSortArrow("market_cap")}
            </th>
          </tr>
        </thead>
        <tbody>
          {coins.map((coin) => (
            <tr key={coin.id}>
              <td>
                <Link href={`/coin/${coin.id}`}>
                  {coin.name} ({coin.symbol})
                </Link>
              </td>
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
