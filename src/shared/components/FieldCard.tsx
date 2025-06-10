import React from "react";
import "./FieldCard.css";

export interface FieldCardProps {
  id: number;
  name: string;
  location: string;
  address?: string;
  description?: string;
  type: 'futbol7' | 'futbol11';
  price_per_hour: number;
  reservations_count: number;
  max_reservations: number;
  available_spots: number;
  images?: string[];
  onReserve?: () => void;
  hideReserveButton?: boolean;
}

const FieldImageCarousel: React.FC<{ images: string[] }> = ({ images }) => {
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 20000);
    return () => clearInterval(interval);
  }, [images.length]);
  if (images.length === 0) return null;
  return (
    <div className="field-carousel">
      <img src={images[index]} alt="Campo" className="field-image" />
      <button className="carousel-btn left" onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)} aria-label="Anterior">&#8592;</button>
      <button className="carousel-btn right" onClick={() => setIndex((i) => (i + 1) % images.length)} aria-label="Siguiente">&#8594;</button>
      <div className="carousel-dots">
        {images.map((_, i) => (
          <span
            key={i}
            className={i === index ? "dot active" : "dot"}
            onClick={() => setIndex(i)}
            style={{ cursor: 'pointer' }}
          ></span>
        ))}
      </div>
    </div>
  );
};

const FieldCard: React.FC<FieldCardProps> = ({
  name,
  location,
  description,
  type,
  price_per_hour,
  max_reservations,
  available_spots,
  images = ["/logo.webp", "/logo.webp", "/logo.webp", "/logo.webp"],
  onReserve,
  hideReserveButton
}) => (
  <div className="field-card">
    <FieldImageCarousel images={images} />
    <div className="field-info">
      <div className="field-card-title">
        {name.includes('(') && name.includes(')')
          ? (
            <>
              {name.substring(0, name.indexOf('(')).trim()}
              <div className="field-card-club">
                {name.substring(name.indexOf('(') + 1, name.indexOf(')'))}
              </div>
            </>
          )
          : name}
      </div>
      <p className="field-location">{location}</p>
      <p className="field-description">{description}</p>
      <div className="field-type">Tipo: <b>{type === 'futbol7' ? 'Fútbol 7' : 'Fútbol 11'}</b></div>
      <div className="field-spots">
        Plazas disponibles: <b>{typeof available_spots === 'number' ? available_spots : max_reservations}</b> / {max_reservations}
      </div>
      <div className="field-bottom">
        <span className="field-price">{price_per_hour} €</span>
        {!hideReserveButton && <button className="reserve-btn" onClick={onReserve}>Reservar</button>}
      </div>
    </div>
  </div>
);

export default FieldCard;
