import { useEffect, useRef, useState } from 'react'
import './App.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  Map,
  NavigationControl,
  Marker,
  LngLatBounds,
  setWorkerUrl,
} from 'maplibre-gl'
import RecordingPage from "./RecordingPage";
import maplibreWorker from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
setWorkerUrl(maplibreWorker)

import { supabase } from './supabaseClient'

/* =====================================================
   GRAVITY CARD 2026
   32 BIKE-DESTINATIONEN
===================================================== */

const GRAVITY_CARD_PARKS = [
  {
    id: 1,
    name: 'Epic Bikepark Leogang',
    country: 'Österreich',
    lat: 47.4387,
    lon: 12.7278,
    website: 'https://www.bikepark-leogang.com/',
    trails: [
      'Speedster',
      'Hangman II',
      'Asitz Trail',
      'Antonius Trail',
      'Knappentrail',
    ],
  },
  {
    id: 2,
    name: 'Saalbach Hinterglemm',
    country: 'Österreich',
    lat: 47.3904,
    lon: 12.6367,
    website: 'https://www.saalbach.com/',
    trails: [
      'Hacklberg Trail',
      'X-Line',
      'Bergstadl Trail',
      'Pro Line',
      'Monti Trail',
    ],
  },
  {
    id: 3,
    name: 'Bikepark Serfaus-Fiss-Ladis',
    country: 'Österreich',
    lat: 47.0557,
    lon: 10.6038,
    website: 'https://www.serfaus-fiss-ladis.at/',
    trails: [
      'Hill Bill',
      'Frommestrail',
      'Almbahn Trail',
      'Supernatural',
      'Strada del Sole',
    ],
  },
  {
    id: 4,
    name: 'Bikeland Schladming-Dachstein',
    country: 'Österreich',
    lat: 47.3928,
    lon: 13.6869,
    website: 'https://www.schladming-dachstein.at/',
    trails: [
      'World Cup Downhill',
      '99 Jumpline',
      'Flowline',
      'Jackpot',
      'Peak Flow Trail',
    ],
  },
  {
    id: 5,
    name: 'Bike Kingdom Park Lenzerheide',
    country: 'Schweiz',
    lat: 46.7271,
    lon: 9.5578,
    website: 'https://www.bike-kingdom.ch/',
    trails: [
      'STRAIGHTline',
      'PRIMEline',
      'FREERIDEline',
      'MOTTAline',
      'Älplersektor',
    ],
  },
  {
    id: 6,
    name: 'Bikepark Brandnertal',
    country: 'Österreich',
    lat: 47.1375,
    lon: 9.7297,
    website: 'https://www.brandnertal.at/',
    trails: [
      'Tschack Norris',
      'Furkajoch',
      'Stone Run',
      'Burtscha',
      'Flow Trail',
    ],
  },
  {
    id: 7,
    name: 'Bike Republic Sölden',
    country: 'Österreich',
    lat: 46.9697,
    lon: 11.0076,
    website: 'https://bike-republic.com/',
    trails: [
      'Tiefenbach Trail',
      'Teäre Line',
      'Zaahe Line',
      'Broate Line',
      'Ollweite Line',
    ],
  },
  {
    id: 8,
    name: '3 Länder Enduro Trails',
    country: 'Österreich / Italien / Schweiz',
    lat: 46.8925,
    lon: 10.5038,
    website: 'https://www.nauders.com/',
    trails: [
      'Almtrail',
      'Elven Trail',
      'Riatsch Trail',
      'Bunker Trail',
      'Piz Trail',
    ],
  },
  {
    id: 9,
    name: 'Bad Kleinkirchheimer Flow Country Trail',
    country: 'Österreich',
    lat: 46.8144,
    lon: 13.7867,
    website: 'https://www.badkleinkirchheim.com/',
    trails: [
      'Flow Country Trail',
    ],
  },
  {
    id: 10,
    name: 'Biketrails FLIMS LAAX',
    country: 'Schweiz',
    lat: 46.8217,
    lon: 9.2650,
    website: 'https://www.flimslaax.com/',
    trails: [
      'Never End',
      'Runca Trail',
      'Nagens Trail',
      'Crap Sogn Gion',
    ],
  },
  {
    id: 11,
    name: 'Bikepark Innsbruck',
    country: 'Österreich',
    lat: 47.2067,
    lon: 11.3594,
    website: 'https://www.bikepark-innsbruck.com/',
    trails: [
      'DH Trail',
      'Arzler Alm Trail',
      'Tschugga',
      'Nordkette Singletrail',
    ],
  },
  {
    id: 12,
    name: 'The Mother – Bikepark Winterberg',
    country: 'Deutschland',
    lat: 51.1872,
    lon: 8.5224,
    website: 'https://www.bikepark-winterberg.de/',
    trails: [
      'Downhill',
      'RockShox Trail',
      'Flow Country',
      'Northshore',
      'Continental Track',
    ],
  },
  {
    id: 13,
    name: 'MTB Zone Bikepark Geisskopf',
    country: 'Deutschland',
    lat: 48.9167,
    lon: 13.0000,
    website: 'https://www.mtbzone-bikepark.com/',
    trails: [
      'Freeride',
      'Downhill',
      'Flow Country',
      'Enduro',
      'Jump Line',
    ],
  },
  {
    id: 14,
    name: 'Bikepark Spicak',
    country: 'Tschechien',
    lat: 49.1664,
    lon: 13.2175,
    website: 'https://www.spicak.cz/',
    trails: [
      'Downhill',
      'Air Stone',
      'Forest',
      'Struggle',
      'Black Sheep',
    ],
  },
  {
    id: 15,
    name: 'Bikepark Semmering',
    country: 'Österreich',
    lat: 47.6310,
    lon: 15.8275,
    website: 'https://www.bikepark-semmering.com/',
    trails: [
      'Downhill',
      'Family Trail',
      'Flow Trail',
      'Freeride',
      'Long Trail',
    ],
  },
  {
    id: 16,
    name: 'MTB Zone Bikepark Willingen',
    country: 'Deutschland',
    lat: 51.2922,
    lon: 8.6090,
    website: 'https://www.mtbzone-bikepark.com/',
    trails: [
      'World Cup Downhill',
      'Flow Country',
      'Freeride',
      'Freeride 2',
      'Enduro',
    ],
  },
  {
    id: 17,
    name: 'MTB Zone Bikepark Petzen',
    country: 'Österreich',
    lat: 46.5568,
    lon: 14.7608,
    website: 'https://www.mtbzone-bikepark.com/',
    trails: [
      'Flow Country Trail',
      'Enduro',
      'Family Trail',
      'E-Bike Trail',
    ],
  },
  {
    id: 18,
    name: 'Bike Park Pohorje Maribor',
    country: 'Slowenien',
    lat: 46.5158,
    lon: 15.5760,
    website: 'https://www.visitpohorje.si/',
    trails: [
      'World Cup Downhill',
      'Flow Trail',
      'Bike Park Line',
      'Rock\'n\'Flow',
    ],
  },
  {
    id: 19,
    name: '360° Flow Trails Kitzbühel Kirchberg',
    country: 'Österreich',
    lat: 47.4442,
    lon: 12.3145,
    website: 'https://www.kitzbuehel.com/',
    trails: [
      'Fleckalm Trail',
      'Lisi Osl Trail',
      'Gaisberg Trail',
      'Hahnenkamm Trail',
    ],
  },
  {
    id: 20,
    name: 'Bikepark Lienz',
    country: 'Österreich',
    lat: 46.8182,
    lon: 12.7647,
    website: 'https://www.lienzer-bergbahnen.at/',
    trails: [
      'Peter Sagan Trail',
      'Tschitschi Trail',
      'Alban Lakata Trail',
      'Hochstein Trail',
    ],
  },
  {
    id: 21,
    name: 'Paganella Bike Park',
    country: 'Italien',
    lat: 46.1427,
    lon: 11.0378,
    website: 'https://www.paganellabikepark.com/',
    trails: [
      'Peter Pan',
      'Zava',
      'Guns N\' Roses',
      'Big Hero',
      'Hustle & Flow',
    ],
  },
  {
    id: 22,
    name: 'Szczyrk Bike Park by Trek',
    country: 'Polen',
    lat: 49.6804,
    lon: 18.9656,
    website: 'https://www.szczyrkowski.pl/',
    trails: [
      'Hip Hop',
      'Otik',
      'Bestia',
      'Gondola Trail',
    ],
  },
  {
    id: 23,
    name: 'Bikepark Kronplatz',
    country: 'Italien',
    lat: 46.7350,
    lon: 11.9560,
    website: 'https://www.kronplatz.com/',
    trails: [
      'Gassl Trail',
      'Herrensteig',
      'Furcia',
      'Pralongià',
      'Piz de Plaies',
    ],
  },
  {
    id: 24,
    name: 'Val di Sole Bikepark',
    country: 'Italien',
    lat: 46.3165,
    lon: 10.8270,
    website: 'https://www.valdisolebikeland.com/',
    trails: [
      'Black Snake',
      'World Cup',
      'Valley',
      'Hustle & Flow',
      'Casolèt',
    ],
  },
  {
    id: 25,
    name: 'Wexl Trails',
    country: 'Österreich',
    lat: 47.5855,
    lon: 16.0160,
    website: 'https://www.wexltrails.at/',
    trails: [
      'Flow Trail',
      'Evil Eye',
      'Black Magic',
      'Haute Route',
      'Höllenritt',
    ],
  },
  {
    id: 26,
    name: 'Bike Beats Alta Badia',
    country: 'Italien',
    lat: 46.5500,
    lon: 11.8730,
    website: 'https://www.altabadia.org/',
    trails: [
      'Bike Beats',
      'Gardenaccia',
      'Santa Croce',
      'La Crusc',
    ],
  },
  {
    id: 27,
    name: 'Silvretta Bike Arena Ischgl/Samnaun & Silva Trails Galtür',
    country: 'Österreich / Schweiz',
    lat: 46.9850,
    lon: 10.2910,
    website: 'https://www.ischgl.com/',
    trails: [
      'Idalp Trail',
      'Velill Trail',
      'Flimjoch Trail',
      'Salaaser Kopf',
      'Silva Trails',
    ],
  },
  {
    id: 28,
    name: 'Bikepark Lermoos-Biberwier',
    country: 'Österreich',
    lat: 47.3955,
    lon: 10.8845,
    website: 'https://www.langes.at/',
    trails: [
      'Forest One',
      'Forest Two',
      'Marienberg Trail',
      'Grubigstein Trail',
    ],
  },
  {
    id: 29,
    name: 'Mottolino Bikepark',
    country: 'Italien',
    lat: 46.5385,
    lon: 10.1365,
    website: 'https://www.mottolino.com/',
    trails: [
      'Flow Line',
      'Black Eye',
      'Tutti Frutti',
      'H-Drop',
      'Mottolino Downhill',
    ],
  },
  {
    id: 30,
    name: 'Trailarea Turracher Höhe',
    country: 'Österreich',
    lat: 46.9180,
    lon: 13.8680,
    website: 'https://www.turracherhoehe.at/',
    trails: [
      'Kornock Flow Trail',
      'Panorama Trail',
      'Alm Trail',
      'Turracher Trail',
    ],
  },
  {
    id: 31,
    name: 'Bike District Val di Fassa',
    country: 'Italien',
    lat: 46.4285,
    lon: 11.6950,
    website: 'https://www.fassa.com/',
    trails: [
      'Buffaure Trail',
      'Alloch',
      'Panoramica',
      'Ciampac',
    ],
  },
  {
    id: 32,
    name: 'Trail Park Klínovec',
    country: 'Tschechien',
    lat: 50.3960,
    lon: 12.9670,
    website: 'https://www.trailpark.cz/',
    trails: [
      'Azur',
      'Rubín',
      'Baron',
      'Velký Drak',
      'Hugo',
    ],
  },
]

/* =====================================================
   APP
===================================================== */

function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState('home')
  const [activeChat, setActiveChat] = useState(null)
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (!mounted) return

      if (error) {
        console.error('Fehler beim Laden der Session:', error)
        setSession(null)
      } else {
        setSession(data.session ?? null)
      }

      setLoading(false)
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return

      setSession(newSession ?? null)
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
      console.error('Fehler beim Laden des Profils:', error)
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
      alert(
        'Profil konnte nicht gespeichert werden: ' +
          error.message
      )
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
              <img
                src={profile.image}
                alt="Profil"
              />
            ) : (
              '👤'
            )}
          </button>
        </div>
      </header>

      <main className="content">

        {activePage === 'home' && (
          <HomePage
            profile={profile}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'tours' && (
        <ToursPage setActivePage={setActivePage} />
        )}

        {activePage === 'recording' && (
          <RecordingPage
            onFinish={() => setActivePage('tours')}
          />
        )}

        {activePage === 'stats' && (
          <StatsPage />
        )}

       {activePage === 'friends' && !activeChat && (
          <FriendsPage
            setActiveChat={setActiveChat}
          />
        )}

        {activeChat && (
          <ChatPage
            friend={activeChat}
            onBack={() => setActiveChat(null)}
          />
        )}

        {activePage === 'rank' && (
          <RankPage />
        )}

        {activePage === 'map' && (
          <MapPage />
        )}

      </main>

      <Navigation
        activePage={activePage}
        setActivePage={setActivePage}
      />

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

    if (!email.trim() || !password) {
      setMessage(
        'Bitte E-Mail und Passwort eingeben.'
      )
      return
    }

    setLoading(true)

    if (mode === 'register') {
      const { error } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
        })

      if (error) {
        setMessage(error.message)
      } else {
        setMessage(
          'Account erstellt! Falls E-Mail-Bestätigung aktiviert ist, prüfe deine E-Mails.'
        )
      }
    } else {
      const { error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

      if (error) {
        setMessage(
          'Login fehlgeschlagen: ' +
            error.message
        )
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
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />

          <label className="input-label auth-password-label">
            PASSWORT
          </label>

          <input
            className="name-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
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
            setMode(
              mode === 'login'
                ? 'register'
                : 'login'
            )
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
   PROFIL SETUP
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
            <img
              src={image}
              alt="Profilbild Vorschau"
            />
          ) : (
            '👤'
          )}
        </div>

        <h1>Willkommen! 👋</h1>

        <p className="setup-description">
          Erstelle dein MTB-Profil und starte
          dein nächstes Abenteuer.
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
          onChange={(event) =>
            setName(event.target.value)
          }
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
          onClick={() =>
            fileInput.current?.click()
          }
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

function HomePage({
  profile,
  setActivePage,
}) {
  return (
    <>
      <section className="welcome">
        <p className="eyebrow">MTB APP</p>

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

          <h2>{profile.rank}</h2>

          <div className="rank-level">
            Level {profile.level}
          </div>

          <strong>
            {Number(profile.points || 0)
              .toLocaleString('de-DE')}{' '}
            Punkte
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
          <h2>Letzte Tour</h2>
          <span>Heute</span>
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

<button
  className="start-button"
  onClick={() =>
    setActivePage('recording')
  }
>
  ▶ &nbsp; TOUR AUFZEICHNEN
</button>
    </>
  )
}

function Stat({
  number,
  unit,
  label,
}) {
  return (
    <div>
      <strong>{number}</strong>

      {unit && <span>{unit}</span>}

      <small>{label}</small>
    </div>
  )
}

/* =====================================================
   TOUREN
===================================================== */

function ToursPage({ setActivePage }) {
  const [tours, setTours] = useState([])
  const [selectedTour, setSelectedTour] = useState(null)

  useEffect(() => {
    loadTours()
  }, [])

  const loadTours = () => {
    const savedTours = JSON.parse(
      localStorage.getItem('mtb_tours') || '[]'
    )

    setTours(savedTours)
  }

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600)

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    )

    const seconds = totalSeconds % 60

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
    ].join(':')
  }

  const formatDate = (date) => {
    const tourDate = new Date(date)
    const today = new Date()

    if (
      tourDate.toDateString() ===
      today.toDateString()
    ) {
      return 'Heute'
    }

    const yesterday = new Date()
    yesterday.setDate(
      yesterday.getDate() - 1
    )

    if (
      tourDate.toDateString() ===
      yesterday.toDateString()
    ) {
      return 'Gestern'
    }

    return tourDate.toLocaleDateString(
      'de-DE'
    )
  }

  /* ---------------------------------------------
     TOUR-KARTE
  --------------------------------------------- */

  if (selectedTour) {
    return (
      <TourDetailPage
        tour={selectedTour}
        onBack={() => setSelectedTour(null)}
      />
    )
  }

  return (
    <Page
      title="Meine Touren"
      eyebrow="TOUREN"
    >

      {tours.length === 0 ? (

        <div className="empty-tours">

          <div>
            🚵
          </div>

          <h2>
            Noch keine Touren
          </h2>

          <p>
            Zeichne deine erste MTB-Tour
            auf und sie erscheint hier.
          </p>

          <button
            className="start-button"
            onClick={() =>
              setActivePage('recording')
            }
          >
            ▶ TOUR AUFZEICHNEN
          </button>

        </div>

      ) : (

        <div className="tour-list">

          {tours.map((tour) => (

            <button
              className="saved-tour"
              key={tour.id}
              onClick={() =>
                setSelectedTour(tour)
              }
              type="button"
            >

              <div className="saved-tour-image">
                🗺️
              </div>

              <div className="saved-tour-content">

                <span className="difficulty blue">
                  MTB TOUR
                </span>

                <h3>
                  {tour.name ||
                    'Meine MTB Tour'}
                </h3>

                <p>
                  {Number(
                    tour.distance || 0
                  ).toFixed(2)}
                  {' km · '}
                  {Math.round(
                    tour.elevation || 0
                  )}
                  {' hm · '}
                  {formatTime(
                    tour.duration || 0
                  )}
                </p>

                <span className="tour-date">
                  {formatDate(tour.date)}
                </span>

              </div>

              <span className="saved-tour-arrow">
                →
              </span>

            </button>

          ))}

        </div>

      )}

    </Page>
  )
}

/* =====================================================
   TOUR DETAIL
===================================================== */

function TourDetailPage({
  tour,
  onBack,
}) {
  const mapContainer = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!mapContainer.current) return

    const coordinates =
      tour.path ||
      tour.route ||
      tour.coordinates ||
      []

    if (
      !Array.isArray(coordinates) ||
      coordinates.length === 0
    ) {
      return
    }

    const map = new Map({
      container: mapContainer.current,

      style: {
        version: 8,

        sources: {
          osm: {
            type: 'raster',

            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],

            tileSize: 256,

            attribution:
              '© OpenStreetMap contributors',
          },
        },

        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
          },
        ],
      },

      center: coordinates[0],
      zoom: 13,

      attributionControl: true,
      dragRotate: false,
      touchZoomRotate: true,
    })

    mapRef.current = map

    map.on('load', () => {

      /* -----------------------------------------
         ROUTE-LINIE
      ----------------------------------------- */

      map.addSource('tour-route', {
        type: 'geojson',

        data: {
          type: 'Feature',

          geometry: {
            type: 'LineString',
            coordinates,
          },

          properties: {},
        },
      })

      map.addLayer({
        id: 'tour-route-line',

        type: 'line',

        source: 'tour-route',

        paint: {
          'line-width': 5,
          'line-opacity': 0.9,
        },
      })

      /* -----------------------------------------
         STARTPUNKT
      ----------------------------------------- */

      const startElement =
        document.createElement('div')

      startElement.className =
        'tour-start-marker'

      startElement.innerHTML = '▶'

      new Marker({
        element: startElement,
        anchor: 'center',
      })
        .setLngLat(coordinates[0])
        .addTo(map)

      /* -----------------------------------------
         ENDPUNKT
      ----------------------------------------- */

      const endElement =
        document.createElement('div')

      endElement.className =
        'tour-end-marker'

      endElement.innerHTML = '🏁'

      new Marker({
        element: endElement,
        anchor: 'bottom',
      })
        .setLngLat(
          coordinates[
            coordinates.length - 1
          ]
        )
        .addTo(map)

      /* -----------------------------------------
         KARTE AUF ROUTE ZOOMEN
      ----------------------------------------- */

      const bounds =
        coordinates.reduce(
          (bounds, coordinate) => {
            return bounds.extend(coordinate)
          },
          new LngLatBounds(
            coordinates[0],
            coordinates[0]
          )
        )

      map.fitBounds(bounds, {
        padding: 60,
        duration: 1000,
      })
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [tour])

  return (
    <section className="page tour-detail-page">

      <div className="tour-detail-header">

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Zurück
        </button>

        <div>
          <p className="eyebrow">
            AUFGEZEICHNETE TOUR
          </p>

          <h1>
            {tour.name ||
              'Meine MTB Tour'}
          </h1>
        </div>

      </div>

      <div className="tour-detail-map">

        <div
          ref={mapContainer}
          className="maplibre-container"
        />

        {(!tour.path &&
          !tour.route &&
          !tour.coordinates) && (

          <div className="tour-no-route">
            🗺️
            <strong>
              Keine GPS-Strecke gespeichert
            </strong>

            <span>
              Diese Tour enthält keine
              aufgezeichnete Route.
            </span>
          </div>

        )}

      </div>

      <div className="tour-detail-info">

        <div className="tour-detail-stat">
          <strong>
            {Number(
              tour.distance || 0
            ).toFixed(2)}
          </strong>

          <span>km</span>

          <small>Distanz</small>
        </div>

        <div className="tour-detail-stat">
          <strong>
            {Math.round(
              tour.elevation || 0
            )}
          </strong>

          <span>hm</span>

          <small>Höhenmeter</small>
        </div>

        <div className="tour-detail-stat">
          <strong>
            {formatTourDuration(
              tour.duration || 0
            )}
          </strong>

          <small>Dauer</small>
        </div>

      </div>

    </section>
  )
}


/* =====================================================
   TOUR ZEIT FORMATIEREN
===================================================== */

function formatTourDuration(totalSeconds) {
  const hours =
    Math.floor(totalSeconds / 3600)

  const minutes =
    Math.floor(
      (totalSeconds % 3600) / 60
    )

  const seconds =
    totalSeconds % 60

  if (hours > 0) {
    return (
      hours
        .toString()
        .padStart(2, '0') +
      ':' +
      minutes
        .toString()
        .padStart(2, '0') +
      ':' +
      seconds
        .toString()
        .padStart(2, '0')
    )
  }

  return (
    minutes
      .toString()
      .padStart(2, '0') +
    ':' +
    seconds
      .toString()
      .padStart(2, '0')
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
        <h2>Höhenmeter</h2>

        <div className="fake-chart">
          <div style={{ height: '35%' }} />
          <div style={{ height: '60%' }} />
          <div style={{ height: '45%' }} />
          <div style={{ height: '80%' }} />
          <div style={{ height: '65%' }} />
          <div style={{ height: '90%' }} />
          <div style={{ height: '55%' }} />
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

function InfoCard({
  number,
  unit,
  label,
}) {
  return (
    <div className="info-card">
      <strong>{number}</strong>

      {unit && <span>{unit}</span>}

      <small>{label}</small>
    </div>
  )
}
/* =====================================================
   💬 CHAT
===================================================== */

function ChatPage({ friend, onBack }) {
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    setCurrentUser(user)
  }

  getCurrentUser()
}, [])

  const loadMessages = async () => {
    if (!friend) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${friend.id}),and(sender_id.eq.${friend.id},receiver_id.eq.${user.id})`
      )
      .order('created_at', {
        ascending: true,
      })

    if (error) {
      console.error('Nachrichten laden:', error)
      setMessages([])
    } else {
      setMessages(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadMessages()

    const interval = setInterval(
      loadMessages,
      3000
    )

    return () => {
      clearInterval(interval)
    }
  }, [friend?.id])

  const sendMessage = async () => {
    const text = message.trim()

    if (!text || sending || !friend) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    setSending(true)

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: friend.id,
        content: text,
      })

    if (error) {
      console.error(
        'Nachricht senden:',
        error
      )

      alert(
        'Nachricht konnte nicht gesendet werden: ' +
          error.message
      )
    } else {
      setMessage('')
      await loadMessages()
    }

    setSending(false)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  return (
    <Page
      title={friend?.name || 'Chat'}
      eyebrow="DEIN CHAT"
    >
      <div className="chat-page">

        <div className="chat-header">
          <button
            className="chat-back-button"
            onClick={onBack}
          >
            ← Zurück
          </button>

          <div className="chat-user">
            <div className="large-avatar">
              {friend?.image ? (
                <img
                  src={friend.image}
                  alt=""
                />
              ) : (
                '👤'
              )}
            </div>

            <div>
              <strong>
                {friend?.name}
              </strong>

              <span>
                {friend?.rank || 'Rookie'} · Level{' '}
                {friend?.level || 1}
              </span>
            </div>
          </div>
        </div>

        <div className="chat-messages">
          {loading ? (
            <div className="chat-info">
              Nachrichten werden geladen...
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty">
              <span>💬</span>
              <strong>
                Noch keine Nachrichten
              </strong>
              <small>
                Schreib {friend?.name} eine Nachricht.
              </small>
            </div>
          ) : (
            messages.map((item) => (
              <div
                key={item.id}
                className={
                  item.sender_id ===
                  currentUser?.id
                    ? 'chat-message own'
                    : 'chat-message'
                }
              >
                <div className="chat-bubble">
                  {item.content}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="chat-input-area">
          <textarea
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Nachricht schreiben..."
            rows={1}
          />

          <button
            className="chat-send-button"
            onClick={sendMessage}
            disabled={
              sending || !message.trim()
            }
          >
            ➤
          </button>
        </div>

      </div>
    </Page>
  )
}
/* =====================================================
   FREUNDE
===================================================== */

function FriendsPage({ setActiveChat }) {
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    loadFriends()
  }, [])

  const loadFriends = async () => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data: friendships, error } =
      await supabase
        .from('friendships')
        .select('*')
        .or(
          `user_id.eq.${user.id},friend_id.eq.${user.id}`
        )
        .eq('status', 'accepted')

    if (error) {
      console.error('Freunde laden:', error)
      setFriends([])
    } else {
      const friendIds = (friendships || []).map(
        (friendship) =>
          friendship.user_id === user.id
            ? friendship.friend_id
            : friendship.user_id
      )

      if (friendIds.length > 0) {
        const { data: profiles } =
          await supabase
            .from('profiles')
            .select(
              'id, name, image, level, rank, last_seen'
            )
            .in('id', friendIds)

        setFriends(profiles || [])
      } else {
        setFriends([])
      }
    }

    const {
      data: incomingRequests,
      error: requestError,
    } = await supabase
      .from('friendships')
      .select('*')
      .eq('friend_id', user.id)
      .eq('status', 'pending')

    if (requestError) {
      console.error(
        'Anfragen laden:',
        requestError
      )
      setRequests([])
    } else {
      const requesterIds =
        (incomingRequests || []).map(
          (request) => request.user_id
        )

      if (requesterIds.length > 0) {
        const {
          data: requesterProfiles,
        } = await supabase
          .from('profiles')
          .select(
            'id, name, image, level, rank, last_seen'
          )
          .in('id', requesterIds)

        const combined =
          (incomingRequests || [])
            .map((request) => ({
              ...request,
              profile:
                requesterProfiles?.find(
                  (profile) =>
                    profile.id ===
                    request.user_id
                ),
            }))
            .filter(
              (request) => request.profile
            )

        setRequests(combined)
      } else {
        setRequests([])
      }
    }

    setLoading(false)
  }

  const searchUsers = async (value) => {
    setSearch(value)

    if (value.trim().length < 2) {
      setResults([])
      return
    }

    setSearching(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setSearching(false)
      return
    }

    const { data, error } =
      await supabase
        .from('profiles')
        .select(
          'id, name, image, level, rank, last_seen'
        )
        .ilike(
          'name',
          `%${value.trim()}%`
        )
        .neq('id', user.id)
        .limit(10)

    if (error) {
      console.error(
        'Benutzer suchen:',
        error
      )
      setResults([])
    } else {
      setResults(data || [])
    }

    setSearching(false)
  }

  const addFriend = async (friendId) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } =
      await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending',
        })

    if (error) {
      if (error.code === '23505') {
        alert(
          'Es gibt bereits eine Freundschaft oder Anfrage.'
        )
      } else {
        alert(
          'Anfrage konnte nicht gesendet werden: ' +
            error.message
        )
      }

      return
    }

    alert(
      'Freundschaftsanfrage gesendet! 📨'
    )

    setSearch('')
    setResults([])
  }

  const acceptRequest = async (request) => {
    const { error } =
      await supabase
        .from('friendships')
        .update({
          status: 'accepted',
        })
        .eq('id', request.id)

    if (error) {
      alert(
        'Anfrage konnte nicht angenommen werden: ' +
          error.message
      )
      return
    }

    await loadFriends()
  }

  const rejectRequest = async (request) => {
    const { error } =
      await supabase
        .from('friendships')
        .update({
          status: 'rejected',
        })
        .eq('id', request.id)

    if (error) {
      alert(
        'Anfrage konnte nicht abgelehnt werden: ' +
          error.message
      )
      return
    }

    await loadFriends()
  }

  const removeFriend = async (friendId) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const confirmed = window.confirm(
      'Möchtest du diesen Freund wirklich entfernen?'
    )

    if (!confirmed) return

    const { error } =
      await supabase
        .from('friendships')
        .delete()
        .or(
          `and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`
        )

    if (error) {
      console.error(
        'Freund entfernen:',
        error
      )

      alert(
        'Freund konnte nicht entfernt werden: ' +
          error.message
      )

      return
    }

    await loadFriends()
  }

  return (
    <Page
      title="Freunde"
      eyebrow="DEINE COMMUNITY"
    >
      <div className="friends-add-box">
        <h2>Freund hinzufügen</h2>

        <p>
          Suche nach dem Namen deines Freundes.
        </p>

        <div className="friend-search">
          <span>🔎</span>

          <input
            type="text"
            placeholder="Namen suchen..."
            value={search}
            onChange={(event) =>
              searchUsers(event.target.value)
            }
          />
        </div>

        {searching && (
          <div className="friend-search-info">
            Suche...
          </div>
        )}

        {results.length > 0 && (
          <div className="friend-search-results">
            {results.map((person) => (
              <div
                className="friend-result"
                key={person.id}
              >
                <div className="large-avatar">
                  {person.image ? (
                    <img
                      src={person.image}
                      alt=""
                    />
                  ) : (
                    '👤'
                  )}
                </div>

                <div className="friend-details">
                  <strong>{person.name}</strong>

                  <span>
                    {person.rank || 'Rookie'} · Level{' '}
                    {person.level || 1}
                  </span>
                </div>

                <button
                  className="add-friend-button"
                  onClick={() =>
                    addFriend(person.id)
                  }
                >
                  + Anfrage
                </button>
              </div>
            ))}
          </div>
        )}

        {search.length >= 2 &&
          !searching &&
          results.length === 0 && (
            <div className="friend-search-info">
              Kein Benutzer gefunden.
            </div>
          )}
      </div>

      {requests.length > 0 && (
        <div className="friends-section">
          <div className="section-heading">
            <h2>Freundschaftsanfragen</h2>

            <span>{requests.length}</span>
          </div>

          <div className="friend-requests">
            {requests.map((request) => (
              <div
                className="friend-request"
                key={request.id}
              >
                <div className="large-avatar">
                  {request.profile.image ? (
                    <img
                      src={request.profile.image}
                      alt=""
                    />
                  ) : (
                    '👤'
                  )}
                </div>

                <div className="friend-details">
                  <strong>
                    {request.profile.name}
                  </strong>

                  <span>
                    möchte dein Freund werden
                  </span>
                </div>

                <div className="request-buttons">
                  <button
                    className="accept-button"
                    onClick={() =>
                      acceptRequest(request)
                    }
                  >
                    ✓
                  </button>

                  <button
                    className="reject-button"
                    onClick={() =>
                      rejectRequest(request)
                    }
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="friends-section">
        <div className="section-heading">
          <h2>Meine Freunde</h2>

          <span>{friends.length}</span>
        </div>

        {loading ? (
          <div className="friend-search-info">
            Freunde werden geladen...
          </div>
        ) : friends.length === 0 ? (
          <div className="empty-friends">
            <span>👥</span>

            <strong>
              Noch keine Freunde
            </strong>

            <small>
              Suche oben nach einem Freund
              und sende eine Anfrage.
            </small>
          </div>
        ) : (
          <div className="friend-list">
            {friends.map((person) => (
              <div
                className="friend-card"
                key={person.id}
              >
                <div className="large-avatar">
                  {person.image ? (
                    <img
                      src={person.image}
                      alt=""
                    />
                  ) : (
                    '👤'
                  )}
                </div>

                <div className="friend-details">
                  <strong>
                    {person.name}
                  </strong>

                  <span>
                    {person.rank || 'Rookie'} · Level{' '}
                    {person.level || 1}
                  </span>
                </div>

                <button
                  className="chat-button"
                  onClick={() =>
                    setActiveChat(person)
                  }
                  title="Chat öffnen"
                >
                  💬 Chat
                </button>

                <button
                  className="remove-friend-button"
                  onClick={() =>
                    removeFriend(person.id)
                  }
                  title="Freund entfernen"
                >
                  Entfernen
                </button>

                <span
                  className={
                    person.last_seen &&
                    Date.now() -
                      new Date(
                        person.last_seen
                      ).getTime() <
                      2 * 60 * 1000
                      ? 'online-dot online'
                      : 'online-dot offline'
                  }
                ></span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Page>
  )
}

/* =====================================================
   RANG
===================================================== */

function RankPage() {
  const ranks = [
    {
      level: 1,
      name: 'Trail Rider',
      points: 0,
      icon: '/ranks/trail-rider.png',
    },
    {
      level: 2,
      name: 'Dirt Rider',
      points: 500,
      icon: '/ranks/dirt-rider.png',
    },
    {
      level: 3,
      name: 'Mountain Rider',
      points: 1000,
      icon: '/ranks/mountain-rider.png',
    },
    {
      level: 4,
      name: 'Gravity Rider',
      points: 1500,
      icon: '/ranks/gravity-rider.png',
    },
    {
      level: 5,
      name: 'Peak Rider',
      points: 2000,
      icon: '/ranks/peak-rider.png',
    },
    {
      level: 6,
      name: 'Enduro Rider',
      points: 2500,
      icon: '/ranks/enduro-rider.png',
    },
    {
      level: 7,
      name: 'Titan Rider',
      points: 3000,
      icon: '/ranks/titan-rider.png',
    },
    {
      level: 8,
      name: 'Pro Rider',
      points: 4000,
      icon: '/ranks/pro-rider.png',
    },
    {
      level: 9,
      name: 'Legend Rider',
      points: 5000,
      icon: '/ranks/legend-rider.png',
    },
    {
      level: 10,
      name: 'Elite Rider',
      points: 6500,
      icon: '/ranks/elite-rider.png',
    },
  ]

  const currentRank = ranks[0]
  const [selectedRank, setSelectedRank] = useState(null)

  return (
    <Page
      title="Rang"
      eyebrow="DEIN FORTSCHRITT"
    >
      <div className="rank-big-card">
        <div className={`rank-big-icon rank-${currentRank.level}`}>
          <img
            src={currentRank.icon}
            alt={currentRank.name}
          />
        </div>

        <span className="small-title">
          AKTUELLER RANG
        </span>

        <h2>{currentRank.name}</h2>

        <strong>
          {currentRank.points.toLocaleString('de-DE')} Punkte
        </strong>

        <div className="rank-explanation">
          Je schwieriger deine gefahrene
          Strecke, desto mehr Punkte
          erhältst du.
        </div>
      </div>

      <div className="rank-levels">
        {ranks.map((rank) => (

     <div
  key={rank.level}
  className={`rank-item rank-${rank.level} ${rank.level === currentRank.level ? 'current' : ''}`}
  onClick={() => setSelectedRank(rank)}
>
          
<div className="rank-icon-wrapper">
  <img
    src={rank.icon}
    alt={rank.name}
    className={`rank-icon rank-icon-${rank.level}`}
  />
</div>

            <span>
              {String(rank.level).padStart(2, '0')}
            </span>

            <strong>{rank.name}</strong>

            <small>
              {rank.points.toLocaleString('de-DE')} Punkte
            </small>
          </div>
        ))}
      </div>
      {selectedRank && (
  <div className="rank-modal-overlay" onClick={() => setSelectedRank(null)}>
    <div
      className="rank-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="rank-modal-close"
        onClick={() => setSelectedRank(null)}
      >
        ×
      </button>

      <div className={`rank-modal-icon-wrapper rank-modal-icon-${selectedRank.level}`}>
  <img
    src={selectedRank.icon}
    alt={selectedRank.name}
    className={`rank-modal-icon rank-icon-${selectedRank.level}`}
  />
</div>

      <span className="small-title">
        RANG {String(selectedRank.level).padStart(2, '0')}
      </span>

      <h2>{selectedRank.name}</h2>

      <strong>
        {selectedRank.points.toLocaleString('de-DE')} Punkte
      </strong>
    </div>
  </div>
)}
    </Page>
  )
}

/* =====================================================
   🗺️ GRAVITY CARD KARTE
===================================================== */

/* =====================================================
   🚵 GRAVITY CARD TRAILS
===================================================== */

const TRAILS = [
  /* ===================================================
     LEOGANG
  =================================================== */

  {
    id: 'leogang-hangman-1',
    park: 'Epic Bikepark Leogang',
    trail: 'Hangman I',
    difficulty: 'schwer',
    type: 'Downhill',
    tags: [
      'downhill',
      'technisch',
      'wurzel',
      'steil',
      'jumps',
    ],
    website: 'https://www.bikepark-leogang.com/',
  },

  {
    id: 'leogang-hangman-2',
    park: 'Epic Bikepark Leogang',
    trail: 'Hangman II',
    difficulty: 'schwer',
    type: 'Downhill',
    tags: [
      'downhill',
      'technisch',
      'wurzel',
      'steil',
    ],
    website: 'https://www.bikepark-leogang.com/',
  },

  {
    id: 'leogang-speedster',
    park: 'Epic Bikepark Leogang',
    trail: 'Speedster',
    difficulty: 'schwer',
    type: 'Downhill',
    tags: [
      'downhill',
      'schnell',
      'jumps',
      'steil',
    ],
    website: 'https://www.bikepark-leogang.com/',
  },

  {
    id: 'leogang-back-to-roots',
    park: 'Epic Bikepark Leogang',
    trail: 'Back to the Roots',
    difficulty: 'schwer',
    type: 'Downhill',
    tags: [
      'technisch',
      'wurzel',
      'steil',
      'naturtrail',
    ],
    website: 'https://www.bikepark-leogang.com/',
  },

  {
    id: 'leogang-t-line',
    park: 'Epic Bikepark Leogang',
    trail: 'T-Line',
    difficulty: 'mittel',
    type: 'Flow',
    tags: [
      'flow',
      'jumps',
      'tables',
      'berms',
    ],
    website: 'https://www.bikepark-leogang.com/',
  },

  {
    id: 'leogang-gateway',
    park: 'Epic Bikepark Leogang',
    trail: 'Gateway',
    difficulty: 'mittel',
    type: 'Flow',
    tags: [
      'flow',
      'jumps',
      'berms',
    ],
    website: 'https://www.bikepark-leogang.com/',
  },


  /* ===================================================
     WEXL TRAILS
  =================================================== */

  {
    id: 'wexl-flowline',
    park: 'Wexl Trails',
    trail: 'Flowline',
    difficulty: 'leicht',
    type: 'Flow',
    tags: [
      'flow',
      'berms',
      'jumps',
      'easy',
    ],
    website: 'https://www.wexltrails.at/',
  },

  {
    id: 'wexl-downhill',
    park: 'Wexl Trails',
    trail: 'Downhill',
    difficulty: 'schwer',
    type: 'Downhill',
    tags: [
      'downhill',
      'steil',
      'technisch',
      'jumps',
    ],
    website: 'https://www.wexltrails.at/',
  },

  {
    id: 'wexl-singletrail',
    park: 'Wexl Trails',
    trail: 'Singletrail',
    difficulty: 'mittel',
    type: 'Singletrail',
    tags: [
      'singletrail',
      'enduro',
      'technisch',
      'naturtrail',
    ],
    website: 'https://www.wexltrails.at/',
  },

  {
    id: 'wexl-easyline',
    park: 'Wexl Trails',
    trail: 'Easyline',
    difficulty: 'leicht',
    type: 'Flow',
    tags: [
      'flow',
      'easy',
      'anfänger',
    ],
    website: 'https://www.wexltrails.at/',
  },

  {
    id: 'wexl-jumpline',
    park: 'Wexl Trails',
    trail: 'Jumpline',
    difficulty: 'mittel',
    type: 'Jump',
    tags: [
      'jumps',
      'jump',
      'tables',
      'airtime',
    ],
    website: 'https://www.wexltrails.at/',
  },

  {
    id: 'wexl-jib-line',
    park: 'Wexl Trails',
    trail: 'Jib Line',
    difficulty: 'mittel',
    type: 'Jib',
    tags: [
      'jumps',
      'jib',
      'skills',
    ],
    website: 'https://www.wexltrails.at/',
  },


  /* ===================================================
     BEISPIEL-PARKS
     
     Weitere offizielle Trails werden hier nach
     demselben Schema ergänzt.
  =================================================== */

  {
    id: 'solden-example',
    park: 'Bike Republic Sölden',
    trail: 'Bike Republic Trail',
    difficulty: 'mittel',
    type: 'Enduro',
    tags: [
      'enduro',
      'flow',
      'singletrail',
    ],
    website: 'https://bikerepublic.soelden.com/',
  },

  {
    id: 'willingen-example',
    park: 'MTB Zone Bikepark Willingen',
    trail: 'Bikepark Trail',
    difficulty: 'mittel',
    type: 'Bikepark',
    tags: [
      'bikepark',
      'flow',
      'jumps',
    ],
    website: 'https://www.mtbzone-bikepark.com/willingen/',
  },
]


/* =====================================================
   🔎 TRAIL-SUCHE
===================================================== */

function searchTrails(searchText) {
  if (!searchText.trim()) {
    return []
  }

  const words = searchText
    .toLowerCase()
    .split(/[,\s]+/)
    .map((word) => word.trim())
    .filter(Boolean)

  return TRAILS.filter((trail) => {
    const searchableText = [
      trail.park,
      trail.trail,
      trail.difficulty,
      trail.type,
      ...trail.tags,
    ]
      .join(' ')
      .toLowerCase()

    return words.every((word) =>
      searchableText.includes(word)
    )
  })
}


/* =====================================================
   🔎 TRAIL FINDER KOMPONENTE
===================================================== */

function TrailFinder() {
  const [search, setSearch] = useState('')

  const results = searchTrails(search)

  return (
    <div className="trail-finder">

      <div className="trail-finder-header">
        <div>
          <p className="eyebrow">
            GRAVITY CARD
          </p>

          <h2>Trail Finder</h2>

          <p>
            Suche z. B. nach „Enduro Wurzeln“
            oder „mittel Jumps“.
          </p>
        </div>
      </div>

      <div className="trail-search">
        <span>🔎</span>

        <input
          type="text"
          placeholder="z. B. Enduro, Wurzeln, mittel..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        {search && (
          <button
            onClick={() => setSearch('')}
          >
            ×
          </button>
        )}
      </div>

      {search.trim() && (
        <div className="trail-results">

          {results.length === 0 ? (
            <div className="trail-empty">
              <span>🔎</span>

              <strong>
                Keine passenden Trails
              </strong>

              <small>
                Versuch andere Suchbegriffe.
              </small>
            </div>
          ) : (
            results.map((trail) => (
              <div
                className="trail-result"
                key={trail.id}
              >

                <div className="trail-result-icon">
                  🚵
                </div>

                <div className="trail-result-info">

                  <strong>
                    {trail.trail}
                  </strong>

                  <span>
                    {trail.park}
                  </span>

                  <small>
                    {trail.difficulty}
                    {' · '}
                    {trail.type}
                  </small>

                  <div className="trail-tags">
                    {trail.tags
                      .slice(0, 4)
                      .map((tag) => (
                        <span key={tag}>
                          {tag}
                        </span>
                      ))}
                  </div>

                </div>

                <button
                  className="trail-open-button"
                  onClick={() =>
                    window.open(
                      trail.website,
                      '_blank',
                      'noopener,noreferrer'
                    )
                  }
                >
                  →
                </button>

              </div>
            ))
          )}

        </div>
      )}

      {!search.trim() && (
        <div className="trail-suggestions">

          <p className="trail-suggestions-title">
            Beliebte Suchen
          </p>

          <div className="trail-suggestion-buttons">

            {[
              'Enduro',
              'Wurzeln',
              'Jumps',
              'Flow',
              'mittel',
              'schwer',
            ].map((term) => (
              <button
                key={term}
                onClick={() =>
                  setSearch(term)
                }
              >
                {term}
              </button>
            ))}

          </div>

        </div>
      )}

    </div>
  )
}

function MapPage() {
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const userMarkerRef = useRef(null)
  const parkMarkersRef = useRef([])

  const [position, setPosition] =
    useState(null)

  const [locationError, setLocationError] =
    useState(false)

  const [search, setSearch] =
    useState('')

  const [selectedPark, setSelectedPark] =
    useState(null)

  /* ---------------------------------------------
     KARTE ERSTELLEN
  --------------------------------------------- */

  useEffect(() => {
  if (!mapContainer.current) return

  const map = new Map({
    container: mapContainer.current,

    style: {
      version: 8,

      sources: {
        osm: {
          type: 'raster',
          tiles: [
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors',
        },
      },

      layers: [
        {
          id: 'osm',
          type: 'raster',
          source: 'osm',
        },
      ],
    },

    center: [11.5, 47.0],
    zoom: 5.5,

    attributionControl: true,
    cooperativeGestures: false,
    dragRotate: false,
    touchZoomRotate: true,
  })

  map.addControl(
    new NavigationControl({
      showCompass: false,
    }),
    'top-right'
  )

  mapRef.current = map

  // Wichtig für Handy/Tablet:
  // MapLibre bekommt nach dem Anzeigen die richtige Größe.
  const resizeMap = () => {
    if (mapRef.current) {
      mapRef.current.resize()
    }
  }

  map.on('load', resizeMap)

  // Falls der Kartenbereich durch Navigation erst später sichtbar wird
  setTimeout(resizeMap, 100)
  setTimeout(resizeMap, 500)
  setTimeout(resizeMap, 1000)

  window.addEventListener('resize', resizeMap)
  window.addEventListener('orientationchange', resizeMap)

  return () => {
    window.removeEventListener('resize', resizeMap)
    window.removeEventListener('orientationchange', resizeMap)

    map.remove()
    mapRef.current = null
  }
}, [])

  /* ---------------------------------------------
     STANDORT
  --------------------------------------------- */

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError(true)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (location) => {
        const coords = [
          location.coords.longitude,
          location.coords.latitude,
        ]

        setPosition(coords)
      },
      () => {
        setLocationError(true)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }, [])

  /* ---------------------------------------------
     PARK-MARKER
  --------------------------------------------- */

  useEffect(() => {
    const map = mapRef.current

    if (!map) return

    const updateMarkers = () => {
      parkMarkersRef.current.forEach(
        (marker) => marker.remove()
      )

      parkMarkersRef.current = []

      const filteredParks =
        GRAVITY_CARD_PARKS.filter(
          (park) =>
            park.name
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            park.country
              .toLowerCase()
              .includes(
                search.toLowerCase()
              )
        )

      filteredParks.forEach((park) => {
        const element =
          document.createElement('button')

        element.className =
          'bikepark-marker'

        element.innerHTML = '🚵'

        element.title = park.name

        element.addEventListener(
          'click',
          () => {
            openPark(park)
          }
        )

        const marker =
          new Marker({
            element,
            anchor: 'center',
          })
            .setLngLat([
              park.lon,
              park.lat,
            ])
            .addTo(map)

        parkMarkersRef.current.push(
          marker
        )
      })
    }

    if (map.loaded()) {
      updateMarkers()
    } else {
      map.once('load', updateMarkers)
    }

    return () => {
      parkMarkersRef.current.forEach(
        (marker) => marker.remove()
      )

      parkMarkersRef.current = []
    }
  }, [search])

  /* ---------------------------------------------
     USER MARKER
  --------------------------------------------- */

  useEffect(() => {
    const map = mapRef.current

    if (!map || !position) return

    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
    }

    const element =
      document.createElement('div')

    element.className =
      'user-location-marker'

    element.innerHTML = '📍'

    userMarkerRef.current =
      new Marker({
        element,
        anchor: 'bottom',
      })
        .setLngLat(position)
        .addTo(map)
  }, [position])

  /* ---------------------------------------------
     PARK ÖFFNEN
  --------------------------------------------- */

  const openPark = (park) => {
    setSelectedPark(park)

    if (!mapRef.current) return

    mapRef.current.flyTo({
      center: [
        park.lon,
        park.lat,
      ],
      zoom: 12,
      duration: 1000,
    })
  }

  /* ---------------------------------------------
     MEIN STANDORT
  --------------------------------------------- */

  const goToLocation = () => {
    if (!position || !mapRef.current) return

    mapRef.current.flyTo({
      center: position,
      zoom: 13,
      duration: 1200,
    })
  }

  /* ---------------------------------------------
     SUCHE
  --------------------------------------------- */

  const filteredParks =
    GRAVITY_CARD_PARKS.filter(
      (park) =>
        park.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        park.country
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    )

  return (
    <section className="page map-page">
      <TrailFinder />
      <div className="map-header">
        <div>
          <p className="eyebrow">
            GRAVITY CARD 2026
          </p>

          <h1>MTB Karte</h1>
        </div>

        <button
          className="location-button"
          onClick={goToLocation}
          disabled={!position}
        >
          📍 Mein Standort
        </button>
      </div>

      {/* SUCHE */}

      <div className="map-search">
        <span>🔎</span>

        <input
          type="text"
          placeholder="Bikepark suchen..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />

        {search && (
          <button
            className="clear-search"
            onClick={() => setSearch('')}
          >
            ×
          </button>
        )}
      </div>

      <div className="map-filter-row">
        <button className="bikepark-toggle active">
          <span className="toggle-dot">
            ✓
          </span>

          🚵 Gravity Card Parks
        </button>

        <span className="bikepark-count">
          {filteredParks.length} / 32 Parks
        </span>
      </div>

      {/* KARTE */}

      <div className="real-map">
        <div
          ref={mapContainer}
          className="maplibre-container"
        />

        {locationError && (
          <div className="map-location-info">
            📍 Standort konnte nicht
            ermittelt werden.
          </div>
        )}

        {/* AUSGEWÄHLTER PARK */}

        {selectedPark && (
          <div className="bikepark-card">
            <button
              className="bikepark-close"
              onClick={() =>
                setSelectedPark(null)
              }
            >
              ×
            </button>

            <div className="bikepark-card-icon">
              🚵
            </div>

            <div className="bikepark-card-content">
              <span className="bikepark-label">
                GRAVITY CARD
              </span>

              <h3>
                {selectedPark.name}
              </h3>

              <p>
                📍 {selectedPark.country}
              </p>

              <div className="selected-trails">
                <strong>
                  Trails
                </strong>

                <div>
                  {selectedPark.trails
                    .slice(0, 5)
                    .map((trail) => (
                      <span
                        key={trail}
                      >
                        {trail}
                      </span>
                    ))}
                </div>
              </div>

              <button
                className="park-website-button"
                onClick={() =>
                  window.open(
                    selectedPark.website,
                    '_blank',
                    'noopener,noreferrer'
                  )
                }
              >
                🌐 Offizielle Webseite
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PARKLISTE */}

      <div className="bikepark-panel">
        <div className="bikepark-panel-header">
          <div>
            <p className="eyebrow">
              GRAVITY CARD
            </p>

            <h2>
              32 Bike-Destinationen
            </h2>
          </div>
        </div>

        {filteredParks.length === 0 ? (
          <div className="bikepark-empty">
            <span>🔎</span>

            <strong>
              Kein Bikepark gefunden
            </strong>

            <small>
              Versuch einen anderen Namen.
            </small>
          </div>
        ) : (
          <div className="bikepark-list">
            {filteredParks.map(
              (park) => (
                <button
                  className="bikepark-list-item"
                  key={park.id}
                  onClick={() =>
                    openPark(park)
                  }
                >
                  <div className="bikepark-list-icon">
                    📍
                  </div>

                  <div className="bikepark-list-info">
                    <strong>
                      {park.name}
                    </strong>

                    <span>
                      {park.country}
                    </span>

                    <small>
                      {park.trails.length}{' '}
                      eingetragene Trails
                    </small>
                  </div>

                  <span className="bikepark-arrow">
                    →
                  </span>
                </button>
              )
            )}
          </div>
        )}
      </div>

      <p className="map-attribution-note">
        Die Gravity Card umfasst 2026 insgesamt
        32 Bike-Destinationen in 7 Ländern.
        Kartenmaterial: © OpenStreetMap.
      </p>
    </section>
  )
}

/* =====================================================
   PAGE
===================================================== */

function Page({
  title,
  eyebrow,
  children,
}) {
  return (
    <section className="page">
      <p className="eyebrow">
        {eyebrow}
      </p>

      <h1>{title}</h1>

      {children}
    </section>
  )
}

/* =====================================================
   NAVIGATION
===================================================== */

function Navigation({
  activePage,
  setActivePage,
}) {
  const items = [
    {
      id: 'map',
      icon: '⌖',
      label: 'Karte',
    },
    {
      id: 'tours',
      icon: '▣',
      label: 'Touren',
    },
    {
      id: 'home',
      icon: '⌂',
      label: 'Home',
    },
    {
      id: 'friends',
      icon: '♧',
      label: 'Freunde',
    },
    {
      id: 'rank',
      icon: '♜',
      label: 'Rang',
    },
  ]

  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <button
          key={item.id}
          className={
            'nav-button ' +
            (activePage === item.id
              ? 'active'
              : '')
          }
          onClick={() =>
            setActivePage(item.id)
          }
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
   PROFIL MODAL
===================================================== */

function ProfileModal({
  profile,
  onSave,
  onClose,
  onLogout,
}) {
  const [name, setName] =
    useState(profile.name)

  const [image, setImage] =
    useState(profile.image)

  const fileInput = useRef(null)

  const chooseImage = (event) => {
    const file =
      event.target.files?.[0]

    if (!file) return

    const reader =
      new FileReader()

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

        <h2>Dein Profil</h2>

        <div className="modal-avatar">
          {image ? (
            <img
              src={image}
              alt="Profil"
            />
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
          onClick={() =>
            fileInput.current?.click()
          }
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
          onChange={(event) =>
            setName(event.target.value)
          }
        />

        <button
          className="create-button"
          disabled={!name.trim()}
          onClick={() =>
            onSave({
              ...profile,
              name: name.trim(),
              image,
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

/* =====================================================
   EINZIGER DEFAULT EXPORT
===================================================== */

export default App