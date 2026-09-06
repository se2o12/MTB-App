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

  /*
     Neue localStorage-Touren benutzen "track".

     Ältere Supabase-Touren können "route"
     benutzen.

     Deshalb unterstützen wir beides.
  */

  const route = Array.isArray(tour.track)
    ? tour.track
    : Array.isArray(tour.route)
      ? tour.route
      : []

  const validRoute = route.filter(
    (point) =>
      point &&
      typeof point.lat === 'number' &&
      typeof point.lon === 'number'
  )

  const firstPoint =
    validRoute.length > 0
      ? [
          validRoute[0].lat,
          validRoute[0].lon,
        ]
      : [47.0, 11.5]


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
              ? formatDistance(tour.distance_m)
              : `${(tour.distance || 0)
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
          KARTE
      ================================================= */}

      <div className="tour-detail-map">

        {validRoute.length > 0 ? (

          <MapContainer
            center={firstPoint}
            zoom={14}
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


            <FitTrack
              track={validRoute}
            />


            {/* =========================================
                GPS-LINIE
            ========================================= */}

            <Polyline
              positions={validRoute.map(
                (point) => [
                  point.lat,
                  point.lon,
                ]
              )}
              pathOptions={{
                color: '#a5f51a',
                weight: 5,
                opacity: 0.9,
              }}
            />


            {/* =========================================
                START
            ========================================= */}

            <CircleMarker
              center={[
                validRoute[0].lat,
                validRoute[0].lon,
              ]}
              radius={7}
              pathOptions={{
                color: '#ffffff',
                fillColor: '#a5f51a',
                fillOpacity: 1,
                weight: 3,
              }}
            />


            {/* =========================================
                ENDE
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
                radius={7}
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
              Für diese Tour wurde keine
              GPS-Strecke gespeichert.
            </span>

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