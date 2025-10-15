// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { store } from './app/store';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import CurrentUserProvider from './app/CurrentUserProvider.jsx'; // Make sure this path is correct

const basename = import.meta.env.MODE === 'production' ? '/workradar' : '/';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* All providers live here, and only here. */}
    <BrowserRouter basename={basename}>
      <Provider store={store}>
        <CurrentUserProvider>
          <App />
        </CurrentUserProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>,
);

