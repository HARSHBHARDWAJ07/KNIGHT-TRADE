import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import './index.css';
import store from './redux/store';
import App from './App';

// Add persistence logic
const initializeApp = async () => {
  const token = localStorage.getItem('token');
  if (token) {
    store.dispatch({ type: 'REHYDRATE_AUTH' });
  }
};

const container = document.getElementById('root');
const root = createRoot(container);

initializeApp().then(() => {
  root.render(
    <Provider store={store}>
      <App />
    </Provider>
  );
});