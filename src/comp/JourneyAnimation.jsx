import { useState } from 'react';
import mapBgImage from '../assets/journey_destination.png';
import '../css/JourneyAnimation.css';

const LIGHT_COLOR_PINS = [
  { id: 1, left: '20%', top: '36%', name: 'West Ridge View', category: 'Scenic Spot', color: '#38bdf8', icon: '🏔️' },
  { id: 2, left: '60.5%', top: '29.5%', name: 'North Boulevard', category: 'City Landmark', color: '#10b981', icon: '🏛️' },
  { id: 3, left: '43.5%', top: '45.5%', name: 'Central Blue Quarter', category: 'Cultural District', color: '#f59e0b', icon: '🎨' },
  { id: 4, left: '74.5%', top: '46.5%', name: 'East Promenade', category: 'Walking Trail', color: '#a855f7', icon: '🌲' },
  { id: 5, left: '55.5%', top: '61.5%', name: 'Green Park Center', category: 'Nature Park', color: '#ec4899', icon: '🌸' },
  { id: 6, left: '14.5%', top: '69.5%', name: 'Southwest Gateway', category: 'Historical Arch', color: '#06b6d4', icon: '⛩️' },
  { id: 7, left: '30.5%', top: '67%', name: 'Avenue Junction', category: 'Cafe & Dining', color: '#f97316', icon: '☕' },
  { id: 8, left: '76.5%', top: '67.5%', name: 'East Plaza', category: 'Shopping Hub', color: '#6366f1', icon: '🛍️' },
  { id: 9, left: '50.8%', top: '80%', name: 'South Basin View', category: 'Waterfront', color: '#84cc16', icon: '🌅' },
  { id: 10, left: '85.5%', top: '77.5%', name: 'Southeast Point', category: 'Favorite Spot', color: '#f43f5e', icon: '📍' },
];

export default function JourneyAnimation() {
  const [clickedPinId, setClickedPinId] = useState(null);

  const activePin = LIGHT_COLOR_PINS.find((p) => p.id === clickedPinId);

  const handlePinClick = (pinId) => {
    setClickedPinId((prev) => (prev === pinId ? null : pinId));
  };

  return (
    <div className="screen2-animated-container">
      {/* Figma Screen 2 Map Graphic */}
      <img src={mapBgImage} alt="PinSoul Map" className="screen2-bg-image" />

      {/* Pins Layer with Dynamic Light Colors */}
      <div className="animated-pins-layer">
        {LIGHT_COLOR_PINS.map((pin) => {
          const isClicked = pin.id === clickedPinId;
          return (
            <div
              key={pin.id}
              className={`color-pin-wrapper ${isClicked ? 'pin-blinking' : ''}`}
              style={{
                left: pin.left,
                top: pin.top,
                '--pin-light-color': pin.color,
              }}
              onClick={() => handlePinClick(pin.id)}
            >
              {/* Only blink & emit radar rings when clicked */}
              {isClicked && (
                <>
                  <div className="click-radar-ring ring-1" />
                  <div className="click-radar-ring ring-2" />
                </>
              )}

              {/* Glowing Pin Head with Light Color */}
              <div className="color-pin-core">
                <span className="pin-emoji">{pin.icon}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Info Badge on Click */}
      {activePin ? (
        <div
          className="screen2-info-badge"
          style={{ borderLeftColor: activePin.color }}
        >
          <div className="badge-header">
            <span
              className="live-dot-blink"
              style={{ backgroundColor: activePin.color, boxShadow: `0 0 10px ${activePin.color}` }}
            />
            <span className="pin-num" style={{ color: activePin.color }}>
              Blinking Pin #{activePin.id}
            </span>
          </div>
          <div className="badge-body">
            <h4 className="pin-name">{activePin.name}</h4>
            <span className="pin-cat">{activePin.category}</span>
          </div>
        </div>
      ) : (
        <div className="click-prompt-badge">
          <span className="hand-icon">👇</span> Click any colored pin to start blinking
        </div>
      )}
    </div>
  );
}
