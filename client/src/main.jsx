// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { store } from './app/store';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import CurrentUserProvider from './app/CurrentUserProvider.jsx'; // 1. IMPORT THE PROVIDER

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <CurrentUserProvider>
        <App />
      </CurrentUserProvider>
    </Provider>
  </React.StrictMode>,
);
