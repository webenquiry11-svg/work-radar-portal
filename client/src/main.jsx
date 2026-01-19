// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { store } from './app/store';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import CurrentUserProvider from './app/CurrentUserProvider.jsx';

// Use '/workradar' as basename in production, or if the URL path starts with it. Otherwise default to '/' for local development.
const basename = import.meta.env.PROD || window.location.pathname.startsWith('/workradar') ? '/workradar' : '/';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <Provider store={store}>
        <CurrentUserProvider>
          <App />
        </CurrentUserProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>,
);