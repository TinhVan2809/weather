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
