import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../css/LocationDashboard.css';
import { apiFetch } from '../api';

export default function LocationDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Check authentication on mount
  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
      navigate('/signin');
      return;
    }

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

        const loadedCategories = await response.json();
        setCategories(loadedCategories);
        const requestedCategory = searchParams.get('category');
        setCategory(loadedCategories.includes(requestedCategory) ? requestedCategory : '');
      } catch (err) {
        setError(`Error loading location categories: ${err.message}`);
      }
    };

    fetchCategories();
  }, [navigate, searchParams]);

  // Fetch current location
  const handleFetchLocation = () => {
    setFetching(true);
    setError('');
    setMessage('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setFetching(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setLatitude(lat.toString());
        setLongitude(lng.toString());
        setMessage('Location captured. Add an address and category to continue.');
        setFetching(false);
      },
      (err) => {
        setError(`Error fetching location: ${err.message}`);
        setFetching(false);
      }
    );
  };

  // Submit location to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Validation
    if (!latitude || !longitude) {
      setError('Please fetch your current location first');
      setLoading(false);
      return;
    }

    if (!address.trim()) {
      setError('Please enter an address');
      setLoading(false);
      return;
    }

    if (!category) {
      setError('Please select a location category');
      setLoading(false);
      return;
    }

    if (image && !image.type.startsWith('image/')) {
      setError('Please select an image file');
      setLoading(false);
      return;
    }

    if (image && image.size > 10 * 1024 * 1024) {
      setError('Image is too large. Please choose an image smaller than 10 MB');
      setLoading(false);
      return;
    }

    // Get signId directly from localStorage to avoid state timing issues
    const storedSignId = localStorage.getItem('signId');
    if (!storedSignId) {
      setError('User ID not found. Please sign in again.');
      setLoading(false);
      return;
    }

    try {
      const locationPayload = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address: address.trim(),
        category,
        sign: {
          signId: parseInt(storedSignId)
        }
      };
      const formData = new FormData();
      formData.append('location', new Blob([JSON.stringify(locationPayload)], { type: 'application/json' }));
      if (image) {
        formData.append('image', image);
      }

      const response = await apiFetch('/location/save', {
        method: 'POST',
        body: formData
      });

      const data = await response.text();

      if (response.ok) {
        navigate('/all-locations');
      } else {
        setError('Failed to save location: ' + data);
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="location-dashboard min-vh-100">
      <div className="dashboard-header">
        <h1>PinSoul Location</h1>
        <div className="header-buttons">
          <button className="view-all-btn" onClick={() => navigate('/user-dashboard')}>← Back</button>
          <button className="view-all-btn" onClick={() => navigate('/all-locations')}>View All Locations</button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="location-card">
          <h2>Share Your Location</h2>

          <button
            className="fetch-btn btn w-100"
            onClick={handleFetchLocation}
            disabled={fetching}
          >
            {fetching ? 'Fetching...' : 'Get Current Location'}
          </button>

          <form onSubmit={handleSubmit} className="location-form">
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address manually (e.g., 123 Main St, City)"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Location category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                disabled={categories.length === 0}
              >
                <option value="">
                  {categories.length === 0 ? 'Loading categories...' : 'Select a category'}
                </option>
                {categories.map((locationCategory) => (
                  <option key={locationCategory} value={locationCategory}>
                    {locationCategory.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group location-image-field">
              <label htmlFor="location-image">Location image (optional)</label>
              <input
                type="file"
                id="location-image"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
              {image && <span className="file-name">Selected: {image.name}</span>}
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading || !latitude || !longitude}
            >
              {loading ? 'Saving...' : 'Save Location'}
            </button>
          </form>

          {message && <div className="message success">{message}</div>}
          {error && <div className="message error">{error}</div>}
        </div>
      </div>
    </div>
  );
}