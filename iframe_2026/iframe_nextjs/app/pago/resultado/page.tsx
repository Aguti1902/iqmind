import Link from "next/link";

type SearchParams = { request_id?: string };

/**
 * Página de resultado tras la captura de tarjeta.
 * Recibe request_id por callback (redirect interno) o por redirect (query string).
 * El comercio debe usar este request_id con el API server-to-server para ejecutar
 * la transacción (venta, tokenización, etc.).
 */
export default function ResultadoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const requestId = searchParams.request_id;

  return (
    <div className="container">
      <div className="card">
        <h1>Tarjeta capturada correctamente</h1>
        <p className="subtitle">
          Este es un ejemplo. En tu integración real, tu backend debe usar el{" "}
          <code>request_id</code> con el API de Sipay (modo server-to-server,
          parámetro fastpay) para ejecutar la venta o la operación que necesites.
        </p>
        {requestId ? (
          <div className="success-box">
            <strong>request_id recibido:</strong>
            <br />
            <code>{requestId}</code>
            <p style={{ marginTop: "0.75rem", marginBottom: 0 }}>
              Válido durante 5 minutos. No lo expongas en producción en la
              página; úsalo solo en el servidor.
            </p>
          </div>
        ) : (
          <div className="error-box">
            No se ha recibido <code>request_id</code>. Vuelve a la página de
            pago e intenta de nuevo.
          </div>
        )}
        <Link href="/" className="back-link">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
