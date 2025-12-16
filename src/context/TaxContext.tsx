import React, { createContext, useContext, useEffect, useState } from 'react';

interface TaxContextType {
  isVatEnabled: boolean;
  setIsVatEnabled: (enabled: boolean) => void;
  vatPercentage: number;
  setVatPercentage: (rate: number) => void;
  calculateTax: (subtotal: number) => number;
  calculateTotal: (subtotal: number) => number;
}

const TaxContext = createContext<TaxContextType | undefined>(undefined);

export const TaxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVatEnabled, setIsVatEnabledState] = useState<boolean>(() => {
    const stored = localStorage.getItem('isVatEnabled');
    return stored ? JSON.parse(stored) : true;
  });

  const [vatPercentage, setVatPercentageState] = useState<number>(() => {
    const stored = localStorage.getItem('vatPercentage');
    return stored ? parseFloat(stored) : 15; // Saudi VAT default 15%
  });

  useEffect(() => {
    localStorage.setItem('isVatEnabled', JSON.stringify(isVatEnabled));
  }, [isVatEnabled]);

  useEffect(() => {
    localStorage.setItem('vatPercentage', vatPercentage.toString());
  }, [vatPercentage]);

  const setIsVatEnabled = (enabled: boolean) => {
    setIsVatEnabledState(enabled);
  };

  const setVatPercentage = (rate: number) => {
    setVatPercentageState(rate);
  };

  const calculateTax = (subtotal: number): number => {
    if (!isVatEnabled) return 0;
    return subtotal * (vatPercentage / 100);
  };

  const calculateTotal = (subtotal: number): number => {
    return subtotal + calculateTax(subtotal);
  };

  return (
    <TaxContext.Provider value={{ 
      isVatEnabled, 
      setIsVatEnabled, 
      vatPercentage, 
      setVatPercentage,
      calculateTax,
      calculateTotal
    }}>
      {children}
    </TaxContext.Provider>
  );
};

export const useTax = () => {
  const context = useContext(TaxContext);
  if (!context) throw new Error('useTax must be used within TaxProvider');
  return context;
};
