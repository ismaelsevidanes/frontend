import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";
import Header from "../shared/components/Header";
import Footer from "../shared/components/Footer";
import Modal from "../shared/components/Modal";
import { authFetch } from "../shared/utils/authFetch";
import PaymentSummary from "../shared/components/PaymentSummary";
import "../shared/components/Header.css";
import "../shared/components/Footer.css";
import "./PaymentMethod.css";

const paymentOptions = [
  { key: "card", label: "Tarjeta de crédito o débito", icon: ["/images/metodospago/visa.svg", "/images/metodospago/mastercard.svg"] },
  { key: "saved", label: "Tarjeta de crédito o débito guardada", icon: "/images/metodospago/visa.svg" },
  { key: "paypal", label: "PayPal", icon: "/images/metodospago/paypal.svg" },
  { key: "bizum", label: "Bizum", icon: "/images/metodospago/bizum.svg" },
];

// SLOTS para mapear el número a la franja horaria
const SLOTS = [
  { id: 1, label: "09:00 - 10:30" },
  { id: 2, label: "10:30 - 12:00" },
  { id: 3, label: "12:00 - 13:30" },
  { id: 4, label: "13:30 - 15:00" },
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
  const [fieldData, setFieldData] = useState<any>(null);

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

  useEffect(() => {
    if (reservaTemp?.field_id) {
      fetch(`/api/fields/${reservaTemp.field_id}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => setFieldData(data));
    }
  }, [reservaTemp]);

  useEffect(() => {
    // Si la reserva temporal tiene más de un usuario, recalcula el precio total
    if (reservaTemp && reservaTemp.numUsers && reservaTemp.total_price) {
      // Si el precio es string, conviértelo a número
      const precioBase = typeof reservaTemp.total_price === "string" ? parseFloat(reservaTemp.total_price) : reservaTemp.total_price;
      const nuevoPrecio = precioBase * reservaTemp.numUsers;
      if (reservaTemp.total_price != nuevoPrecio) {
        setReservaTemp((prev: any) => ({ ...prev, total_price: nuevoPrecio }));
      }
    }
  }, [reservaTemp?.numUsers]);

  // Formateo automático para número de tarjeta y fecha
  const handleCardInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (name === "number") {
      // Elimina todo lo que no sea dígito y añade espacio cada 4
      let clean = value.replace(/\D/g, "").slice(0, 16);
      let formatted = clean.replace(/(.{4})/g, "$1 ").trim();
      setCardData((prev) => ({ ...prev, number: formatted }));
      return;
    }
    if (name === "expiry") {
      // Elimina todo lo que no sea dígito y añade barra tras 2 dígitos
      let clean = value.replace(/\D/g, "").slice(0, 4);
      let formatted = clean.length > 2 ? clean.slice(0, 2) + "/" + clean.slice(2) : clean;
      setCardData((prev) => ({ ...prev, expiry: formatted }));
      return;
    }
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
      // 1. Si ya tiene método de pago y quiere guardar uno nuevo (checkbox activado)
      if (selectedOption === "card" && savedCard && cardData.save) {
        // Elimina el método de pago guardado en la BD
        await authFetch("/api/payments/method", { method: "DELETE" });
        // Guarda el nuevo método de pago en la BD
        const res = await authFetch("/api/payments/method", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
          setLoading(false);
          return;
        }
      }
      // 2. Si ya tiene método de pago y NO quiere guardar el nuevo (checkbox desmarcado)
      else if (selectedOption === "card" && savedCard && !cardData.save) {
        // Solo guarda el nuevo método en sessionStorage, NO elimina ni modifica el de la BD
        const encrypted = btoa(JSON.stringify({
          number: cardData.number,
          expiry: cardData.expiry,
          cvc: cardData.cvc,
          name: cardData.name,
        }));
        sessionStorage.setItem("tempCardData", encrypted);
        // El método de pago en la BD sigue siendo el antiguo
      }
      // 3. Si no tiene método de pago y NO quiere guardar (checkbox desmarcado)
      else if (selectedOption === "card" && !savedCard && !cardData.save) {
        const encrypted = btoa(JSON.stringify({
          number: cardData.number,
          expiry: cardData.expiry,
          cvc: cardData.cvc,
          name: cardData.name,
        }));
        sessionStorage.setItem("tempCardData", encrypted);
      }
      // 4. Si no tiene método de pago y quiere guardar uno nuevo
      else if (selectedOption === "card" && !savedCard && cardData.save) {
        const res = await authFetch("/api/payments/method", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
          setLoading(false);
          return;
        }
      }
      // Crear la reserva definitiva (esto siempre)
      // const reservaPayload = {
      //   field_id: reservaTemp.field_id,
      //   date: reservaTemp.date,
      //   slot: reservaTemp.slot,
      //   total_price: reservaTemp.total_price,
      //   user_ids: Array(reservaTemp.numUsers).fill(null),
      // };
      // const reservaRes = await authFetch("/api/reservations", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(reservaPayload),
      // });
      // if (!reservaRes.ok) {
      //   const data = await reservaRes.json();
      //   setFormError(data.message || "Error al crear la reserva");
      //   setLoading(false);
      //   return;
      // }
      // setSuccess("Reserva y método de pago guardados correctamente");
      // sessionStorage.removeItem("reservaTemp");
      // setTimeout(() => navigate("/dashboard"), 1500);
      setSuccess("Método de pago guardado correctamente");
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

  const slotLabel = reservaTemp?.slot ? (SLOTS.find(s => s.id === Number(reservaTemp.slot))?.label || reservaTemp.slot) : "-";

  return (
    <div className="dashboard-layout">
      <Header username={username} onUserMenu={() => {}} menuOpen={false} handleLogout={() => {}} />
      <main className="dashboard-main payment-main-center">
        <div className="payment-grid">
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
                      <div className="input-icon-group">
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
                      </div>
                      <div className="payment-fields-row">
                        <label className="payment-expiry-label">
                          Fecha de expiración
                          <div className="input-icon-wrapper">
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
                            {cardData.expiry === "" && (
                              <img src="/images/metodospago/fechatarjeta.svg" alt="icono fecha" className="input-icon-img" />
                            )}
                          </div>
                          <span className="payment-fields-info"><b>Usa el formato mes/año. Por ejemplo: 08/25</b></span>
                        </label>
                        <label className="payment-cvc-label">
                          Código de seguridad
                          <div className="input-icon-wrapper">
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
                            {cardData.cvc === "" && (
                              <img src="/images/metodospago/csvtarjeta.svg" alt="icono cvc" className="input-icon-img" />
                            )}
                          </div>
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
                      <label className="payment-save-card" tabIndex={0} onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setCardData(prev => ({ ...prev, save: !prev.save }));
                        }
                      }}>
                        <input
                          type="checkbox"
                          name="save"
                          checked={cardData.save}
                          onChange={handleCardInput}
                          tabIndex={-1}
                          aria-checked={cardData.save}
                          aria-label="Guardar para futuras compras"
                        />
                        Guardar para futuras compras. Activando esta casilla completarás futuras reservas de forma más rápida y cómoda. Podrás eliminar tu tarjeta cuando quieras.
                      </label>
                      <button type="submit" className="payment-confirm-btn" disabled={loading}>
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
          <PaymentSummary
            reserva={reservaTemp}
            fieldData={fieldData}
            slotLabel={slotLabel}
            onConfirm={handleSubmit}
            confirmDisabled={loading}
          />
        </div>
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
