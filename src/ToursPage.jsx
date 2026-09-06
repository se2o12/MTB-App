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

function FitTrack({ track }) {
  const map = useMap()

  useEffect(() => {
    if (!track || track.length === 0) return

    const validPoints = track.filter(
      (point) =>
        point &&
        typeof point.lat === 'number' &&
        typeof point.lon === 'number'
    )

    if (validPoints.length === 0) return

    const bounds = validPoints.map((point) => [
      point.lat,
      point.lon,
    ])

    map.fitBounds(bounds, {
      padding: [40, 40],
    })
  }, [map, track])

  return null
}


/* =====================================================
   TOUR DETAIL
===================================================== */

function TourDetail({ tour, onBack }) {

  /* =====================================================
     GPS-STRECKE LADEN
  ===================================================== */

  let route = []

  if (Array.isArray(tour.track)) {
    route = tour.track
  } else if (typeof tour.track === 'string') {
    try {
      const parsedTrack = JSON.parse(tour.track)

      if (Array.isArray(parsedTrack)) {
        route = parsedTrack
      }
    } catch (error) {
      console.error(
        'Track konnte nicht gelesen werden:',
        error
      )
    }
  }

  /* Alte Touren unterstützen */
  if (
    route.length === 0 &&
    Array.isArray(tour.route)
  ) {
    route = tour.route
  }

  /* =====================================================
     GPS-PUNKTE PRÜFEN
  ===================================================== */

  const validRoute = route
    .map((point) => ({
      lat: Number(point?.lat),
      lon: Number(
        point?.lon ?? point?.lng
      ),
    }))
    .filter(
      (point) =>
        Number.isFinite(point.lat) &&
        Number.isFinite(point.lon)
    )

  console.log(
    'Tour geöffnet:',
    tour.name || tour.title
  )

  console.log(
    'Gespeicherte GPS-Punkte:',
    validRoute.length
  )

  /* =====================================================
     STARTPUNKT
  ===================================================== */

  const firstPoint =
    validRoute.length > 0
      ? [
          validRoute[0].lat,
          validRoute[0].lon,
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
          TOUR INFOS
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
          GPS-KARTE
      ================================================= */}

      <div
        className="tour-detail-map"
        style={{
          width: '100%',
          height: '500px',
          minHeight: '500px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >

        {validRoute.length > 0 ? (

          <MapContainer
            center={firstPoint}
            zoom={15}
            scrollWheelZoom={true}
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
                AUTOMATISCH AUF STRECKE ZOOMEN
            ========================================= */}

            <FitTrack
              track={validRoute}
            />


            {/* =========================================
                GEFAHRENE STRECKE
            ========================================= */}

            {validRoute.length > 1 && (

              <Polyline
                positions={validRoute.map(
                  (point) => [
                    point.lat,
                    point.lon,
                  ]
                )}
                pathOptions={{
                  color: '#a5f51a',
                  weight: 6,
                  opacity: 0.95,
                }}
              />

            )}


            {/* =========================================
                START
            ========================================= */}

            <CircleMarker
              center={[
                validRoute[0].lat,
                validRoute[0].lon,
              ]}
              radius={8}
              pathOptions={{
                color: '#ffffff',
                fillColor: '#a5f51a',
                fillOpacity: 1,
                weight: 3,
              }}
            />


            {/* =========================================
                ZIEL
            ========================================= */}

            {validRoute.length > 1 && (

              <CircleMarker
                center={[
                  validRoute[
                    validRoute.length - 1
                  ].lat,

                  validRoute[
                    validRoute.length - 1
                  ].lon,
                ]}
                radius={8}
                pathOptions={{
                  color: '#ffffff',
                  fillColor: '#ff4d4d',
                  fillOpacity: 1,
                  weight: 3,
                }}
              />

            )}

          </MapContainer>

        ) : (

          <div className="tour-no-track">

            <div className="tour-no-track-icon">
              🗺️
            </div>

            <strong>
              Keine GPS-Strecke vorhanden
            </strong>

            <span>
              Diese Tour enthält aktuell keine
              gespeicherten GPS-Punkte.
            </span>

            <small
              style={{
                marginTop: '10px',
                opacity: 0.6,
              }}
            >
              GPS-Punkte: 0
            </small>

          </div>

        )}

      </div>

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