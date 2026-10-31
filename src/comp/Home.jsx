import { useNavigate } from 'react-router-dom';
import logo from '../assets/PinSoul_logo.png';
import heroMapImage from '../assets/hero_map_preview.png';
import JourneyAnimation from './JourneyAnimation';
import '../css/Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="home-hero">
        <nav className="home-nav" aria-label="Main navigation">
          <a className="home-brand" href="#top" aria-label="PinSoul home">
            <img src={logo} alt="PinSoul" />
          </a>
          <button className="nav-admin-button btn" onClick={() => navigate('/admin-signin')}>
            Admin access
          </button>
        </nav>

        <div className="hero-grid" id="top">
          <div className="hero-left">
            <div className="eyebrow-badge">
              <span className="sky-blue-pulse-dot" aria-hidden="true"></span>
              <span className="eyebrow-text">Your places. Your story.</span>
            </div>
            <h1>Keep the places that matter close.</h1>
            <p className="hero-copy">
              PinSoul is your personal map for collecting favorite cafes, hidden parks,
              memorable trips, and every place you want to find again.
            </p>
            <div className="home-buttons">
              <button className="btn btn-signup" onClick={() => navigate('/signup')}>
                Start pinning <span aria-hidden="true"></span>
              </button>
              <button className="btn btn-signin" onClick={() => navigate('/signin')}>
                Sign in
              </button>
            </div>
            <a className="scroll-cue" href="#how-it-works">Scroll to explore <span aria-hidden="true">↓</span></a>
          </div>

          <div className="hero-right">
            <div className="hero-visual-card">
              <img src={heroMapImage} alt="PinSoul Interactive Map Preview" />
              <div className="card-badge">
                <span className="sky-blue-pulse-dot" aria-hidden="true"></span>
                <span>Live Location Map</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="home-main">
        <section className="intro-section" id="how-it-works">
          <div>
            <p className="eyebrow">A map with meaning</p>
            <h2>Turn everyday places into a collection worth revisiting.</h2>
          </div>
          <p className="section-copy">
            The best places are rarely just coordinates. They are the coffee before a long
            day, the viewpoint from a perfect afternoon, or the restaurant you promised to
            return to. PinSoul gives those memories a home.
          </p>
        </section>

        <section className="home-features" aria-label="PinSoul features">
          <article className="feature">
            <div className="feature-icon" aria-hidden="true">📌</div>
            <h3>Pin any place</h3>
            <p>Save a location as you discover it, from a spontaneous stop to a carefully planned destination.</p>
          </article>
          <article className="feature feature-highlight">
            <div className="feature-icon" aria-hidden="true">🗂️</div>
            <h3>Make it yours</h3>
            <p>Organize your map with useful categories so your next cafe, park, hotel, or viewpoint is easy to find.</p>
          </article>
          <article className="feature">
            <div className="feature-icon" aria-hidden="true">🗺️</div>
            <h3>See the bigger picture</h3>
            <p>Explore your saved places together on an interactive map and rediscover the story of where you have been.</p>
          </article>
        </section>

        <section className="journey-section">
          <div className="journey-visual-wrapper">
            <JourneyAnimation />
          </div>
          <div className="journey-text">
            <p className="eyebrow">Made for remembering</p>
            <h2>One pin can bring the whole day back.</h2>
            <p className="section-copy">
              Build a private, visual record of the places you love. Come back when you are
              planning your next adventure or simply wondering where you have already been.
            </p>
          </div>
        </section>

        <section className="home-cta">
          <p className="eyebrow">Ready when you are</p>
          <h2>Start your map today.</h2>
          <button className="btn btn-signup" onClick={() => navigate('/signup')}>
            Create your account <span aria-hidden="true">↗</span>
          </button>
        </section>
      </main>

      <footer className="home-footer">
        <span>PinSoul</span>
        <span>Save the places that shape your life.</span>
      </footer>
    </div>
  );
}

