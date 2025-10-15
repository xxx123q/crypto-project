"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Box,
  Divider,
} from "@mui/material";

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

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 10 }}>
        <CircularProgress />
        <Typography variant="h6" mt={2}>
          Loading...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ textAlign: "center", mt: 10 }}>
        <Typography variant="h6" color="error">
          Error: {error}
        </Typography>
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
            sx={{ mr: 2 }}
          >
            Try Again
          </Button>
          <Link href="/" passHref>
            <Button variant="outlined" color="secondary">
              Go Back to List
            </Button>
          </Link>
        </Box>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 6, maxWidth: "md" }}>
      <Button
        component={Link}
        href="/"
        variant="text"
        color="primary"
        sx={{ mb: 2 }}
      >
        ← Back to List
      </Button>

      <Card
        sx={{
          boxShadow: 3,
          borderRadius: 3,
          p: 3,
          textAlign: "center",
        }}
      >
        {coin.image?.large && (
          <Box display="flex" justifyContent="center" mb={2}>
            <img
              src={coin.image.large}
              alt={`${coin.name} logo`}
              width={80}
              height={80}
              style={{ borderRadius: "50%" }}
            />
          </Box>
        )}

        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {coin.name} ({coin.symbol.toUpperCase()})
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Price Info
        </Typography>
        <CardContent>
          <Typography variant="h6">
            <strong>Current Price:</strong>{" "}
            {coin.market_data?.current_price?.aud
              ? `$${coin.market_data.current_price.aud} AUD`
              : "N/A"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>24h High:</strong>{" "}
            {coin.market_data?.high_24h?.aud
              ? `$${coin.market_data.high_24h.aud} AUD`
              : "N/A"}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            <strong>24h Low:</strong>{" "}
            {coin.market_data?.low_24h?.aud
              ? `$${coin.market_data.low_24h.aud} AUD`
              : "N/A"}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="justify"
          >
            {coin.description?.en
              ? coin.description.en
              : "Description not available."}
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
