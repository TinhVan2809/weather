import Home from "./pages/Home"
import ErrorBoundary from "./components/ErrorBoundary"
import HandleTheme from "./components/Theme"

import './css/home.css'
import './css/index.css'
import './css/forecast.css'


import React, { useEffect } from 'react';

import { Routes, Route } from "react-router-dom"

function App() {

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.className = savedTheme;
        }
    }, []); // [] đảm bảo hook chỉ chạy một lần khi component mount

    useEffect(() => {
        // Khi component được tải, kiểm tra xem có hình nền tùy chỉnh trong localStorage không
        const customBg = localStorage.getItem('customBackgroundImage');
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme === 'custom-bg' && customBg) {
            document.body.style.backgroundImage = `url(${customBg})`;
            document.body.className = 'custom-bg';
        }
    }, []);
 

  return (
    <>
      <div className="container">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/theme" element={<HandleTheme />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </>
  )
}

export default App
