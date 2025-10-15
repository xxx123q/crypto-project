"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  MenuItem,
  Pagination,
  Divider,
} from "@mui/material";

export default function Homepage() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState({ key: "market_cap", direction: "desc" });
  const [searchItem, setSearchItem] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const perPage = 50;
  const inputRef = useRef(null);

  // Fetch total number of coins
  useEffect(() => {
    async function fetchTotalCoins() {
      setError(null);
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/coins/list");
        if (!res.ok) throw new Error("Failed to fetch coins list.");
        const data = await res.json();
        setTotalPages(Math.ceil(data.length / perPage));
      } catch (err) {
        setError(err.message);
      }
    }
    fetchTotalCoins();
  }, []);

  // Fetch coin data per page
  useEffect(() => {
    async function loadCoinData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=aud&order=market_cap_desc&per_page=${perPage}&page=${page}`
        );
        if (!res.ok) throw new Error("Failed to load coin data.");
        const data = await res.json();
        setCoins(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadCoinData();
  }, [page]);

  // Search with debounce
  useEffect(() => {
    if (!searchItem.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/search?query=${searchItem}`
        );
        if (!res.ok) throw new Error("Search failed.");
        const data = await res.json();
        setSearchResults(data.coins || []);
        setShowDropdown(true);
      } catch (err) {
        setSearchResults([]);
        setError(err.message);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchItem]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sort.key === key && sort.direction === "asc") direction = "desc";
    setSort({ key, direction });
    setCoins((prevCoins) =>
      [...prevCoins].sort((a, b) => {
        if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
        if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
        return 0;
      })
    );
  };

  const handleSearch = () => {
    const coin = selectedCoin || searchResults[0];
    if (coin) {
      router.push(`/coin/${coin.id}`);
      setShowDropdown(false);
      setSearchItem("");
      setSelectedCoin(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
      <Typography variant="h3" align="center" gutterBottom fontWeight={700}>
        Coin List
      </Typography>

      {error && (
        <Typography color="error" align="center" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
      )}

      {/* Search*/}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 4,
          position: "relative",
        }}
      >
        <Box sx={{ position: "relative", width: "60%" }} ref={inputRef}>
          <TextField
            label="Search for a coin..."
            variant="outlined"
            value={searchItem}
            onChange={(e) => {
              setSearchItem(e.target.value);
              setSelectedCoin(null);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            fullWidth
            sx={{
              backgroundColor: "white",
            }}
          />

          {showDropdown && (
            <Paper
              elevation={4}
              sx={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                mt: 1,
                maxHeight: 300,
                overflowY: "auto",
                borderRadius: 2,
                zIndex: 10,
              }}
            >
              {searchResults.length > 0 ? (
                searchResults.slice(0, 8).map((coin, index) => (
                  <Box key={coin.id}>
                    <MenuItem
                      onClick={() => {
                        setSelectedCoin(coin);
                        setSearchItem(coin.name);
                        setShowDropdown(false);
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        py: 1.2,
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      <img
                        src={coin.thumb}
                        alt={coin.name}
                        width={24}
                        height={24}
                        style={{ borderRadius: "50%" }}
                      />
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {coin.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ textTransform: "uppercase" }}
                        >
                          {coin.symbol}
                        </Typography>
                      </Box>
                    </MenuItem>
                    {index < searchResults.length - 1 && (
                      <Divider sx={{ mx: 1 }} />
                    )}
                  </Box>
                ))
              ) : (
                <Typography
                  variant="body2"
                  align="center"
                  sx={{ p: 2, color: "text.secondary" }}
                >
                  No results found
                </Typography>
              )}
            </Paper>
          )}
        </Box>

        <Button
          variant="contained"
          color="primary"
          sx={{ ml: 2, height: "56px" }}
          onClick={handleSearch}
          disabled={searchResults.length === 0 && !selectedCoin}
        >
          Search
        </Button>
      </Box>

      {/* List */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell onClick={() => handleSort("name")}>
                  <b>Name</b>
                </TableCell>
                <TableCell onClick={() => handleSort("current_price")}>
                  <b>Price (AUD)</b>
                </TableCell>
                <TableCell onClick={() => handleSort("total_volume")}>
                  <b>24h Volume</b>
                </TableCell>
                <TableCell onClick={() => handleSort("market_cap")}>
                  <b>Market Cap</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coins.map((coin) => (
                <TableRow
                  key={coin.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => router.push(`/coin/${coin.id}`)}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <img
                        src={coin.image}
                        alt={coin.name}
                        width={24}
                        height={24}
                      />
                      {coin.name} ({coin.symbol.toUpperCase()})
                    </Box>
                  </TableCell>
                  <TableCell>${coin.current_price}</TableCell>
                  <TableCell>${coin.total_volume}</TableCell>
                  <TableCell>${coin.market_cap}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Page Button */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
          variant="outlined"
          shape="rounded"
        />
      </Box>
    </Container>
  );
}
