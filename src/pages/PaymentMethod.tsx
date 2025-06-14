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
  // Estado para el modal de confirmación de pago
  const [showConfirmPaymentModal, setShowConfirmPaymentModal] = useState(false);
  // Estado para el menú de usuario
  const [menuOpen, setMenuOpen] = useState(false);

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

  // Refresca la vista y cierra el desplegable tras crear tarjeta
  useEffect(() => {
    if (success && selectedOption === "card") {
      setSelectedOption("");
      setReservaTemp((prev: any) => ({ ...prev }));
    }
    // Cierra el desplegable también si se guarda en sessionStorage (sin checkbox)
    if (success && !cardData.save) {
      setSelectedOption("");
      setReservaTemp((prev: any) => ({ ...prev }));
    }
  }, [success]);

  // Refresca el método de pago guardado tras guardar en la BD
  useEffect(() => {
    if (success && cardData.save) {
      authFetch("/api/payments/method")
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data && data.last4) setSavedCard({ last4: data.last4 });
          else setSavedCard(null);
        });
    }
  }, [success]);

  // Comprobación de método de pago válido (en session o en la BD)
  const hasPaymentMethod = React.useMemo(() => {
    if (savedCard) return true;
    try {
      const tempCard = sessionStorage.getItem("tempCardData");
      if (!tempCard) return false;
      const card = JSON.parse(atob(tempCard));
      return !!(card && card.number && card.expiry && card.cvc && card.name);
    } catch {
      return false;
    }
  }, [savedCard, success]);

  // Handler para el botón de Confirmar reserva en el resumen
  const handleOpenConfirmPayment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!hasPaymentMethod) {
      setFormError("Debes añadir un método de pago antes de confirmar la reserva.");
      return;
    }
    setFormError("");
    setShowConfirmPaymentModal(true);
  };

  // Handler para confirmar el pago (llama a handleSubmit real y crea la reserva)
  const handleConfirmPayment = async (e?: React.FormEvent) => {
    setShowConfirmPaymentModal(false);
    setFormError("");
    setSuccess("");
    setLoading(true);
    try {
      // validar que hay un método de pago
      if (!hasPaymentMethod) {
        setFormError("Debes añadir un método de pago antes de confirmar la reserva.");
        setLoading(false);
        return;
      }
      // Validar datos obligatorios antes de enviar
      if (!reservaTemp?.field_id || !reservaTemp?.date || !reservaTemp?.slot || !reservaTemp?.total_price || !reservaTemp?.numUsers) {
        setFormError("Faltan datos obligatorios para la reserva. Por favor, vuelve a seleccionar el campo y horario.");
        setLoading(false);
        return;
      }
      // Obtener el id del usuario actual del token
      let userId = null;
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          userId = payload.id || payload.user_id || payload._id || null;
        } catch {}
      }
      // Construir user_ids con el id del usuario actual
      const user_ids = userId ? Array(reservaTemp.numUsers).fill(userId) : undefined;
      const reservaPayload = {
        field_id: reservaTemp.field_id,
        date: reservaTemp.date,
        slot: reservaTemp.slot,
        total_price: reservaTemp.total_price,
        user_ids,
      };
      // Eliminar user_ids si no hay id válido
      if (!userId) delete reservaPayload.user_ids;
      const reservaRes = await authFetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservaPayload),
      });
      if (!reservaRes.ok) {
        let data = {};
        try { data = await reservaRes.json(); } catch {}
        setFormError((data as any).message || "Error al crear la reserva (servidor)");
        setLoading(false);
        return;
      }
      // Obtener datos de la reserva creada para el ticket
      let ticket = reservaPayload;
      try {
        ticket = await reservaRes.json();
      } catch {}
      // Añadir info extra para el ticket
      ticket.slotLabel = slotLabel;
      ticket.numUsers = reservaTemp.numUsers;
      ticket.fieldName = fieldData?.name || reservaTemp.field_id;
      ticket.fieldAddress = fieldData?.address || "";
      ticket.date = reservaTemp.date;
      // Corrige el precio unitario y el total
      const precioUnitario = fieldData?.price || reservaTemp.price || fieldData?.price_per_hour || reservaTemp.price_per_hour || 0;
      ticket.price = precioUnitario;
      ticket.total_price = precioUnitario * ticket.numUsers;
      // Añadir created_at y creator_id para el botón de cancelar
      ticket.created_at = ticket.created_at || new Date().toISOString();
      ticket.creator_id = userId;
      sessionStorage.removeItem("reservaTemp");
      sessionStorage.setItem("lastTicket", JSON.stringify(ticket));
      setSuccess("Reserva y método de pago guardados correctamente");
      setTimeout(() => navigate("/summary", { state: { ticket } }), 500);
    } catch (err) {
      setFormError("Error de red o datos inválidos");
    } finally {
      setLoading(false);
    }
  };

  // slotLabel debe estar definido antes de usarse
  const slotLabel = reservaTemp?.slot ? (SLOTS.find(s => s.id === Number(reservaTemp.slot))?.label || reservaTemp.slot) : "-";
  
  // Handler para abrir/cerrar menú usuario (igual que en FieldDetail)
  const handleUserMenu = () => setMenuOpen((open) => !open);

  // Handler para logout (igual que en FieldDetail)
  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    try {
      const response = await authFetch("/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (error) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  return (
    <div className="dashboard-layout">
      <Header
        username={username}
        onUserMenu={handleUserMenu}
        menuOpen={menuOpen}
        handleLogout={handleLogout}
      />
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
            {/*success && <div className="payment-success">{success}</div>*/}
          </form>
          <PaymentSummary
            reserva={reservaTemp}
            fieldData={fieldData}
            slotLabel={slotLabel}
            onConfirm={handleOpenConfirmPayment}
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
      {/* Modal de confirmación de pago */}
      {showConfirmPaymentModal && (
        <Modal isOpen={showConfirmPaymentModal} onClose={() => setShowConfirmPaymentModal(false)}>
          <div className="delete-modal-content-custom">
            <button className="delete-modal-close-custom" onClick={() => setShowConfirmPaymentModal(false)} aria-label="Cerrar">&times;</button>
            <div className="delete-modal-header-custom">
              <span>Confirmar Pago</span>
            </div>
            <div className="delete-modal-body-custom">
              Se procederá a realizar el pago
            </div>
            <div className="delete-modal-actions-custom">
              <button
                className="delete-modal-confirm-custom"
                onClick={handleConfirmPayment}
                disabled={loading}
              >Confirmar</button>
              <button className="delete-modal-cancel-custom" onClick={() => setShowConfirmPaymentModal(false)} disabled={loading}>Cancelar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PaymentMethod;
