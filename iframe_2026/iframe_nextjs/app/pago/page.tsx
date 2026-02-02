import Link from "next/link";
import { FastPayForm } from "@/components/FastPayForm";

/**
 * Página de pago con iframe FastPay (solo tarjeta).
 * Usa la clave de pruebas sipay-test-team y un importe de ejemplo (10,00 €).
 */
export default function PagoPage() {
  return (
    <div className="container">
      <div className="card" style={{ textAlign: "center" }}>
        <h1>Pago con tarjeta</h1>
        <p className="subtitle" style={{ textAlign: "center" }}>
          Introduce los datos de tu tarjeta en el formulario seguro. Los datos
          no pasan por nuestro servidor (PCI DSS).
        </p>
        <div style={{ textAlign: "left" }}>
        <FastPayForm
          dataKey="sipay-test-team"
          amount="1000"
          currency="EUR"
          lang="es"
          paymentButton="Pagar"
          cardholderName={false}
          useCallback={true}
        />
        </div>
        <p style={{ marginTop: "1.5rem" }}>
          <Link href="/" className="back-link">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}
