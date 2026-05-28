import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@nsw_webcams_favourites';

const FavouritesContext = createContext({ favourites: new Set(), toggleFavourite: () => {} });

export function FavouritesProvider({ children }) {
  const [favourites, setFavourites] = useState(new Set());

  // Load from storage on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) setFavourites(new Set(JSON.parse(raw)));
    }).catch(() => {});
  }, []);

  const toggleFavourite = (id) => {
    setFavourites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...next])).catch(() => {});
      return next;
    });
  };

  return (
    <FavouritesContext.Provider value={{ favourites, toggleFavourite }}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  return useContext(FavouritesContext);
}
