import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../css/AllPinSoulLocaiton.css';
import { apiFetch } from '../api';
import LocationQRCode from './qrcode';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const categoryConfig = {
  RESTAURANT: { icon: '🍽️', accent: '#ff8a5c' },
  STREET_FOOD: { icon: '🌮', accent: '#ffb03b' },
  CAFE: { icon: '☕', accent: '#d4a574' },
  PARK: { icon: '🌳', accent: '#5fd08a' },
  MUSEUM: { icon: '🏛️', accent: '#b794f6' },
  SHOPPING_CENTER: { icon: '🛒', accent: '#ff6b9d' },
  HOTEL: { icon: '🏨', accent: '#5bb8ff' },
  GYM: { icon: '🏋️', accent: '#ff5d5d' },
  THEATER: { icon: '🎭', accent: '#e86bd6' },
  VIEWPOINT: { icon: '🌄', accent: '#4fd8d0' },
  TRIPPLACE: { icon: '🧭', accent: '#7fd36b' },
  OTHER: { icon: '📍', accent: '#a8abb2' },
};

const fallbackCategory = categoryConfig.OTHER;

function getCategoryIcon(category) {
  const config = categoryConfig[category] || fallbackCategory;

  return L.divIcon({
    className: 'category-marker-wrapper',
    html: `<span class="category-marker" style="--marker-color: ${config.accent}">${config.icon}</span>`,
    iconSize: [46, 60],
    iconAnchor: [23, 60],
    popupAnchor: [0, -60],
  });
}

function getImageDataUrl(location) {
  if (!location.imageData) return '';
  return `data:${location.imageContentType || 'image/jpeg'};base64,${location.imageData}`;
}

function getLocationShareLink(location) {
  const coordinates = `${location.latitude},${location.longitude}`;
  const params = new URLSearchParams({
    api: '1',
    query: coordinates,
    name: location.address,
    latitude: String(location.latitude),
    longitude: String(location.longitude),
  });
  return `https://www.google.com/maps/search/?${params.toString()}`;
}

function getLocationIcon(location) {
  const imageDataUrl = getImageDataUrl(location);
  if (!imageDataUrl) return getCategoryIcon(location.category);

  return L.divIcon({
    className: 'location-image-marker-wrapper',
    html: `<img class="location-image-marker" src="${imageDataUrl}" alt="" />`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
  });
}

function MapFocus({ location }) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo([location.latitude, location.longitude], 15);
    }
  }, [location, map]);

  return null;
}

export default function AllPinSoulLocation({ isAdmin = false }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') || '');
  const [sharingLocationId, setSharingLocationId] = useState(null);
  const [shareStatus, setShareStatus] = useState('');
  const sharingLocation = locations.find((location) => location.locationId === sharingLocationId);

  useEffect(() => {
    if (!sharingLocation) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSharingLocationId(null);
        setShareStatus('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sharingLocation]);

  // Check authentication and fetch locations
  useEffect(() => {
    const user = localStorage.getItem('user');
    const signId = localStorage.getItem('signId');
    const token = localStorage.getItem('token');

    if (!user || (!isAdmin && !signId) || !token) {
      navigate('/signin');
      return;
    }

    const requestedCategory = searchParams.get('category') || '';
    setSelectedCategory(requestedCategory);
    fetchCategories();
    fetchLocations(isAdmin ? null : signId, requestedCategory);
  }, [isAdmin, navigate, searchParams]);

  const fetchCategories = async () => {
    try {
      const response = await apiFetch('/location/categories');
      if (response.status === 401 || response.status === 403) {
        navigate('/signin');
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to load location categories');
      }

      setCategories(await response.json());
    } catch (err) {
      setError(`Error loading location categories: ${err.message}`);
    }
  };

  const fetchLocations = async (signId, category = selectedCategory) => {
    setLoading(true);
    setError('');

    try {
      const url = isAdmin
        ? '/admin/all-pin-loactions'
        : category
          ? `/location/getlocationcategory/${signId}/${category}`
          : `/location/getlocation/${signId}`;
      console.log('Fetching locations from:', url);
      
      const response = await apiFetch(url);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.status === 401 || response.status === 403) {
        navigate('/signin');
        return;
      }
      
      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        setError(`Failed to load locations (Error: ${response.status}). Make sure the backend is running.`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      const validLocations = (Array.isArray(data) ? data : [])
        .map((location) => ({
          ...location,
          latitude: Number(location.latitude),
          longitude: Number(location.longitude),
        }))
        .filter((location) => !isAdmin || !category || location.category === category)
        .filter((location) => Number.isFinite(location.latitude) && Number.isFinite(location.longitude))
        .sort((first, second) => {
          const firstCreatedAt = Date.parse(first.createdAt);
          const secondCreatedAt = Date.parse(second.createdAt);
          const firstHasDate = Number.isFinite(firstCreatedAt);
          const secondHasDate = Number.isFinite(secondCreatedAt);

          if (!firstHasDate) return secondHasDate ? 1 : 0;
          if (!secondHasDate) return -1;
          return secondCreatedAt - firstCreatedAt;
        });

      console.log('Locations loaded:', validLocations);
      setLocations(validLocations);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error fetching locations: ' + err.message + '. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    const signId = localStorage.getItem('signId');

    setSelectedCategory(category);
    setSelectedLocation(null);
    fetchLocations(isAdmin ? null : signId, category);
  };

  const handleLocationClick = (location) => {
    setSelectedLocation(selectedLocation?.locationId === location.locationId ? null : location);
  };

  const handleCopyLocationLink = async (location, event) => {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(getLocationShareLink(location));
      setShareStatus('Link copied');
    } catch {
      setShareStatus('Copy unavailable. Select the link to copy it.');
    }
  };

  const handleDeleteLocation = async (locationId) => {
    if (!window.confirm('Are you sure you want to delete this location?')) {
      return;
    }

    try {
      const response = await apiFetch(`/location/delete/${locationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setLocations(locations.filter(loc => loc.locationId !== locationId));
        setSelectedLocation(null);
      } else {
        alert('Failed to delete location');
      }
    } catch (err) {
      alert('Error deleting location: ' + err.message);
    }
  };

  // Calculate map center
  const getMapCenter = () => {
    if (locations.length === 0) return [20, 0];
    if (selectedLocation) return [selectedLocation.latitude, selectedLocation.longitude];
    
    const avgLat = locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length;
    const avgLng = locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length;
    return [avgLat, avgLng];
  };

  return (
    <div className="all-pinsoul-location min-vh-100">
      <div className="location-header">
        <div className="header-title">
          <button className="back-btn" onClick={() => navigate(isAdmin ? '/' : '/location-dashboard')}>← Back</button>
          <h1>{isAdmin ? 'Admin PinSoul Location' : 'All PinSoul Locations'}</h1>
        </div>
        <div className="location-count">
          {locations.length} Location{locations.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="location-filters">
        <label htmlFor="location-category-filter">Filter by category</label>
        <select
          id="location-category-filter"
          value={selectedCategory}
          onChange={handleCategoryChange}
          disabled={loading && categories.length === 0}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="status-banner status-loading">Loading...</div>}
      {error && <div className="status-banner status-error">{error}</div>}

      <div className={`location-container ${isAdmin ? 'admin-location-container' : ''}`}>
        {!isAdmin && <div className="map-container">
          {loading ? (
            <div className="loading">
              <p>Loading locations...</p>
              <p>Please wait...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>❌ {error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : locations.length === 0 ? (
            <div className="no-locations">
              <p>No locations saved yet</p>
              <button onClick={() => navigate('/location-dashboard')}>Save Your First Location</button>
            </div>
          ) : (
            <>
              <MapContainer
                center={getMapCenter()}
                zoom={locations.length === 1 ? 13 : 10}
                style={{ height: '100%', width: '100%', borderRadius: '15px' }}
              >
                <MapFocus location={selectedLocation} />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                  maxZoom={19}
                />
                {locations.map((location) => {
                  const category = categoryConfig[location.category] || fallbackCategory;
                  const markerColor = category.accent;
                  return (
                    <Marker
                      key={`marker-${location.locationId}`}
                      position={[location.latitude, location.longitude]}
                      icon={getLocationIcon(location)}
                    >
                      <Popup className="custom-location-popup">
                        <div
                          className="popup-content"
                          style={{ '--marker-color': markerColor }}
                        >
                          <p className="popup-address"><strong>{location.address}</strong></p>
                          {location.category && (
                            <span
                              className="popup-category-badge"
                              style={{
                                background: `${markerColor}22`,
                                color: markerColor,
                                border: `1px solid ${markerColor}55`
                              }}
                            >
                              {location.category.replaceAll('_', ' ')}
                            </span>
                          )}
                          <p className="popup-date">
                            {new Date(location.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </>
          )}
        </div>}

        {/* Locations List */}
        <div className={`locations-list ${isAdmin ? 'admin-locations-list' : ''}`}>
          <h2>{isAdmin ? 'All Saved Locations' : 'Your Pinned Locations'}</h2>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : locations.length === 0 ? (
            <p className="no-data">No locations found</p>
          ) : (
            <div className="location-items">
              {locations.map((location) => (
                <div
                  key={location.locationId}
                  className={`location-item${location.imageData ? ' has-thumbnail' : ''} ${selectedLocation?.locationId === location.locationId ? 'active' : ''}`}
                  onClick={() => handleLocationClick(location)}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleLocationClick(location);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  {getImageDataUrl(location) && (
                    <img
                      className="location-thumbnail"
                      src={getImageDataUrl(location)}
                      alt=""
                    />
                  )}
                  <div className="location-info">
                    <div className="location-title-row">
                      {selectedLocation?.locationId === location.locationId && (
                        <span className="sky-blue-pulse-dot" title="Selected Location"></span>
                      )}
                      <p className="location-address">{location.address}</p>
                    </div>
                    {location.category && (
                      <span
                        className="category-pill"
                        style={{ '--category-accent': (categoryConfig[location.category] || fallbackCategory).accent }}
                      >
                        <span aria-hidden="true">{(categoryConfig[location.category] || fallbackCategory).icon}</span>
                        {location.category.replaceAll('_', ' ')}
                      </span>
                    )}
                    <p className="location-date">
                      {new Date(location.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="location-item-actions">
                    <button
                      className="share-location-btn"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSharingLocationId(location.locationId);
                        setShareStatus('');
                      }}
                      aria-expanded={sharingLocationId === location.locationId}
                      aria-haspopup="dialog"
                    >
                      Share
                    </button>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLocation(location.locationId);
                      }}
                      title="Delete location"
                      aria-label={`Delete ${location.address}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {sharingLocation && (
        <div
          className="location-share-backdrop"
          onClick={() => {
            setSharingLocationId(null);
            setShareStatus('');
          }}
        >
          <section
            className="location-share-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="location-share-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="location-share-heading">
              <div>
                <span className="location-share-eyebrow">PIN SOUL · LOCATION</span>
                <h2 id="location-share-title">Share this place</h2>
                <p className="location-share-address">{sharingLocation.address}</p>
              </div>
              <button
                type="button"
                className="close-location-share"
                aria-label="Close share dialog"
                onClick={() => {
                  setSharingLocationId(null);
                  setShareStatus('');
                }}
              >
                ×
              </button>
            </div>

            <div className="location-share-content">
              <div className="location-share-details">
              <label htmlFor="share-location-link">Shareable Google Maps link</label>
                <div className="location-share-controls">
                  <input
                    id="share-location-link"
                    type="url"
                    value={getLocationShareLink(sharingLocation)}
                    readOnly
                    onFocus={(event) => event.currentTarget.select()}
                  />
                  <button
                    type="button"
                    className="copy-location-link"
                    onClick={(event) => handleCopyLocationLink(sharingLocation, event)}
                  >
                    Copy link
                  </button>
                </div>
                {shareStatus && <p className="location-share-status" role="status">{shareStatus}</p>}
                <a
                  className="open-location-map"
                  href={getLocationShareLink(sharingLocation)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Google Maps <span aria-hidden="true">↗</span>
                </a>
              </div>

              <aside className="location-share-qr-panel">
                <p className="location-share-qr-label">Scan to open this location</p>
                <LocationQRCode
                  value={getLocationShareLink(sharingLocation)}
                  title={`Google Maps location for ${sharingLocation.address}`}
                />
                <span className="location-share-qr-hint">Point your camera at the code</span>
              </aside>
            </div>

            <div className="location-share-dialog-actions">
              <button
                type="button"
                className="cancel-location-share"
                onClick={() => {
                  setSharingLocationId(null);
                  setShareStatus('');
                }}
              >
                Cancel
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}