import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Pago from './pages/Pago'
import Resultado from './pages/Resultado'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pago" element={<Pago />} />
        <Route path="/pago/resultado" element={<Resultado />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
