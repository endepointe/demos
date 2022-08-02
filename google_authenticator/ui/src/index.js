import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {Auth0Provider} from "@auth0/auth0-react";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Auth0Provider
    domain="endeadmin.us.auth0.com"
    clientId="yGxYAIirZvHcqznpz9fIcEbOMklDARaV"
    redirectUri={window.location.origin}>
    <App />
  </Auth0Provider>
);