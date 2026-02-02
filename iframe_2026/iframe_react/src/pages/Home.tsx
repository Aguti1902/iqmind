import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="container">
      <div className="card">
        <h1>Ejemplo Sipay - Pago con tarjeta</h1>
        <p className="subtitle">
          Integración básica del iframe FastPay en React. El comercio captura
          la tarjeta de forma segura (PCI DSS) y obtiene un request_id para
          finalizar el cobro vía API.
        </p>
        <p>
          <Link to="/pago" className="link">
            Ir a la página de pago →
          </Link>
        </p>
      </div>
    </div>
  )
}
