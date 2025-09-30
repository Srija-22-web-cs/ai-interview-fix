import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

import candidatesReducer from './candidatesSlice';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  // Only persist the candidates data
  whitelist: ['candidates'], 
};

const persistedReducer = persistReducer(persistConfig, candidatesReducer);

export const store = configureStore({
  reducer: {
    // The store holds the persisted 'candidates' state
    candidates: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Ignore these redux-persist action types to prevent serialization warnings
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
