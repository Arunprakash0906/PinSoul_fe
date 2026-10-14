import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import ProfileForm from './ProfileForm';
import '../css/UserDashboard.css';

// Each category gets its own pin icon and accent colour.
const categoryConfig = {
    RESTAURANT: { label: 'Restaurant', icon: '🍽️', accent: '#ff8a5c' },
    STREET_FOOD: { label: 'Street food', icon: '🌮', accent: '#ffb03b' },
    CAFE: { label: 'Cafe', icon: '☕', accent: '#d4a574' },
    PARK: { label: 'Park', icon: '🌳', accent: '#5fd08a' },
    MUSEUM: { label: 'Museum', icon: '🏛️', accent: '#b794f6' },
    SHOPPING_CENTER: { label: 'Shopping center', icon: '🛒', accent: '#ff6b9d' },
    HOTEL: { label: 'Hotel', icon: '🏨', accent: '#5bb8ff' },
    GYM: { label: 'Gym', icon: '🏋️', accent: '#ff5d5d' },
    THEATER: { label: 'Theater', icon: '🎭', accent: '#e86bd6' },
    VIEWPOINT: { label: 'Viewpoint', icon: '🌄', accent: '#4fd8d0' },
    TRIPPLACE: { label: 'Trip place', icon: '🧭', accent: '#7fd36b' },
    OTHER: { label: 'Other', icon: '📍', accent: '#a8abb2' },
};

const fallbackConfig = { icon: '📍', accent: '#a8abb2' };

export default function UserDashboard() {
    const navigate = useNavigate();
    const [categoryCounts, setCategoryCounts] = useState(null);
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [editingProfile, setEditingProfile] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [categoryError, setCategoryError] = useState('');

    useEffect(() => {
        if (!localStorage.getItem('user') || !localStorage.getItem('token')) {
            navigate('/signin', { replace: true });
            return;
        }

        const loadProfile = async () => {
            try {
                const response = await apiFetch('/user/profile');
                if (response.status === 401 || response.status === 403) {
                    navigate('/signin', { replace: true });
                    return;
                }
                if (!response.ok) {
                    const message = await response.text();
                    throw new Error(message || 'Unable to load your profile');
                }
                if (response.status === 204) {
                    setEditingProfile(true);
                    return;
                }
                setProfile(await response.json());
            } catch (requestError) {
                setProfileError(requestError.message || 'Unable to load your profile');
            } finally {
                setProfileLoading(false);
            }
        };

        loadProfile();
    }, [navigate]);

    useEffect(() => {
        if (!profile || editingProfile) {
            return;
        }

        const loadDashboard = async () => {
            try {
                const response = await apiFetch('/user/dashboard');
                if (response.status === 401 || response.status === 403) {
                    navigate('/signin', { replace: true });
                    return;
                }
                if (!response.ok) {
                    const message = await response.text();
                    throw new Error(message || 'Unable to load your categories');
                }
                setCategoryCounts(await response.json());
                setCategoryError('');
            } catch (requestError) {
                setCategoryError(requestError.message || 'Unable to load your categories');
            }
        };

        loadDashboard();
    }, [profile, editingProfile, navigate]);

    const handleSaveProfile = async (details) => {
        setSavingProfile(true);
        setProfileError('');
        try {
            const response = await apiFetch('/user/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(details),
            });
            if (response.status === 401 || response.status === 403) {
                navigate('/signin', { replace: true });
                return;
            }
            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || 'Unable to save your profile');
            }
            setProfile(await response.json());
            setEditingProfile(false);
        } catch (requestError) {
            setProfileError(requestError.message || 'Unable to save your profile');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('signId');
        navigate('/', { replace: true });
    };

    return (
        <div className="user-dashboard">
            <header className="user-dashboard-header">
                <button className="dashboard-logout-button" type="button" onClick={handleLogout}>
                    Log out
                </button>
                <div className="user-dashboard-heading">
                    <p className="dashboard-eyebrow">YOUR PINSOUL</p>
                    <h1>Saved Souls</h1>
                </div>
                <button
                    className="location-dashboard-button"
                    type="button"
                    onClick={() => navigate('/location-dashboard')}
                >
                    PinSoul locations <span aria-hidden="true">→</span>
                </button>
            </header>

            <main className="user-dashboard-content">
                <section className="dashboard-profile-section" aria-labelledby="profile-heading">
                    <div className="dashboard-section-heading">
                        <div>
                            <p className="dashboard-eyebrow">ACCOUNT</p>
                            <h2 id="profile-heading">Profile</h2>
                        </div>
                        {profile && !editingProfile && <button className="profile-secondary-button" type="button" onClick={() => {
                            setProfileError('');
                            setCategoryCounts(null);
                            setEditingProfile(true);
                        }}>Edit profile</button>}
                    </div>

                    {profileLoading && <p className="dashboard-status">Loading profile...</p>}
                    {!profileLoading && editingProfile && <ProfileForm
                        initialProfile={profile}
                        onSave={handleSaveProfile}
                        onCancel={profile ? () => setEditingProfile(false) : null}
                        saving={savingProfile}
                        error={profileError}
                    />}
                    {!profileLoading && profile && !editingProfile && <dl className="profile-summary">
                        <div><dt>Full name</dt><dd>{profile.name}</dd></div>
                        <div><dt>Email</dt><dd>{profile.email}</dd></div>
                        <div><dt>Phone</dt><dd>{profile.phone}</dd></div>
                        <div><dt>Address</dt><dd>{profile.address}</dd></div>
                    </dl>}
                    {!profileLoading && profileError && !editingProfile && <p className="dashboard-status dashboard-error" role="alert">{profileError}</p>}
                </section>

                {profile && !editingProfile && <section className="dashboard-categories-section" aria-labelledby="categories-heading">
                    <div className="dashboard-section-heading">
                        <div>
                            <p className="dashboard-eyebrow">YOUR COLLECTION</p>
                            <h2 id="categories-heading">Categories</h2>
                        </div>
                    </div>
                    <div className="category-grid" aria-live="polite">
                        {categoryCounts === null && !categoryError && <p className="dashboard-status">Loading your places...</p>}
                        {categoryError && <p className="dashboard-status dashboard-error" role="alert">{categoryError}</p>}
                        {categoryCounts && Object.entries(categoryCounts).map(([category, count], index) => {
                            const config = categoryConfig[category] || fallbackConfig;
                            const label = categoryConfig[category]?.label || category.replaceAll('_', ' ');
                            return (
                                <div
                                    className={`category-count-tile${count === 0 ? ' is-empty' : ''}`}
                                    key={category}
                                    style={{ '--accent': config.accent, '--delay': `${index * 45}ms` }}
                                >
                                    <span className="category-pin" aria-hidden="true">
                                        <span className="category-pin-icon">{config.icon}</span>
                                    </span>
                                    <span className="category-name">{label}</span>
                                    <span className="category-count">{count}</span>
                                    <span className="category-count-caption">
                                        {count === 1 ? 'saved place' : 'saved places'}
                                    </span>
                                    <div className="category-actions">
                                        <button
                                            type="button"
                                            className="category-action category-pin-action"
                                            onClick={() => navigate(`/location-dashboard?category=${encodeURIComponent(category)}`)}
                                        >
                                            <span aria-hidden="true">＋</span> Pin location
                                        </button>
                                        <button
                                            type="button"
                                            className="category-action category-view-action"
                                            onClick={() => navigate(`/all-locations?category=${encodeURIComponent(category)}`)}
                                        >
                                            View all places <span aria-hidden="true">→</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>}
            </main>
        </div>
    );
}