import React, { useEffect, useLayoutEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { App as KonstaApp } from 'konsta/react';
import MainPage from './pages/MainPage'
import NotFoundPage from './pages/NotFoundPage'
import { ROUTES } from './resources/routes-constants'
import './index.css'

function App() {
    const [theme, setTheme] = useState('ios');
    const [currentColorTheme, setCurrentColorTheme] = useState('');
  
    const setColorTheme = (color) => {
      const htmlEl = document.documentElement;
      htmlEl.classList.forEach((c) => {
        if (c.includes('k-color')) htmlEl.classList.remove(c);
      });
      if (color) htmlEl.classList.add(color);
      setCurrentColorTheme(color);
    };
  
    useEffect(() => {
      window.setTheme = (t) => setTheme(t);
      window.setMode = (mode) => {
        if (mode === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      };
    }, []);
  
    const inIFrame = window.parent !== window;
    useLayoutEffect(() => {
      if (window.location.href.includes('safe-areas')) {
        const html = document.documentElement;
        if (html) {
          html.style.setProperty(
            '--k-safe-area-top',
            theme === 'ios' ? '44px' : '24px'
          );
          html.style.setProperty('--k-safe-area-bottom', '34px');
        }
      }
    }, [theme]);

    return (
        <KonstaApp theme={theme} safeAreas={!inIFrame}>
            <Router>
                <Routes>
                    <Route path="*" element={<NotFoundPage />} />
                    <Route path={ROUTES.HOMEPAGE_ROUTE} element={<MainPage
                        theme={theme}
                        setTheme={setTheme}
                        colorTheme={currentColorTheme}
                        setColorTheme={setColorTheme}
                    />} />
                </Routes>
            </Router>
        </KonstaApp>
    )
}

export default App
