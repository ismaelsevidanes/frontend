import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Breadcrumbs.css";

interface Crumb {
  label: string;
  to: string;
}

const routeMap: Record<string, (params?: any) => Crumb[]> = {
  "/": () => [
    { label: "Inicio", to: "/dashboard" },
  ],
  "/dashboard": () => [
    { label: "Inicio", to: "/dashboard" },
  ],
  "/reserva/:id": () => [
    { label: "Inicio", to: "/dashboard" },
    { label: "Detalle del campo", to: "" },
  ],
  "/pago": () => [
    { label: "Inicio", to: "/dashboard" },
    {/* Este no funciona*/},
    {/* label: "Detalle del campo", to: "/reserva/:id" */},
    { label: "Detalle del campo", to: "/dashboard" },
    { label: "Método de pago", to: "" },
  ],
  "/summary": () => [
    { label: "Inicio", to: "/dashboard" },
    {/* Estos dos no funcionan */},
    {/*label: "Detalle del campo", to: "/reserva/:id" */},
    {/* label: "Método de pago", to: "/pago" */},
    { label: "Detalle del campo", to: "/dashboard" },
    { label: "Método de pago", to: "/dashboard" },
    { label: "Resumen", to: "" },
  ],
  "/historial": () => [
    { label: "Inicio", to: "/dashboard" },
    { label: "Historial de reservas", to: "" },
  ],
  "/faq": () => [
    { label: "Inicio", to: "/dashboard" },
    { label: "FAQ", to: "" },
  ],
  "/contacto": () => [
    { label: "Inicio", to: "/dashboard" },
    { label: "Contacto", to: "" },
  ],
  "/about": () => [
    { label: "Inicio", to: "/dashboard" },
    { label: "Sobre Nosotros", to: "" },
  ],
  "/account": () => [
    { label: "Inicio", to: "/dashboard" },
    { label: "Mi Cuenta", to: "" },
  ],
  "/reservations-history": () => [
    { label: "Inicio", to: "/dashboard" },
    { label: "Mis reservas", to: "" },
  ],
};

function getCrumbs(pathname: string): Crumb[] {
  if (pathname.startsWith("/reserva/")) return routeMap["/reserva/:id"]();
  if (pathname === "/pago") return routeMap["/pago"]();
  if (pathname === "/summary") return routeMap["/summary"]();
  if (pathname === "/historial") return routeMap["/historial"]();
  if (pathname === "/faq") return routeMap["/faq"]();
  if (pathname === "/contacto") return routeMap["/contacto"]();
  if (pathname === "/about") return routeMap["/about"]();
  if (pathname === "/account") return routeMap["/account"]();
  if (pathname === "/reservations-history") return routeMap["/reservations-history"]();
  if (pathname === "/dashboard" || pathname === "/") return routeMap["/dashboard"]();
  return [{ label: "Inicio", to: "/dashboard" }];
}

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const crumbs = getCrumbs(location.pathname);
  return (
    <nav className="breadcrumbs" aria-label="Migas de pan" role="navigation" tabIndex={-1}>
      {crumbs.map((crumb, i) =>
        crumb.to && i !== crumbs.length - 1 ? (
          <span key={i}>
            <Link to={crumb.to}>{crumb.label}</Link>
            <span className="breadcrumbs-sep" aria-hidden="true">/</span>
          </span>
        ) : (
          <span key={i} className="breadcrumbs-current" aria-current="page">{crumb.label}</span>
        )
      )}
    </nav>
  );
};

export default Breadcrumbs;
