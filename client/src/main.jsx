// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { store } from './app/store';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import CurrentUserProvider from './app/CurrentUserProvider.jsx'; // 1. IMPORT THE PROVIDER

const basename = import.meta.env.MODE === 'production' ? '/workradar' : '/';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <Provider store={store}>
        {/* 2. WRAP YOUR APP WITH THE PROVIDER HERE */}
        <CurrentUserProvider>
          <App />
        </CurrentUserProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>,
);
