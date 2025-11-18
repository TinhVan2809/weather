import Home from "./pages/Home"
import ErrorBoundary from "./components/ErrorBoundary"
import './css/home.css'
import './css/index.css'

function App() {
 

  return (
    <>
        <div className="container">
          <ErrorBoundary>
            <Home />
          </ErrorBoundary>
        </div>
    </>
  )
}

export default App
