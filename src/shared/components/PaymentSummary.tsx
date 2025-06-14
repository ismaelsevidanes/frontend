import React from "react";
import "./PaymentSummary.css";

interface PaymentSummaryProps {
  reserva: any;
  fieldData?: any;
  slotLabel?: string;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({ reserva, fieldData, slotLabel, onConfirm, confirmDisabled }) => {
  // Preferir datos de fieldData si están disponibles
  const nombreEstadio = fieldData?.name || fieldData?.nombre || reserva?.field_name || reserva?.fieldName || "-";
  const localidad = fieldData?.location || fieldData?.localidad || fieldData?.city || reserva?.localidad || reserva?.city || "-";
  const direccion = fieldData?.address || fieldData?.calle || fieldData?.direccion || reserva?.calle || reserva?.address || reserva?.direccion || "-";
  const fecha = reserva?.date || reserva?.fecha || "-";
  const hora = slotLabel || reserva?.slotLabel || reserva?.slot || reserva?.hora || "-";
  const precio = reserva?.total_price ? reserva.total_price + "€" : "-";
  const numJugadores = reserva?.numUsers || reserva?.num_users || reserva?.jugadores || reserva?.players || "-";

  return (
    <aside className="payment-summary">
      <h3 className="payment-summary-title">Resumen</h3>
      <div className="payment-summary-row"><b>Estadio:</b> {nombreEstadio}</div>
      <div className="payment-summary-row"><b>Localidad:</b> {localidad}</div>
      <div className="payment-summary-row"><b>Dirección:</b> {direccion}</div>
      <div className="payment-summary-row"><b>Fecha:</b> {fecha}</div>
      <div className="payment-summary-row"><b>Hora:</b> {hora}</div>
      <div className="payment-summary-row"><b>Nº de reservas:</b> {numJugadores}</div>
      <hr className="payment-summary-divider" />
      <div className="payment-summary-row payment-summary-total">
        <span className="payment-summary-total-label">Total:</span> {precio}
      </div>
      {onConfirm && (
        <button className="payment-summary-confirm-btn" onClick={onConfirm} disabled={confirmDisabled}>
          Confirmar reserva
        </button>
      )}
    </aside>
  );
};

export default PaymentSummary;
