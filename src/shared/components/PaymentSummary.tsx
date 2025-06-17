import React, { useState } from "react";
import Modal from "./Modal";
import "./PaymentSummary.css";

interface PaymentSummaryProps {
  reserva: any;
  fieldData?: any;
  slotLabel?: string;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  onCancelTemp?: () => void;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({ reserva, fieldData, slotLabel, onConfirm, confirmDisabled, onCancelTemp }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);

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
      <div className="payment-summary-row"><span>Estadio:</span> <b>{nombreEstadio}</b></div>
      <div className="payment-summary-row"><span>Localidad:</span> <b>{localidad}</b></div>
      <div className="payment-summary-row"><span>Dirección:</span> <b>{direccion}</b></div>
      <div className="payment-summary-row"><span>Fecha:</span> <b>{fecha}</b></div>
      <div className="payment-summary-row"><span>Hora:</span> <b>{hora}</b></div>
      <div className="payment-summary-row"><span>Nº de reservas:</span> <b>{numJugadores}</b></div>
      <hr className="payment-summary-divider" />
      <div className="payment-summary-row payment-summary-total">
        <span className="payment-summary-total-label">Total:</span> <b>{precio}</b>
      </div>
      {onConfirm && (
        <button className="payment-summary-confirm-btn" onClick={onConfirm} disabled={confirmDisabled}>
          Confirmar reserva
        </button>
      )}
      {onCancelTemp && (
        <>
          <button
            className="payment-summary-cancel-btn"
            type="button"
            onClick={() => setShowCancelModal(true)}
            style={{ marginTop: 12, width: '100%' }}
          >
            Cancelar reserva
          </button>
          <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)}>
            <div className="delete-modal-content-custom">
              <button className="delete-modal-close-custom" onClick={() => setShowCancelModal(false)} aria-label="Cerrar">&times;</button>
              <div className="delete-modal-header-custom">
                ¿Quieres cancelar el proceso?
              </div>
              <div className="delete-modal-body-custom">
                Tendrás que empezar de nuevo la reserva.
              </div>
              <div className="delete-modal-actions-custom">
                <button
                  className="delete-modal-confirm-custom"
                  onClick={() => { setShowCancelModal(false); onCancelTemp(); }}
                >
                  Confirmar
                </button>
                <button
                  className="delete-modal-cancel-custom"
                  onClick={() => setShowCancelModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </aside>
  );
};

export default PaymentSummary;
