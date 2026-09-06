import { useEffect, useState } from 'react'

import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  useMap,
} from 'react-leaflet'

import 'leaflet/dist/leaflet.css'


/* =====================================================
   HILFSFUNKTIONEN
===================================================== */

function formatDuration(seconds) {
  if (!seconds) return '0:00'

  const totalSeconds = Math.floor(seconds)

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}min`
  }

  return `${minutes}:${String(secs).padStart(2, '0')}`
}


function formatDistance(meters) {
  if (!meters) return '0,00 km'

  return `${(meters / 1000)
    .toFixed(2)
    .replace('.', ',')} km`
}


function formatDate(dateString) {
  if (!dateString) return '-'

  const date = new Date(dateString)

  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}


/* =====================================================
   KARTE AUF STRECKE ZENTRIEREN
===================================================== */

function MapFix({ track }) {
  const map = useMap()

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()

      if (!track || track.length === 0) return

      const validPoints = track.filter(
        (point) =>
          point &&
          Number.isFinite(point.lat) &&
          Number.isFinite(point.lon)
      )

      if (validPoints.length === 0) return

      const bounds = validPoints.map((point) => [
        point.lat,
        point.lon,
      ])

      map.fitBounds(bounds, {
        padding: [50, 50],
      })
    }, 150)

    return () => clearTimeout(timer)
  }, [map, track])

  return null
}

function MapFix({ track }) {
  const map = useMap()

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()

      if (track && track.length > 0) {
        const bounds = track.map((point) => [
          point.lat,
          point.lon,
        ])

        map.fitBounds(bounds, {
          padding: [50, 50],
        })
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [map, track])

  return null
}

/* =====================================================
   TOUR DETAIL
===================================================== */

function TourDetail({ tour, onBack }) {

  /* =====================================================
     GPS-DATEN AUS DER TOUR HOLEN
  ===================================================== */

  let rawRoute = []

  // Neue Touren
  if (Array.isArray(tour.track)) {
    rawRoute = tour.track
  }

  // Falls track als JSON gespeichert wurde
  else if (typeof tour.track === 'string') {
    try {
      const parsed = JSON.parse(tour.track)

      if (Array.isArray(parsed)) {
        rawRoute = parsed
      }
    } catch (error) {
      console.error(
        'track konnte nicht gelesen werden:',
        error
      )
    }
  }

  // Alte Touren
  if (
    rawRoute.length === 0 &&
    Array.isArray(tour.route)
  ) {
    rawRoute = tour.route
  }

  /* =====================================================
     GPS-PUNKTE NORMALISIEREN
  ===================================================== */

  const route = rawRoute
    .map((point) => {

      if (!point) {
        return null
      }

      const lat = Number(point.lat)

      const lon = Number(
        point.lon ??
        point.lng
      )

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lon)
      ) {
        return null
      }

      return {
        lat,
        lon,
      }
    })
    .filter(Boolean)

  console.log(
    'TOUR:',
    tour.name || tour.title
  )

  console.log(
    'GPS-PUNKTE:',
    route.length
  )

  /* =====================================================
     KARTE
  ===================================================== */

  const mapCenter =
    route.length > 0
      ? [
          route[0].lat,
          route[0].lon,
        ]
      : [49.79, 9.95]


  return (
    <div className="tour-detail">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="tour-detail-header">

        <button
          className="tour-back-button"
          onClick={onBack}
        >
          ← Zurück
        </button>

        <div>

          <span className="small-title">
            TOUR
          </span>

          <h1>
            {tour.name ||
              tour.title ||
              'Meine MTB Tour'}
          </h1>

          <span className="tour-detail-date">
            {formatDate(
              tour.date ||
              tour.started_at ||
              tour.created_at
            )}
          </span>

        </div>

      </div>


      {/* =================================================
          STATS
      ================================================= */}

      <div className="tour-detail-stats">

        <div className="tour-detail-stat">

          <span>
            ZEIT
          </span>

          <strong>
            {formatDuration(
              tour.duration_s ??
              tour.duration
            )}
          </strong>

        </div>


        <div className="tour-detail-stat">

          <span>
            STRECKE
          </span>

          <strong>
            {tour.distance_m !== undefined
              ? formatDistance(
                  tour.distance_m
                )
              : `${(
                  tour.distance || 0
                )
                  .toFixed(2)
                  .replace('.', ',')} km`}
          </strong>

        </div>


        <div className="tour-detail-stat">

          <span>
            HÖHENMETER
          </span>

          <strong>
            {Math.round(
              tour.elevation_gain_m ??
              tour.elevation ??
              0
            )}{' '}
            hm
          </strong>

        </div>

      </div>


      {/* =================================================
          KOMOOT-STYLE TOUR MAP
      ================================================= */}

      <div
        className="tour-detail-map"
        style={{
          width: '100%',
          height: '550px',
          minHeight: '550px',
          position: 'relative',
        }}
      >

        <MapContainer
          key={String(tour.id)}
          center={mapCenter}
          zoom={15}
          scrollWheelZoom={true}
          style={{
            width: '100%',
            height: '100%',
            minHeight: '550px',
          }}
          dragging={true}
          doubleClickZoom={true}
          touchZoom={true}
          zoomControl={true}
          style={{
            width: '100%',
            height: '100%',
          }}
        >

          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />


          {/* =========================================
              STRECKE AUTOMATISCH ANPASSEN
          ========================================= */}

          
            <MapFix track={route} />

          {/* =========================================
              GEFAHRENE STRECKE
          ========================================= */}

          {route.length > 1 && (

            <Polyline
              positions={route.map(
                (point) => [
                  point.lat,
                  point.lon,
                ]
              )}
              pathOptions={{
                color: '#a5f51a',
                weight: 6,
                opacity: 1,
              }}
            />

          )}


          {/* =========================================
              START
          ========================================= */}

          {route.length > 0 && (

            <CircleMarker
              center={[
                route[0].lat,
                route[0].lon,
              ]}
              radius={9}
              pathOptions={{
                color: '#ffffff',
                fillColor: '#a5f51a',
                fillOpacity: 1,
                weight: 3,
              }}
            />

          )}


          {/* =========================================
              ZIEL
          ========================================= */}

          {route.length > 1 && (

            <CircleMarker
              center={[
                route[
                  route.length - 1
                ].lat,

                route[
                  route.length - 1
                ].lon,
              ]}
              radius={9}
              pathOptions={{
                color: '#ffffff',
                fillColor: '#ff4d4d',
                fillOpacity: 1,
                weight: 3,
              }}
            />

          )}

        </MapContainer>


        {/* =============================================
            INFO WENN KEINE STRECKE
        ============================================= */}

        {route.length === 0 && (

          <div
            className="tour-no-track"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >

            <div className="tour-no-track-icon">
              🗺️
            </div>

            <strong>
              Keine GPS-Strecke vorhanden
            </strong>

            <span>
              Diese Tour enthält keine
              gespeicherten GPS-Punkte.
            </span>

            <small
              style={{
                marginTop: '12px',
                opacity: 0.6,
              }}
            >
              Gespeicherte Punkte: 0
            </small>

          </div>

        )}

      </div>


      {/* =================================================
          GPS INFO
      ================================================= */}

      {route.length > 0 && (

        <div
          style={{
            marginTop: '12px',
            opacity: 0.55,
            fontSize: '12px',
          }}
        >
          🛰️ {route.length} GPS-Punkte aufgezeichnet
        </div>

      )}

    </div>
  )
}


/* =====================================================
   TOURS PAGE
===================================================== */

export default function ToursPage() {

  const [tours, setTours] = useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [selectedTour, setSelectedTour] =
    useState(null)


  /* =================================================
     TOUREN AUS LOCALSTORAGE LADEN
  ================================================= */

  const loadTours = () => {

    setLoading(true)
    setError('')

    try {

      const savedTours = JSON.parse(
        localStorage.getItem('mtb_tours') || '[]'
      )

      console.log(
        'Touren aus localStorage:',
        savedTours
      )

      setTours(
        Array.isArray(savedTours)
          ? savedTours
          : []
      )

    } catch (err) {

      console.error(
        'Touren konnten nicht geladen werden:',
        err
      )

      setTours([])

      setError(
        'Touren konnten nicht geladen werden.'
      )

    } finally {

      setLoading(false)

    }

  }


  /* =================================================
     START
  ================================================= */

  useEffect(() => {
    loadTours()
  }, [])


  /* =================================================
     DETAILANSICHT
  ================================================= */

  if (selectedTour) {

    return (
      <TourDetail
        tour={selectedTour}
        onBack={() =>
          setSelectedTour(null)
        }
      />
    )

  }


  /* =================================================
     LADEN
  ================================================= */

  if (loading) {

    return (
      <Page
        title="Meine Touren"
        eyebrow="TOUREN"
      >

        <div className="tours-loading">
          Touren werden geladen...
        </div>

      </Page>
    )

  }


  /* =================================================
     FEHLER
  ================================================= */

  if (error) {

    return (
      <Page
        title="Meine Touren"
        eyebrow="TOUREN"
      >

        <div className="tours-error">

          <strong>
            Fehler
          </strong>

          <span>
            {error}
          </span>

          <button
            onClick={loadTours}
          >
            Erneut versuchen
          </button>

        </div>

      </Page>
    )

  }


  /* =================================================
     KEINE TOUREN
  ================================================= */

  if (tours.length === 0) {

    return (
      <Page
        title="Meine Touren"
        eyebrow="TOUREN"
      >

        <div className="empty-tours">

          <div className="empty-tours-icon">
            🚵
          </div>

          <h2>
            Noch keine Touren
          </h2>

          <p>
            Zeichne deine erste MTB-Tour
            auf und sie erscheint hier.
          </p>

        </div>

      </Page>
    )

  }


  /* =================================================
     TOUR LISTE
  ================================================= */

  return (
    <Page
      title="Meine Touren"
      eyebrow="TOUREN"
    >

      <div className="tour-list">

        {tours.map((tour) => (

          <button
            key={tour.id}
            className="saved-tour"
            onClick={() =>
              setSelectedTour(tour)
            }
          >

            <div className="saved-tour-image">
              ⛰️
            </div>


            <div className="saved-tour-content">

              <span className="difficulty">
                MTB TOUR
              </span>


              <h3>
                {tour.name ||
                  tour.title ||
                  'Meine MTB Tour'}
              </h3>


              <span className="saved-tour-date">
                {formatDate(
                  tour.date ||
                  tour.started_at ||
                  tour.created_at
                )}
              </span>


              <div className="saved-tour-stats">

                <span>
                  ⏱️{' '}
                  {formatDuration(
                    tour.duration_s ??
                    tour.duration
                  )}
                </span>


                <span>
                  📍{' '}

                  {tour.distance_m !== undefined
                    ? formatDistance(
                        tour.distance_m
                      )
                    : `${(tour.distance || 0)
                        .toFixed(2)
                        .replace('.', ',')} km`}
                </span>


                <span>
                  ⛰️{' '}

                  {Math.round(
                    tour.elevation_gain_m ??
                    tour.elevation ??
                    0
                  )}{' '}
                  hm
                </span>

              </div>

            </div>


            <div className="saved-tour-arrow">
              →
            </div>

          </button>

        ))}

      </div>

    </Page>
  )
}
/* =====================================================
   🗺️ TOUR DETAIL – KARTE
===================================================== */

.tour-detail-map {
  position: relative;
  width: 100%;
  height: 550px;
  margin-top: 25px;

  overflow: hidden;

  border: 1px solid rgba(255,255,255,.09);
  border-radius: 24px;

  background: #111711;

  box-shadow:
    0 20px 60px rgba(0,0,0,.35);
}

/* LEAFLET KARTE */

.tour-detail-map .leaflet-container {
  width: 100%;
  height: 100%;

  background: #dfe8dc;

  font-family: inherit;
}

/* ZOOM BUTTONS */

.tour-detail-map .leaflet-control-zoom {
  margin: 15px;
  border: 0;
  border-radius: 12px;
  overflow: hidden;

  box-shadow:
    0 5px 20px rgba(0,0,0,.3);
}

.tour-detail-map .leaflet-control-zoom a {
  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(15,20,16,.92);
  color: white;

  border: 0;

  font-size: 22px;
}

.tour-detail-map .leaflet-control-zoom a:hover {
  background: #a5f51a;
  color: #10150c;
}

/* ATTRIBUTION */

.tour-detail-map .leaflet-control-attribution {
  padding: 4px 8px;

  background: rgba(10,14,11,.8);

  color: #89928b;

  font-size: 9px;
}

.tour-detail-map .leaflet-control-attribution a {
  color: #a5f51a;
}

/* START / ZIEL MARKER */

.tour-detail-map .leaflet-interactive {
  transition:
    filter .2s ease,
    opacity .2s ease;
}

/* KEINE GPS-STRECKE */

.tour-no-track {
  position: absolute;

  inset: 0;

  z-index: 1000;

  display: flex;

  align-items: center;
  justify-content: center;

  flex-direction: column;

  text-align: center;

  padding: 30px;

  background:
    linear-gradient(
      180deg,
      rgba(8,12,9,.65),
      rgba(8,12,9,.92)
    );

  color: white;
}

.tour-no-track-icon {
  width: 70px;
  height: 70px;

  display: grid;
  place-items: center;

  margin-bottom: 18px;

  border-radius: 22px;

  background: #1b241c;

  font-size: 32px;
}

.tour-no-track strong {
  font-size: 18px;
}

.tour-no-track span {
  max-width: 320px;

  margin-top: 8px;

  color: #747d75;

  font-size: 13px;

  line-height: 1.5;
}

/* GPS INFO */

.tour-detail-map + div {
  color: #687068;
}

/* =====================================================
   📱 TOUR DETAIL – HANDY
===================================================== */

@media (max-width: 700px) {

  .tour-detail-map {
    height: 58vh;
    min-height: 400px;

    margin-top: 20px;

    border-radius: 18px;
  }

  .tour-detail-map .leaflet-container {
    min-height: 400px;
  }

  .tour-detail-map .leaflet-control-zoom {
    margin: 12px;
  }

  .tour-detail-map .leaflet-control-zoom a {
    width: 38px;
    height: 38px;

    font-size: 20px;
  }

}