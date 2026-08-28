import { useEffect, useRef, useState } from 'react'
import './App.css'
import { supabase } from './supabaseClient'

const defaultFriends = ['Lukas', 'Max', 'Jonas', 'Philipp', 'Tobi']

function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState('home')
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession()

      if (!mounted) return

      setSession(data.session)
      setLoading(false)
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session?.user) {
      setProfile(null)
      return
    }

    loadProfile(session.user.id)
  }, [session])

  const loadProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      setProfile(null)
      return
    }

    setProfile(data)
  }

  const saveProfile = async (newProfile) => {
    if (!session?.user) return

    const profileData = {
      id: session.user.id,
      name: newProfile.name,
      image: newProfile.image || null,
      points: newProfile.points ?? 0,
      level: newProfile.level ?? 1,
      rank: newProfile.rank ?? 'Rookie',
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData)
      .select()
      .single()

    if (error) {
      alert('Profil konnte nicht gespeichert werden: ' + error.message)
      return
    }

    setProfile(data)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setActivePage('home')
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">
          <span>⌁</span> MTB
        </div>
        <p>Wird geladen...</p>
      </div>
    )
  }

  if (!session) {
    return <AuthPage />
  }

  if (!profile) {
    return <ProfileSetup onComplete={saveProfile} />
  }

  return (
    <div className="app">

      {/* HEADER */}
      <header className="topbar">

        <button
          className="brand"
          onClick={() => setActivePage('home')}
        >
          <span className="brand-symbol">⌁</span>
          <span>MTB</span>
        </button>

        <div className="header-actions">

          <button className="header-icon">
            ♧
          </button>

          <button
            className="profile-button"
            onClick={() => setShowProfile(true)}
          >
            {profile.image ? (
              <img src={profile.image} alt="Profil" />
            ) : (
              '👤'
            )}
          </button>

        </div>

      </header>

      {/* HAUPTINHALT */}
      <main className="content">

        {activePage === 'home' && (
          <HomePage
            profile={profile}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'tours' && (
          <ToursPage />
        )}

        {activePage === 'stats' && (
          <StatsPage />
        )}

        {activePage === 'friends' && (
          <FriendsPage />
        )}

        {activePage === 'rank' && (
          <RankPage />
        )}

        {activePage === 'map' && (
          <MapPage />
        )}

      </main>

      {/* NAVIGATION */}
      <Navigation
        activePage={activePage}
        setActivePage={setActivePage}
      />

      {/* PROFIL */}
      {showProfile && (
        <ProfileModal
          profile={profile}
          onSave={(newProfile) => {
            saveProfile(newProfile)
            setShowProfile(false)
          }}
          onClose={() => setShowProfile(false)}
          onLogout={logout}
        />
      )}

    </div>
  )
}


/* =====================================================
   LOGIN / REGISTRIERUNG
===================================================== */

function AuthPage() {

  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (event) => {

    event.preventDefault()

    setMessage('')
    setLoading(true)

    if (!email.trim() || !password) {
      setMessage('Bitte E-Mail und Passwort eingeben.')
      setLoading(false)
      return
    }

    if (mode === 'register') {

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })

      if (error) {
        setMessage(error.message)
      } else {
        setMessage(
          'Account erstellt! Falls E-Mail-Bestätigung aktiviert ist, prüfe jetzt deine E-Mails.'
        )
      }

    } else {

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setMessage('Login fehlgeschlagen: ' + error.message)
      }

    }

    setLoading(false)
  }

  return (
    <div className="auth-screen">

      <div className="auth-card">

        <div className="setup-logo">
          <span>⌁</span>
          MTB
        </div>

        <div className="auth-badge">
          🚵
        </div>

        <h1>
          {mode === 'login'
            ? 'Willkommen zurück!'
            : 'Dein MTB-Account'}
        </h1>

        <p className="setup-description">
          {mode === 'login'
            ? 'Melde dich an und starte dein nächstes Abenteuer.'
            : 'Erstelle deinen kostenlosen Account.'}
        </p>

        <form onSubmit={handleSubmit}>

          <label className="input-label">
            E-MAIL
          </label>

          <input
            className="name-input"
            type="email"
            placeholder="deine@email.de"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />

          <label className="input-label auth-password-label">
            PASSWORT
          </label>

          <input
            className="name-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={
              mode === 'login'
                ? 'current-password'
                : 'new-password'
            }
          />

          {message && (
            <div className="auth-message">
              {message}
            </div>
          )}

          <button
            className="create-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'BITTE WARTEN...'
              : mode === 'login'
                ? 'EINLOGGEN'
                : 'ACCOUNT ERSTELLEN'}

            {!loading && <span>→</span>}
          </button>

        </form>

        <button
          className="auth-switch"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setMessage('')
          }}
        >
          {mode === 'login'
            ? 'Noch keinen Account? Registrieren'
            : 'Du hast bereits einen Account? Einloggen'}
        </button>

      </div>

    </div>
  )
}


/* =====================================================
   PROFIL BEIM ERSTEN START
===================================================== */

function ProfileSetup({ onComplete }) {

  const [name, setName] = useState('')
  const [image, setImage] = useState(null)

  const fileInput = useRef(null)

  const chooseImage = (event) => {

    const file = event.target.files?.[0]

    if (!file) return

    const reader = new FileReader()

    reader.onload = () => {
      setImage(reader.result)
    }

    reader.readAsDataURL(file)
  }

  const createProfile = () => {

    if (!name.trim()) return

    onComplete({
      name: name.trim(),
      image,
      points: 0,
      level: 1,
      rank: 'Rookie',
    })
  }

  return (
    <div className="setup-screen">

      <div className="setup-card">

        <div className="setup-logo">
          <span>⌁</span>
          MTB
        </div>

        <div className="setup-icon">

          {image ? (
            <img src={image} alt="Profilbild Vorschau" />
          ) : (
            '👤'
          )}

        </div>

        <h1>Willkommen! 👋</h1>

        <p className="setup-description">
          Erstelle dein MTB-Profil und starte dein nächstes Abenteuer.
        </p>

        <label className="input-label">
          DEIN NAME
        </label>

        <input
          className="name-input"
          type="text"
          placeholder="z. B. Sebastian"
          value={name}
          maxLength={25}
          onChange={(event) => setName(event.target.value)}
        />

        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="hidden-input"
          onChange={chooseImage}
        />

        <button
          className="image-button"
          onClick={() => fileInput.current?.click()}
        >
          🖼️ &nbsp;
          {image
            ? 'Profilbild ändern'
            : 'Profilbild auswählen'}
        </button>

        <button
          className="create-button"
          disabled={!name.trim()}
          onClick={createProfile}
        >
          PROFIL ERSTELLEN
          <span>→</span>
        </button>

        <p className="privacy-note">
          Dein Profil wird mit deinem Account gespeichert.
        </p>

      </div>

    </div>
  )
}


/* =====================================================
   HOME
===================================================== */

function HomePage({ profile, setActivePage }) {

  return (
    <>

      <section className="welcome">

        <p className="eyebrow">
          MTB APP
        </p>

        <h1>
          Hallo {profile.name}! 👋
        </h1>

        <p>
          Bereit für dein nächstes Abenteuer?
        </p>

      </section>


      <section className="rank-card">

        <div className="rank-content">

          <span className="small-title">
            DEIN RANG
          </span>

          <h2>
            {profile.rank}
          </h2>

          <div className="rank-level">
            Level {profile.level}
          </div>

          <strong>
            {Number(profile.points || 0).toLocaleString('de-DE')}
            {' '}Punkte
          </strong>

        </div>

        <div className="rank-badge">
          🏆
        </div>

        <div className="progress">
          <div className="progress-bar"></div>
        </div>

        <div className="progress-text">

          <span>
            Nächstes Level: Elite Rider
          </span>

          <span>
            3.000 Punkte
          </span>

        </div>

      </section>


      <section className="section">

        <div className="section-heading">

          <h2>
            Letzte Tour
          </h2>

          <span>
            Heute
          </span>

        </div>

        <div className="tour-card">

          <div className="tour-image">

            <div className="mountain">
              ⛰️
            </div>

            <span className="trail-dot"></span>

          </div>

          <div className="tour-info">

            <div className="tour-title">

              <span className="green-dot"></span>

              Greenhill Line

            </div>

            <span className="difficulty">
              Schwer · Downhill
            </span>

            <div className="tour-stats">

              <Stat
                number="12,4"
                unit="km"
                label="Distanz"
              />

              <Stat
                number="642"
                unit="hm"
                label="Höhenmeter"
              />

              <Stat
                number="48:32"
                label="Dauer"
              />

              <Stat
                number="18,7"
                unit="km/h"
                label="Ø Geschwindigkeit"
              />

            </div>

          </div>

        </div>

      </section>


      <section className="section">

        <div className="section-heading">

          <h2>
            Alle Freunde
          </h2>

          <button
            onClick={() => setActivePage('friends')}
          >
            Alle anzeigen →
          </button>

        </div>

        <div className="friends-row">

          {defaultFriends.map((friend) => (

            <div className="friend" key={friend}>

              <div className="avatar">
                👤
              </div>

              <span>
                {friend}
              </span>

            </div>

          ))}

        </div>

      </section>


      <button
        className="start-button"
        onClick={() => setActivePage('map')}
      >
        ▶ &nbsp; TOUR STARTEN
      </button>

    </>
  )
}


/* =====================================================
   STAT
===================================================== */

function Stat({ number, unit, label }) {

  return (

    <div>

      <strong>
        {number}
      </strong>

      {unit && (
        <span>
          {unit}
        </span>
      )}

      <small>
        {label}
      </small>

    </div>
  )
}


/* =====================================================
   TOUREN
===================================================== */

function ToursPage() {

  return (

    <Page
      title="Meine Touren"
      eyebrow="TOUREN"
    >

      <div className="tour-list">

        <div className="saved-tour">

          <div className="saved-tour-image">
            ⛰️
          </div>

          <div>

            <span className="difficulty">
              Schwer
            </span>

            <h3>
              Greenhill Line
            </h3>

            <p>
              12,4 km · 642 hm · 48:32
            </p>

            <span className="tour-date">
              Heute
            </span>

          </div>

        </div>


        <div className="saved-tour">

          <div className="saved-tour-image">
            🌲
          </div>

          <div>

            <span className="difficulty blue">
              Mittel
            </span>

            <h3>
              Alpen Trail
            </h3>

            <p>
              18,7 km · 820 hm · 1:12:34
            </p>

            <span className="tour-date">
              Gestern
            </span>

          </div>

        </div>

      </div>

    </Page>
  )
}


/* =====================================================
   STATISTIKEN
===================================================== */

function StatsPage() {

  return (

    <Page
      title="Statistiken"
      eyebrow="DEINE LEISTUNG"
    >

      <div className="stats-grid">

        <InfoCard
          number="78,4"
          unit="km"
          label="Diese Woche"
        />

        <InfoCard
          number="3.860"
          unit="hm"
          label="Höhenmeter"
        />

        <InfoCard
          number="5"
          label="Touren"
        />

        <InfoCard
          number="48,3"
          unit="km/h"
          label="Höchstgeschwindigkeit"
        />

      </div>

      <div className="chart-card">

        <h2>
          Höhenmeter
        </h2>

        <div className="fake-chart">

          <div style={{ height: '35%' }}></div>
          <div style={{ height: '60%' }}></div>
          <div style={{ height: '45%' }}></div>
          <div style={{ height: '80%' }}></div>
          <div style={{ height: '65%' }}></div>
          <div style={{ height: '90%' }}></div>
          <div style={{ height: '55%' }}></div>

        </div>

        <div className="chart-days">

          <span>MO</span>
          <span>DI</span>
          <span>MI</span>
          <span>DO</span>
          <span>FR</span>
          <span>SA</span>
          <span>SO</span>

        </div>

      </div>

    </Page>
  )
}


/* =====================================================
   FREUNDE
===================================================== */

function FriendsPage() {

  return (

    <Page
      title="Freunde"
      eyebrow="DEINE COMMUNITY"
    >

      <div className="friend-list">

        {defaultFriends.map((friend, index) => (

          <div
            className="friend-card"
            key={friend}
          >

            <div className="large-avatar">
              👤
            </div>

            <div className="friend-details">

              <strong>
                {friend}
              </strong>

              <span>

                {index === 0
                  ? 'Heute eine Tour gemacht'
                  : 'Pro Rider · Level ' + (15 + index)}

              </span>

            </div>

            <span className="online-dot"></span>

          </div>

        ))}

      </div>

    </Page>
  )
}


/* =====================================================
   RANG
===================================================== */

function RankPage() {

  return (

    <Page
      title="Rang"
      eyebrow="DEIN FORTSCHRITT"
    >

      <div className="rank-big-card">

        <div className="rank-big-icon">
          🏆
        </div>

        <span className="small-title">
          AKTUELLER RANG
        </span>

        <h2>
          Pro Rider
        </h2>

        <strong>
          2.450 Punkte
        </strong>

        <div className="rank-explanation">

          Je schwieriger deine gefahrene Strecke,
          desto mehr Punkte erhältst du.

        </div>

      </div>


      <div className="rank-levels">

        <div>

          <span>01</span>

          <strong>
            Rookie
          </strong>

          <small>
            0 Punkte
          </small>

        </div>


        <div>

          <span>02</span>

          <strong>
            Trail Rider
          </strong>

          <small>
            500 Punkte
          </small>

        </div>


        <div className="current">

          <span>03</span>

          <strong>
            Pro Rider
          </strong>

          <small>
            2.000 Punkte
          </small>

        </div>


        <div>

          <span>04</span>

          <strong>
            Elite Rider
          </strong>

          <small>
            3.000 Punkte
          </small>

        </div>

      </div>

    </Page>
  )
}


/* =====================================================
   KARTE
===================================================== */

function MapPage() {

  return (

    <Page
      title="Karte & Trails"
      eyebrow="ENTDECKEN"
    >

      <div className="map-placeholder">

        <div className="map-grid"></div>

        <div className="map-marker">
          📍
        </div>

        <div className="map-trail"></div>

        <div className="map-message">

          <strong>
            MTB-Karte
          </strong>

          <span>
            Die echte Karte kommt als nächstes.
          </span>

        </div>

      </div>

    </Page>
  )
}


/* =====================================================
   INFO CARD
===================================================== */

function InfoCard({ number, unit, label }) {

  return (

    <div className="info-card">

      <strong>
        {number}
      </strong>

      {unit && (
        <span>
          {unit}
        </span>
      )}

      <small>
        {label}
      </small>

    </div>
  )
}


/* =====================================================
   PAGE
===================================================== */

function Page({ title, eyebrow, children }) {

  return (

    <section className="page">

      <p className="eyebrow">
        {eyebrow}
      </p>

      <h1>
        {title}
      </h1>

      {children}

    </section>
  )
}


/* =====================================================
   NAVIGATION
===================================================== */

function Navigation({
  activePage,
  setActivePage
}) {

  const items = [

    {
      id: 'map',
      icon: '⌖',
      label: 'Karte'
    },

    {
      id: 'tours',
      icon: '▣',
      label: 'Touren'
    },

    {
      id: 'home',
      icon: '⌂',
      label: 'Home'
    },

    {
      id: 'friends',
      icon: '♧',
      label: 'Freunde'
    },

    {
      id: 'rank',
      icon: '♜',
      label: 'Rang'
    }

  ]

  return (

    <nav className="bottom-nav">

      {items.map((item) => (

        <button
          key={item.id}
          className={`nav-button ${
            activePage === item.id
              ? 'active'
              : ''
          }`}
          onClick={() => setActivePage(item.id)}
        >

          <span className="nav-icon">
            {item.icon}
          </span>

          <span>
            {item.label}
          </span>

        </button>

      ))}

    </nav>
  )
}


/* =====================================================
   PROFIL BEARBEITEN
===================================================== */

function ProfileModal({
  profile,
  onSave,
  onClose,
  onLogout
}) {

  const [name, setName] = useState(profile.name)
  const [image, setImage] = useState(profile.image)

  const fileInput = useRef(null)

  const chooseImage = (event) => {

    const file = event.target.files?.[0]

    if (!file) return

    const reader = new FileReader()

    reader.onload = () => {
      setImage(reader.result)
    }

    reader.readAsDataURL(file)
  }

  return (

    <div className="modal-background">

      <div className="profile-modal">

        <button
          className="close-button"
          onClick={onClose}
        >
          ×
        </button>

        <h2>
          Dein Profil
        </h2>

        <div className="modal-avatar">

          {image ? (
            <img src={image} alt="Profil" />
          ) : (
            '👤'
          )}

        </div>

        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="hidden-input"
          onChange={chooseImage}
        />

        <button
          className="image-button"
          onClick={() => fileInput.current?.click()}
        >
          Profilbild ändern
        </button>

        <label className="input-label">
          NAME
        </label>

        <input
          className="name-input"
          value={name}
          maxLength={25}
          onChange={(event) => setName(event.target.value)}
        />

        <button
          className="create-button"
          disabled={!name.trim()}
          onClick={() =>
            onSave({
              ...profile,
              name: name.trim(),
              image
            })
          }
        >
          SPEICHERN
        </button>

        <button
          className="logout-button"
          onClick={onLogout}
        >
          AUSLOGGEN
        </button>

      </div>

    </div>
  )
}


export default App