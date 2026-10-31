import { useState } from 'react';

const emptyProfile = { name: '', email: '', phone: '', address: '' };

export default function ProfileForm({ initialProfile, onSave, onCancel, saving, error }) {
	const [profile, setProfile] = useState(() => initialProfile || emptyProfile);
	const handleChange = (event) => {
		const { name, value } = event.target;
		setProfile((currentProfile) => ({ ...currentProfile, [name]: value }));
	};

	return (
		<form className="profile-form" onSubmit={(event) => {
			event.preventDefault();
			onSave(profile);
		}}>
			<div className="profile-form-grid">
				<label>Full name<input name="name" value={profile.name} onChange={handleChange} autoComplete="name" required /></label>
				<label>Email<input name="email" type="email" value={profile.email} onChange={handleChange} autoComplete="email" required /></label>
				<label>Phone<input name="phone" type="tel" value={profile.phone} onChange={handleChange} autoComplete="tel" required /></label>
				<label className="profile-address-field">Address<textarea name="address" value={profile.address} onChange={handleChange} autoComplete="street-address" rows="3" required /></label>
			</div>
			{error && <p className="dashboard-status dashboard-error" role="alert">{error}</p>}
			<div className="profile-form-actions">
				{onCancel && <button className="profile-secondary-button" type="button" onClick={onCancel}>Cancel</button>}
				<button className="location-dashboard-button" type="submit" disabled={saving}>
					{saving ? 'Saving...' : 'Save profile'}
				</button>
			</div>
		</form>
	);
}
