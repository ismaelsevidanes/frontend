import React from "react";

interface GoogleMapEmbedProps {
  query: string; // Ejemplo: "Estadio Municipal Guadimar, Benacazón"
  height?: number | string;
  borderRadius?: number | string;
  className?: string;
}

const GoogleMapEmbed: React.FC<GoogleMapEmbedProps> = ({ query, height = 220, borderRadius = 14, className }) => (
  <div className={className} style={{ width: "100%" }}>
    <iframe
      title="Mapa del campo"
      width="100%"
      height={height}
      style={{ border: 0, borderRadius, marginTop: "1.2rem" }}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
    ></iframe>
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="field-detail-map-link"
      style={{ display: "block", marginTop: 6, color: "#1565c0", fontWeight: 500, textDecoration: "underline", fontSize: "1.08rem" }}
    >
      Ver en Google Maps
    </a>
  </div>
);

export default GoogleMapEmbed;
