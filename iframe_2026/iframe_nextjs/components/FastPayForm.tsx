"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * El script de FastPay enlaza el botón al cargar (p. ej. en DOMContentLoaded).
 * En Next.js el script se carga después del montaje y el botón no se enlaza.
 * Solución: embeber la página HTML estática donde el script sí corre en el orden correcto.
 */
const FASTPAY_PAGE = "/fastpay-standalone.html";

export type FastPayCallbackData = {
  type: string;
  code: string;
  detail: string;
  description: string;
  request_id: string;
  uuid: string;
  payload?: {
    consent?: boolean;
    cardholder_name?: string | null;
    expiration?: string;
    pan?: string;
  };
};

type FastPayFormProps = {
  dataKey: string;
  amount: string;
  currency?: string;
  lang?: string;
  paymentButton?: string;
  cardholderName?: boolean;
  useCallback?: boolean;
  redirectUrl?: string;
};

export function FastPayForm({
  dataKey,
  amount,
  currency = "EUR",
  paymentButton = "Pagar",
}: FastPayFormProps) {
  const router = useRouter();
  const [callbackData, setCallbackData] = useState<{
    request: Record<string, unknown>;
    response: FastPayCallbackData | null;
  } | null>(null);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "sipay_fastpay_done" && event.data?.request_id) {
        setCallbackData({
          request: {
            dataKey,
            amount: `${Number(amount) / 100} €`,
            amountCents: amount,
            currency,
            paymentButton,
          },
          response: event.data.payload ?? {
            type: "success",
            code: "0",
            request_id: event.data.request_id,
            detail: "",
            description: "",
            uuid: "",
          },
        });
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [router, dataKey, amount, currency, paymentButton]);

  return (
    <div className="card" style={{ marginTop: "1rem" }}>
      <p className="subtitle" style={{ marginBottom: "1rem", textAlign: "center" }}>
        Importe: <strong>{(Number(amount) / 100).toFixed(2)} €</strong>.
        Completa el pago en el formulario seguro.
      </p>
      <div
        style={{
          marginBottom: "1rem",
          padding: "0.75rem 1rem",
          background: "#e8f4fd",
          borderRadius: "6px",
          border: "1px solid #b8daff",
          fontSize: "0.875rem",
          color: "#004085",
        }}
      >
        <strong>Tarjeta de ejemplo (sandbox):</strong>
        <ul style={{ margin: "0.25rem 0 0 1.25rem", padding: 0 }}>
          <li>Número: <code>4242 4242 4242 4242</code></li>
          <li>Caducidad: <code>12/30</code></li>
          <li>CVV: <code>123</code></li>
        </ul>
      </div>
      <div
        style={{
          width: "500px",
          maxWidth: "100%",
          height: "700px",
          margin: "0 auto",
          overflow: "auto",
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <iframe
          src={FASTPAY_PAGE}
          title="Formulario de pago Sipay"
          style={{
            display: "block",
            width: "430px",
            height: "700px",
            border: "none",
          }}
        />
      </div>

      {callbackData && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="callback-modal-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            background: "rgba(0, 0, 0, 0.5)",
          }}
          onClick={(e) => e.target === e.currentTarget && setCallbackData(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "8px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
              maxWidth: "520px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              padding: "1.5rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="callback-modal-title" style={{ margin: "0 0 1rem", fontSize: "1.1rem" }}>
              Petición y respuesta del callback
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.95rem", color: "#495057" }}>
                  Petición (contexto enviado al iframe)
                </h3>
                <pre
                  style={{
                    margin: 0,
                    padding: "0.75rem",
                    background: "#f8f9fa",
                    borderRadius: "6px",
                    border: "1px solid #e9ecef",
                    fontSize: "0.8rem",
                    overflow: "auto",
                    maxHeight: "160px",
                  }}
                >
                  {JSON.stringify(callbackData.request, null, 2)}
                </pre>
              </div>
              <div>
                <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.95rem", color: "#495057" }}>
                  Respuesta del callback (Sipay)
                </h3>
                <pre
                  style={{
                    margin: 0,
                    padding: "0.75rem",
                    background: "#f8f9fa",
                    borderRadius: "6px",
                    border: "1px solid #e9ecef",
                    fontSize: "0.8rem",
                    overflow: "auto",
                    maxHeight: "220px",
                  }}
                >
                  {JSON.stringify(callbackData.response, null, 2)}
                </pre>
              </div>
            </div>
            <p style={{ marginTop: "1rem", marginBottom: "1rem" }}>
              <a
                href={`/pago/resultado?request_id=${encodeURIComponent(callbackData.response?.request_id ?? "")}`}
                className="link"
              >
                Ir a página de resultado →
              </a>
            </p>
            <button
              type="button"
              onClick={() => setCallbackData(null)}
              style={{
                display: "block",
                width: "100%",
                padding: "0.6rem 1rem",
                fontSize: "1rem",
                fontWeight: 500,
                color: "#fff",
                background: "#0d6efd",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
