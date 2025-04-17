import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import ProfileScreen from './components/ProfileScreen';
import { AppProvider } from './context/AppContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/profile" element={<ProfileScreen />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  </StrictMode>
);
