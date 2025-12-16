import React, { createContext, useContext, useEffect, useState } from 'react';

type Currency = 'SAR' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  formatPrice: (baseSarPrice: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const stored = localStorage.getItem('currency');
    return (stored as Currency) || 'SAR';
  });

  const [exchangeRate, setExchangeRateState] = useState<number>(() => {
    const stored = localStorage.getItem('exchangeRate');
    return stored ? parseFloat(stored) : 3.75;
  });

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('exchangeRate', exchangeRate.toString());
  }, [exchangeRate]);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  };

  const setExchangeRate = (rate: number) => {
    setExchangeRateState(rate);
  };

  const formatPrice = (baseSarPrice: number): string => {
    if (currency === 'SAR') {
      return `${baseSarPrice.toFixed(2)} ${currency}`;
    } else {
      const usdPrice = baseSarPrice / exchangeRate;
      return `$${usdPrice.toFixed(2)}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRate, setExchangeRate, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
};
