import React, { createContext, useContext, useState } from 'react';

const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const [compareItems, setCompareItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleCompare = (product) => {
    setCompareItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        if (prev.length >= 4) {
          alert('You can compare a maximum of 4 products at a time.');
          return prev;
        }
        return [...prev, product];
      }
    });
  };

  const removeFromCompare = (productId) => {
    setCompareItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  const isInCompare = (productId) => {
    return compareItems.some((item) => item.id === productId);
  };

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        toggleCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        isModalOpen,
        setIsModalOpen,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
