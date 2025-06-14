import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";
import Header from "../shared/components/Header";
import Footer from "../shared/components/Footer";
import Modal from "../shared/components/Modal";
import { authFetch } from "../shared/utils/authFetch";
import "../shared/components/Header.css";
import "../shared/components/Footer.css";
import "./PaymentMethod.css";

const paymentOptions = [
  { key: "card", label: "Tarjeta de crédito o débito", icon: ["/images/metodospago/visa.svg", "/images/metodospago/mastercard.svg"] },
  { key: "saved", label: "Tarjeta de crédito o débito guardada", icon: "/images/metodospago/visa.svg" },
  { key: "paypal", label: "PayPal", icon: "/images/metodospago/paypal.svg" },
  { key: "bizum", label: "Bizum", icon: "/images/metodospago/bizum.svg" },
];

const PaymentMethod: React.FC = () => {
  const navigate = useNavigate();
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
    save: false,
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [reservaTemp, setReservaTemp] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<string>(""); // Ninguno seleccionado por defecto
  const [savedCard, setSavedCard] = useState<{ last4: string } | null>(null);
  const [username, setUsername] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    // obtener usuario del token
    authFetch("/api/payments/method")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.last4) setSavedCard({ last4: data.last4 });
      });
    const reserva = sessionStorage.getItem("reservaTemp");
    if (!reserva) {
      navigate("/", { replace: true });
      return;
    }
    setReservaTemp(JSON.parse(reserva));
  }, [navigate]);

  useEffect(() => {
    // Si hay tarjeta guardada, seleccionarla por defecto
    if (savedCard) setSelectedOption("saved");
  }, [savedCard]);

  useEffect(() => {
    // Obtener el nombre del usuario del token o localStorage
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUsername(payload.name || payload.email || "Usuario");
      } catch {
        setUsername("Usuario");
      }
    } else {
      setUsername("Usuario");
    }
  }, []);

  const handleCardInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCardData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccess("");
    if (selectedOption === "card") {
      if (!cardData.number || !cardData.expiry || !cardData.cvc || !cardData.name) {
        setFormError("Rellena todos los campos de la tarjeta.");
        return;
      }
    }
    setLoading(true);
    try {
      if (selectedOption === "card") {
        // Guardar método de pago
        const res = await authFetch("/api/payments/method", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cardNumber: cardData.number,
            expiry: cardData.expiry,
            cvc: cardData.cvc,
            cardName: cardData.name,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          setFormError(data.message || "Error al guardar el método de pago");
          return;
        }
      }
      // Crear la reserva definitiva
      const reservaPayload = {
        field_id: reservaTemp.field_id,
        date: reservaTemp.date,
        slot: reservaTemp.slot,
        total_price: reservaTemp.total_price,
        user_ids: Array(reservaTemp.numUsers).fill(null),
      };
      const reservaRes = await authFetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservaPayload),
      });
      if (!reservaRes.ok) {
        const data = await reservaRes.json();
        setFormError(data.message || "Error al crear la reserva");
        return;
      }
      setSuccess("Reserva y método de pago guardados correctamente");
      sessionStorage.removeItem("reservaTemp");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setFormError("Error de red");
    } finally {
      setLoading(false);
    }
  };

  // Eliminar método de pago guardado
  const handleDeleteCard = async () => {
    setDeleteLoading(true);
    await authFetch("/api/payments/method", {
      method: "DELETE",
    });
    setDeleteLoading(false);
    setShowDeleteModal(false);
    setSavedCard(null);
    setSelectedOption("");
  };

  if (!reservaTemp) return null;

  return (
    <div className="dashboard-layout">
      <Header username={username} onUserMenu={() => {}} menuOpen={false} handleLogout={() => {}} />
      <main className="dashboard-main payment-main-center">
        <form className="payment-method-form" onSubmit={handleSubmit} aria-label="Formulario de método de pago">
          <h2 className="payment-title">Método de pago</h2>
          <div className="payment-options">
            {paymentOptions.map(opt => (
              <div key={opt.key} className="payment-option-wrapper">
                <label
                  className={`payment-option${selectedOption === opt.key ? " selected" : ""}`}
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedOption(opt.key);
                  }}
                  aria-checked={selectedOption === opt.key}
                  role="radio"
                >
                  <span className="payment-option-label">
                    <input
                      type="radio"
                      name="paymentOption"
                      value={opt.key}
                      checked={selectedOption === opt.key}
                      onChange={() => setSelectedOption(opt.key)}
                      tabIndex={-1}
                    />
                    {opt.label}
                    {opt.key === "saved" && savedCard && (
                      <span className="payment-saved-last4">
                        Tarjeta terminada en ... {savedCard.last4}
                      </span>
                    )}
                  </span>
                  <span className="payment-option-icon payment-option-icon-right">
                    {/* Icono Papelera */}
                    {opt.key === "saved" && savedCard && (
                      <button
                        type="button"
                        className="delete-saved-card-btn"
                        title="Eliminar tarjeta guardada"
                        onClick={e => {e.stopPropagation(); setShowDeleteModal(true);}}
                        tabIndex={0}
                      >
                        <FaTrashAlt size={28} color="#003366" />
                      </button>
                    )}
                    {Array.isArray(opt.icon)
                      ? opt.icon.map((img, i) => (
                          <img key={i} src={img} alt={opt.label} />
                        ))
                      : opt.icon && <img src={opt.icon} alt={opt.label} />}
                  </span>
                </label>
                {/* Desplegable justo debajo de la opción seleccionada */}
                {selectedOption === opt.key && opt.key === "card" && (
                  <div className="payment-card-fields payment-card-fields-dropdown">
                    <div className="payment-fields-info">
                      Todos los campos son obligatorios.
                    </div>
                    <label>
                      Número de tarjeta
                      <input
                        type="text"
                        name="number"
                        value={cardData.number}
                        onChange={handleCardInput}
                        maxLength={19}
                        autoComplete="cc-number"
                        inputMode="numeric"
                        pattern="[0-9 ]*"
                        required
                        placeholder="1234 5678 9012 3456"
                      />
                      <div className="payment-fields-icons">
                        <img src="/images/metodospago/visa.svg" alt="Visa" />
                        <img src="/images/metodospago/mastercard.svg" alt="Mastercard" />
                      </div>
                    </label>
                    <div className="payment-fields-row">
                      <label className="payment-expiry-label">
                        Fecha de expiración
                        <input
                          type="text"
                          name="expiry"
                          value={cardData.expiry}
                          onChange={handleCardInput}
                          maxLength={5}
                          placeholder="MM/AA"
                          autoComplete="cc-exp"
                          required
                        />
                        <span className="payment-fields-info"><b>Usa el formato mes/año. Por ejemplo: 08/25</b></span>
                      </label>
                      <label className="payment-cvc-label">
                        Código de seguridad
                        <input
                          type="text"
                          name="cvc"
                          value={cardData.cvc}
                          onChange={handleCardInput}
                          maxLength={4}
                          autoComplete="cc-csc"
                          required
                          placeholder="CVC"
                        />
                        <span className="payment-fields-info"><b>Código de 3 cifras en el reverso de tu tarjeta</b></span>
                      </label>
                    </div>
                    <label>
                      Titular de la tarjeta
                      <input
                        type="text"
                        name="name"
                        value={cardData.name}
                        onChange={handleCardInput}
                        autoComplete="cc-name"
                        required
                        placeholder="Nombre y apellidos"
                      />
                    </label>
                    <label className="payment-save-card">
                      <input
                        type="checkbox"
                        name="save"
                        checked={cardData.save}
                        onChange={handleCardInput}
                      />
                      Guardar para futuras compras. Activando esta casilla completarás futuras reservas de forma más rápida y cómoda. Podrás eliminar tu tarjeta cuando quieras.
                    </label>
                    <button type="submit" className="payment-confirm-btn payment-confirm-btn" disabled={loading}>
                      {loading ? "Procesando..." : "Confirmar"}
                    </button>
                  </div>
                )}
                {selectedOption === opt.key && opt.key === "bizum" && (
                  <div className="payment-bizum-info payment-card-fields-dropdown">Introduce tu número de teléfono asociado a Bizum en el siguiente paso.</div>
                )}
                {selectedOption === opt.key && opt.key === "paypal" && (
                  <div className="payment-paypal-info payment-card-fields-dropdown">Serás redirigido a PayPal para completar el pago.</div>
                )}
              </div>
            ))}
          </div>
          {formError && <div className="payment-error">{formError}</div>}
          {success && <div className="payment-success">{success}</div>}
        </form>
      </main>
      <Footer />
      {/* Modal de confirmación de borrado */}
      {showDeleteModal && (
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <div className="delete-modal-content-custom">
            <button className="delete-modal-close-custom" onClick={() => setShowDeleteModal(false)} aria-label="Cerrar">&times;</button>
            <div className="delete-modal-header-custom">
              <span>Eliminar tarjeta</span>
            </div>
            <div className="delete-modal-body-custom">
              ¿Seguro que deseas eliminar esta tarjeta?
            </div>
            <div className="delete-modal-actions-custom">
              <button
                className="delete-modal-confirm-custom"
                onClick={handleDeleteCard}
                disabled={deleteLoading}
              >Eliminar</button>
              <button className="delete-modal-cancel-custom" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>Cancelar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PaymentMethod;
