// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { store } from './app/store';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom'; // 1. IMPORT BROWSERROUTER

// 2. DEFINE THE BASENAME BASED ON THE ENVIRONMENT
// When you run "npm run dev", import.meta.env.MODE is 'development'
// When you run "npm run build", import.meta.env.MODE is 'production'
const basename = import.meta.env.MODE === 'production' ? '/workradar' : '/';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 3. USE THE DYNAMIC BASENAME VARIABLE */}
    <BrowserRouter basename={basename}>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </React.StrictMode>,
);

