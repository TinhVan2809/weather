import Home from "./pages/Home"
import ErrorBoundary from "./components/ErrorBoundary"

import HandleTheme from "./components/Theme"

import './css/home.css'
import './css/index.css'
import './css/forecast.css'
import './css/theme.css'

import { Routes, Route } from "react-router-dom"

function App() {
 

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
