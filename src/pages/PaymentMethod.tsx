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
  { key: "card", label: "Tarjeta de crédito o débito", icon: "/visa-mc.png" },
  { key: "saved", label: "Tarjeta de crédito o débito guardada", icon: "/visa-mc.png" },
  { key: "bizum", label: "Bizum", icon: "/bizum.png" },
  { key: "paypal", label: "PayPal", icon: "/paypal.png" },
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
              <div key={opt.key} style={{position:'relative', width:'100%'}}>
                <label
                  className={`payment-option${selectedOption === opt.key ? " selected" : ""}`}
                  style={{justifyContent:'space-between'}}
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedOption(opt.key);
                  }}
                  aria-checked={selectedOption === opt.key}
                  role="radio"
                >
                  <span style={{display:'flex',alignItems:'center',gap:8}}>
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
                      <span style={{display:'flex',alignItems:'center',gap:8}}>
                        <span style={{marginLeft:8, color:'#888'}}>Tarjeta terminada en ... {savedCard.last4}</span>
                      </span>
                    )}
                  </span>
                  <span style={{display:'flex',alignItems:'center',gap:8}}>
                    {opt.icon && <img src={opt.icon} alt={opt.label} style={{height:32, marginLeft:8}} />}
                  </span>
                </label>
                {/* Botón de eliminar fuera del label para la opción guardada */}
                {opt.key === "saved" && savedCard && (
                  <button
                    type="button"
                    className="delete-saved-card-btn"
                    title="Eliminar tarjeta guardada"
                    style={{position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', alignItems:'center', zIndex:2}}
                    onClick={e => {e.stopPropagation(); setShowDeleteModal(true);}}
                    tabIndex={0}
                  >
                    <FaTrashAlt size={28} color="#e65c00" />
                  </button>
                )}
                {/* Desplegable justo debajo de la opción seleccionada */}
                {selectedOption === opt.key && opt.key === "card" && (
                  <div className="payment-card-fields payment-card-fields-dropdown">
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
                      />
                    </label>
                    <div className="payment-card-row">
                      <label>
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
                      </label>
                      <label>
                        CVC
                        <input
                          type="text"
                          name="cvc"
                          value={cardData.cvc}
                          onChange={handleCardInput}
                          maxLength={4}
                          autoComplete="cc-csc"
                          required
                        />
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
                      />
                    </label>
                    <label className="payment-save-card">
                      <input
                        type="checkbox"
                        name="save"
                        checked={cardData.save}
                        onChange={handleCardInput}
                      />
                      Guardar para futuras compras
                    </label>
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
          <button type="submit" className="payment-confirm-btn" disabled={loading}>{loading ? "Procesando..." : "Confirmar y continuar"}</button>
        </form>
      </main>
      <Footer />
      {/* Modal de confirmación de borrado */}
      {showDeleteModal && (
        <Modal onClose={() => setShowDeleteModal(false)}>
          <div className="delete-modal-content">
            <div className="delete-modal-header">
              <span>Eliminar tarjeta</span>
              <button className="delete-modal-close" onClick={() => setShowDeleteModal(false)} aria-label="Cerrar">&times;</button>
            </div>
            <div className="delete-modal-body">
              ¿Seguro que deseas eliminar esta tarjeta?
            </div>
            <div className="delete-modal-actions">
              <button
                className="delete-modal-confirm"
                onClick={handleDeleteCard}
                disabled={deleteLoading}
              >Eliminar</button>
              <button className="delete-modal-cancel" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>Cancelar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PaymentMethod;
