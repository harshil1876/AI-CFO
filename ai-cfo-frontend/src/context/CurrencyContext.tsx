"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type CurrencyType = "USD" | "INR" | "EUR" | "GBP";

interface CurrencyContextType {
  currency: CurrencyType;
  setCurrency: (c: CurrencyType) => void;
  formatAmount: (value: number, options?: Intl.NumberFormatOptions) => string;
  symbol: string;
}

const CURRENCY_CONFIG: Record<CurrencyType, { locale: string; symbol: string }> = {
  USD: { locale: "en-US", symbol: "$" },
  INR: { locale: "en-IN", symbol: "₹" },
  EUR: { locale: "de-DE", symbol: "€" },
  GBP: { locale: "en-GB", symbol: "£" },
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyType>("USD");

  // Load from localStorage if present
  useEffect(() => {
    const saved = localStorage.getItem("cfol_currency") as CurrencyType;
    if (saved && CURRENCY_CONFIG[saved]) {
      setCurrency(saved);
    }
  }, []);

  const handleSetCurrency = (c: CurrencyType) => {
    setCurrency(c);
    localStorage.setItem("cfol_currency", c);
  };

  const formatAmount = (value: number, options: Intl.NumberFormatOptions = {}) => {
    const config = CURRENCY_CONFIG[currency];
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
      ...options,
    }).format(value);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency: handleSetCurrency,
        formatAmount,
        symbol: CURRENCY_CONFIG[currency].symbol,
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
