import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";
import Header from "../shared/components/Header";
import Footer from "../shared/components/Footer";
import Modal from "../shared/components/Modal";
import { authFetch } from "../shared/utils/authFetch";
import PaymentSummary from "../shared/components/PaymentSummary";
import CheckoutStepper from "../shared/components/CheckoutStepper";
import { UserMenuProvider, useUserMenu } from "../shared/components/UserMenuProvider";
import Breadcrumbs from "../shared/components/Breadcrumbs";
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

const PaymentMethodContent = () => {
  const navigate = useNavigate();
  const { menuOpen, setMenuOpen, handleLogout } = useUserMenu();
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fieldData, setFieldData] = useState<any>(null);
  // Estado para el modal de confirmación de pago
  const [showConfirmPaymentModal, setShowConfirmPaymentModal] = useState(false);

  useEffect(() => {
    // obtener usuario del token
    authFetch("/api/payments/method")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.last4) setSavedCard({ last4: data.last4 });
      });
    const reserva = sessionStorage.getItem("reservaTemp");
    if (!reserva) {
      alert("No hay datos de reserva. Por favor, vuelve a seleccionar campo, fecha y hora.");
      navigate("/", { replace: true });
      return;
    }
    const parsed = JSON.parse(reserva);
    if (!parsed.field_id || !parsed.date || !parsed.slot || !(parsed.numUsers || parsed.quantity)) {
      alert("Faltan datos de la reserva. Por favor, vuelve a seleccionar campo, fecha y hora.");
      navigate("/", { replace: true });
      return;
    }
    setReservaTemp(parsed);
  }, [navigate]);

  useEffect(() => {
    // Si hay tarjeta guardada, seleccionarla por defecto
    if (savedCard) setSelectedOption("saved");
  }, [savedCard]);

  useEffect(() => {
    if (reservaTemp?.field_id) {
      fetch(`/api/fields/${reservaTemp.field_id}`)
        .then (r => r.ok ? r.json() : null)
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
    if (name === "cvc") {
      // Solo permitir máximo 3 dígitos
      let clean = value.replace(/\D/g, "").slice(0, 3);
      setCardData((prev) => ({ ...prev, cvc: clean }));
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
      if (!/^\d{4} \d{4} \d{4} \d{4}$/.test(cardData.number)) {
        setFormError("El número de tarjeta debe tener el formato 1234 5678 9012 3456");
        return;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardData.expiry)) {
        setFormError("Fecha de expiración inválida (MM/YY)");
        return;
      }
      if (!/^\d{3}$/.test(cardData.cvc)) {
        setFormError("El CVC debe tener exactamente 3 dígitos");
        return;
      }
      if (!cardData.name.trim()) {
        setFormError("El titular de la tarjeta es obligatorio");
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
            cardNumber: cardData.number.replace(/\s+/g, ""), // Elimina espacios
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
            cardNumber: cardData.number.replace(/\s+/g, ""), // Elimina espacios
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
  const handleOpenConfirmPayment = () => {
    if (!hasPaymentMethod) {
      setFormError("Debes añadir un método de pago antes de confirmar la reserva.");
      return;
    }
    setFormError("");
    setShowConfirmPaymentModal(true);
  };

  // Consulta plazas libres para ese campo, fecha y slot
  const getAvailableSpots = async (fieldId: number, date: string, slot: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/fields/${fieldId}/availability?date=${date}&slot=${slot}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) return 0;
      const data = await res.json();
      return data.availableSpots ?? 0;
    } catch {
      return 0;
    }
  };

  // Handler para confirmar el pago (llama a handleSubmit real y crea la reserva)
  const handleConfirmPayment = async () => {
    setShowConfirmPaymentModal(false);
    setFormError("");
    setSuccess("");
    setLoading(true);
    try {
      if (!hasPaymentMethod) {
        setFormError("Debes añadir un método de pago antes de confirmar la reserva.");
        setLoading(false);
        return;
      }
      if (!reservaTemp?.field_id || !reservaTemp?.date || !reservaTemp?.slot || !(reservaTemp?.numUsers || reservaTemp?.quantity)) {
        setFormError("Faltan datos obligatorios para la reserva. Por favor, vuelve a seleccionar el campo y horario.");
        setLoading(false);
        return;
      }
      // Consulta plazas libres antes de reservar
      const numUsers = reservaTemp.numUsers || reservaTemp.quantity || 1;
      const spots = await getAvailableSpots(reservaTemp.field_id, reservaTemp.date, reservaTemp.slot);
      if (numUsers > spots) {
        setFormError(`No hay suficientes plazas disponibles para este campo, día y slot. Quedan: ${spots}`);
        setLoading(false);
        return;
      }
      let userId = null;
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          userId = payload.id || payload.user_id || payload._id || null;
        } catch {}
      }
      // El backend espera al menos un usuario en el array user_ids
      const user_ids = userId ? Array(numUsers).fill(userId) : Array(numUsers).fill(1); // Si no hay login, usa 1
      const total_price = Number(reservaTemp.total_price); // <-- Asegura que es número
      const reservaPayload = {
        field_id: reservaTemp.field_id,
        date: reservaTemp.date,
        slot: reservaTemp.slot,
        total_price, // <-- número, no string
        user_ids,
        quantity: numUsers
      };
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
      let ticket: any = await reservaRes.json();
      // Reconstruir propiedades para el ticket si faltan
      ticket.slotLabel = ticket.slotLabel || (SLOTS.find(s => s.id === Number(ticket.slot))?.label || ticket.slot);
      ticket.numUsers = ticket.numUsers || reservaTemp.numUsers || reservaTemp.quantity;
      ticket.fieldName = ticket.fieldName || fieldData?.name || reservaTemp.field_id;
      ticket.fieldAddress = ticket.fieldAddress || fieldData?.address || "";
      ticket.price = ticket.price || fieldData?.price || reservaTemp.price || fieldData?.price_per_hour || reservaTemp.price_per_hour || 0;
      ticket.total_price = ticket.total_price || ((fieldData?.price || reservaTemp.price || fieldData?.price_per_hour || reservaTemp.price_per_hour || 0) * (reservaTemp.numUsers || reservaTemp.quantity || 1));
      ticket.created_at = ticket.created_at || new Date().toISOString();
      ticket.creator_id = ticket.creator_id || userId;
      ticket.field_id = ticket.field_id || reservaPayload.field_id;
      ticket.slot = ticket.slot || reservaPayload.slot;
      ticket.user_ids = ticket.user_ids || reservaPayload.user_ids;
      ticket.quantity = ticket.quantity || reservaPayload.quantity;
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

  return (
    <div className="dashboard-layout">
      <Header
        onUserMenu={() => setMenuOpen((open: boolean) => !open)}
        menuOpen={menuOpen}
        handleLogout={handleLogout}
      >
        <CheckoutStepper step={1} />
      </Header>
      <Breadcrumbs />
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
            onCancelTemp={() => {
              sessionStorage.removeItem("reservaTemp");
              navigate("/dashboard");
            }}
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

const PaymentMethod: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: location.pathname + location.search } });
    }
  }, [navigate, location]);
  return (
    <UserMenuProvider>
      <PaymentMethodContent />
    </UserMenuProvider>
  );
};

export default PaymentMethod;
