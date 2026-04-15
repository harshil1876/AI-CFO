"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type CurrencyType = "USD" | "INR" | "EUR" | "GBP";

interface CurrencyContextType {
  currency: CurrencyType;
  setCurrency: (c: CurrencyType) => void;
  formatAmount: (value: number, options?: Intl.NumberFormatOptions) => string;
  symbol: string;
  rate: number;         // Live exchange rate FROM USD to selected currency
  rateLabel: string;    // e.g. "1 USD = ₹84.32 (Live)"
}

const CURRENCY_CONFIG: Record<CurrencyType, { locale: string; symbol: string }> = {
  USD: { locale: "en-US", symbol: "$" },
  INR: { locale: "en-IN", symbol: "₹" },
  EUR: { locale: "de-DE", symbol: "€" },
  GBP: { locale: "en-GB", symbol: "£" },
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyType>("USD");
  // rates: USD is base (1.0), others are live fetched
  const [rates, setRates] = useState<Record<CurrencyType, number>>({
    USD: 1,
    INR: 84.5,   // fallback
    EUR: 0.92,   // fallback
    GBP: 0.79,   // fallback
  });
  const [isFetching, setIsFetching] = useState(false);

  // Load saved currency preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cfol_currency") as CurrencyType;
    if (saved && CURRENCY_CONFIG[saved]) {
      setCurrencyState(saved);
    }
  }, []);

  // Fetch live exchange rates once on mount (free API, no key needed)
  useEffect(() => {
    const fetchRates = async () => {
      setIsFetching(true);
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        if (res.ok) {
          const data = await res.json();
          if (data?.rates) {
            setRates({
              USD: 1,
              INR: data.rates.INR ?? 84.5,
              EUR: data.rates.EUR ?? 0.92,
              GBP: data.rates.GBP ?? 0.79,
            });
          }
        }
      } catch {
        // Silently fall back to default rates
      } finally {
        setIsFetching(false);
      }
    };
    fetchRates();
  }, []);

  const handleSetCurrency = (c: CurrencyType) => {
    setCurrencyState(c);
    localStorage.setItem("cfol_currency", c);
  };

  const currentRate = rates[currency];

  const formatAmount = (value: number, options: Intl.NumberFormatOptions = {}) => {
    const config = CURRENCY_CONFIG[currency];
    const converted = value * currentRate;
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
      ...options,
    }).format(converted);
  };

  const rateLabel =
    currency === "USD"
      ? "Base currency"
      : `1 USD = ${CURRENCY_CONFIG[currency].symbol}${currentRate.toFixed(2)} (Live)`;

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency: handleSetCurrency,
        formatAmount,
        symbol: CURRENCY_CONFIG[currency].symbol,
        rate: currentRate,
        rateLabel,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
