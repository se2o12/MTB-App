
import { useEffect, useRef, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  useMap,
} from 'react-leaflet'

import 'leaflet/dist/leaflet.css'

/* =====================================================
   KARTE AUTOMATISCH ZUM GPS-PUNKT BEWEGEN
===================================================== */

function MapFollower({ position, follow }) {
  const map = useMap()

  useEffect(() => {
    if (!position || !follow) return

    map.setView(
      [position.lat, position.lon],
      Math.max(map.getZoom(), 16),
      { animate: true }
    )
  }, [position, follow, map])

  return null
}

/* =====================================================
   TOUREN AUFZEICHNEN
===================================================== */

function RecordingPage({ onFinish }) {
  const [recording, setRecording] = useState(false)
  const [paused, setPaused] = useState(false)

  const [seconds, setSeconds] = useState(0)
  const [distance, setDistance] = useState(0)
  const [elevation, setElevation] = useState(0)

  const [currentPosition, setCurrentPosition] = useState(null)
  const [track, setTrack] = useState([])

  const [error, setError] = useState('')
  const [followPosition, setFollowPosition] = useState(true)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [tourName, setTourName] = useState('')

  const timerRef = useRef(null)
  const watchIdRef = useRef(null)

  const lastPositionRef = useRef(null)
  const trackRef = useRef([])

  /* =====================================================
     ENTFERNUNG BERECHNEN
  ===================================================== */

  const calculateDistance = (
    lat1,
    lon1,
    lat2,
    lon2
  ) => {
    const R = 6371000

    const lat1Rad = (lat1 * Math.PI) / 180
    const lat2Rad = (lat2 * Math.PI) / 180

    const deltaLat =
      ((lat2 - lat1) * Math.PI) / 180

    const deltaLon =
      ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(deltaLat / 2) *
        Math.sin(deltaLat / 2) +
      Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2)

    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      )

    return R * c
  }

  /* =====================================================
     TIMER
  ===================================================== */

  useEffect(() => {
    if (recording && !paused) {
      timerRef.current = setInterval(() => {
        setSeconds((value) => value + 1)
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [recording, paused])

  /* =====================================================
   GPS
===================================================== */

const recordingRef = useRef(false)
const pausedRef = useRef(false)

/*
   React-State und Refs synchron halten
*/
useEffect(() => {
  recordingRef.current = recording
}, [recording])

useEffect(() => {
  pausedRef.current = paused
}, [paused])

const startGPS = () => {
  if (!navigator.geolocation) {
    setError(
      'Dein Gerät unterstützt keine GPS-Ortung.'
    )
    return
  }

  /*
     Alten GPS-Watcher sicher beenden
  */
  if (watchIdRef.current !== null) {
    navigator.geolocation.clearWatch(
      watchIdRef.current
    )

    watchIdRef.current = null
  }

  setError('')

  watchIdRef.current =
    navigator.geolocation.watchPosition(
      (position) => {
        const {
          latitude,
          longitude,
          altitude,
          accuracy,
        } = position.coords

        /*
           Ungenaue GPS-Werte ignorieren
        */
        if (
          accuracy !== null &&
          accuracy !== undefined &&
          accuracy > 100
        ) {
          return
        }

        const newPosition = {
          lat: latitude,
          lon: longitude,
          altitude:
            altitude ?? null,
          accuracy:
            accuracy ?? null,
          time: Date.now(),
        }

        /*
           Aktuelle Position immer anzeigen
        */
        setCurrentPosition(newPosition)

        /*
           Nur während einer aktiven,
           nicht pausierten Tour tracken
        */
        if (
          !recordingRef.current ||
          pausedRef.current
        ) {
          return
        }

        /*
           Erste GPS-Position
        */
        if (!lastPositionRef.current) {
          lastPositionRef.current =
            newPosition

          const firstPoint = {
            lat: latitude,
            lon: longitude,
          }

          trackRef.current = [
            firstPoint,
          ]

          setTrack([
            firstPoint,
          ])

          return
        }

        const previous =
          lastPositionRef.current

        /*
           Entfernung zum letzten Punkt
        */
        const meters =
          calculateDistance(
            previous.lat,
            previous.lon,
            latitude,
            longitude
          )

        /*
           Kleine GPS-Sprünge ignorieren.
           Sehr große Sprünge ebenfalls.
        */
        if (
          meters > 2 &&
          meters < 200
        ) {
          setDistance(
            (value) =>
              value + meters
          )

          const newPoint = {
            lat: latitude,
            lon: longitude,
          }

          trackRef.current = [
            ...trackRef.current,
            newPoint,
          ]

          setTrack([
            ...trackRef.current,
          ])
        }

        /*
           Höhenmeter berechnen
        */
        if (
          altitude !== null &&
          altitude !== undefined &&
          previous.altitude !== null &&
          previous.altitude !== undefined
        ) {
          const difference =
            altitude -
            previous.altitude

          /*
             Nur realistische positive
             Höhenänderungen berücksichtigen
          */
          if (
            difference > 1 &&
            difference < 100
          ) {
            setElevation(
              (value) =>
                value + difference
            )
          }
        }

        /*
           Letzte Position aktualisieren
        */
        lastPositionRef.current =
          newPosition
      },

      (gpsError) => {
        console.error(
          'GPS Fehler:',
          gpsError
        )

        if (gpsError.code === 1) {
          setError(
            'GPS-Berechtigung wurde verweigert. Bitte Standortzugriff erlauben.'
          )
        } else if (gpsError.code === 2) {
          setError(
            'GPS-Position konnte nicht ermittelt werden.'
          )
        } else if (gpsError.code === 3) {
          setError(
            'GPS-Anfrage hat zu lange gedauert.'
          )
        } else {
          setError(
            'GPS konnte nicht ermittelt werden.'
          )
        }
      },

      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 15000,
      }
    )
}

  /* =====================================================
     START
  ===================================================== */

 const startRecording = () => {
  setRecording(true)
  setPaused(false)

  recordingRef.current = true
  pausedRef.current = false

  setSeconds(0)
  setDistance(0)
  setElevation(0)

  setCurrentPosition(null)
  setTrack([])

  setError('')
  setFollowPosition(true)

  lastPositionRef.current = null
  trackRef.current = []

  startGPS()
}

  /* =====================================================
     PAUSE
  ===================================================== */

 const togglePause = () => {
  const newPausedState = !pausedRef.current

  pausedRef.current = newPausedState
  setPaused(newPausedState)
}

  /* =====================================================
     BEENDEN
  ===================================================== */

const finishRecording = async () => {
  recordingRef.current = false
pausedRef.current = false
  if (watchIdRef.current !== null) {
    navigator.geolocation.clearWatch(
      watchIdRef.current
    )

    watchIdRef.current = null
  }

  if (timerRef.current) {
    clearInterval(timerRef.current)
    timerRef.current = null
  }

  /*
     Tourdaten vorbereiten
  */

  const tour = {
    id: Date.now(),

    name:
      tourName.trim() ||
      'Meine MTB Tour',

    date:
      new Date().toISOString(),

    duration: seconds,

    distance:
      distance / 1000,

    elevation:
      Math.round(elevation),

    track:
      trackRef.current,
  }

  /*
     Tour speichern
  */

  const {
  data: { user },
  error: userError,
} = await supabase.auth.getUser()

if (userError) {
  throw userError
}

if (!user) {
  setError('Du bist nicht eingeloggt.')
  return
}

const { error: saveError } = await supabase
  .from('tours')
  .insert({
    user_id: user.id,
    title:
      tourName.trim() ||
      'Meine MTB Tour',
    started_at: tour.date,
    duration_s: tour.duration,
    distance_m: tour.distance * 1000,
    elevation_gain_m: tour.elevation,
  })

if (saveError) {
  console.error(
    'Tour konnte nicht gespeichert werden:',
    saveError
  )

  setError(
    'Tour konnte nicht gespeichert werden.'
  )

  return
}

  /*
     Dialog schließen
  */

  setShowSaveDialog(false)
  setTourName('')

  setRecording(false)
  setPaused(false)

  /*
     Zur Touren-Seite
  */

  if (onFinish) {
    onFinish(tour)
  }
}


  /* =====================================================
     AUFRÄUMEN
  ===================================================== */

  useEffect(() => {
    return () => {
      if (
        watchIdRef.current !== null
      ) {
        navigator.geolocation.clearWatch(
          watchIdRef.current
        )

        watchIdRef.current = null
      }

      if (timerRef.current) {
        clearInterval(
          timerRef.current
        )

        timerRef.current = null
      }
    }
  }, [])

  /* =====================================================
     ZEIT FORMATIEREN
  ===================================================== */

  const formatTime = (
    totalSeconds
  ) => {
    const hours =
      Math.floor(
        totalSeconds / 3600
      )

    const minutes =
      Math.floor(
        (totalSeconds % 3600) / 60
      )

    const secondsLeft =
      totalSeconds % 60

    return [
      hours
        .toString()
        .padStart(2, '0'),

      minutes
        .toString()
        .padStart(2, '0'),

      secondsLeft
        .toString()
        .padStart(2, '0'),
    ].join(':')
  }

  /* =====================================================
     KARTE
  ===================================================== */

  const renderMap = () => {
    /*
       Noch kein GPS:
       Deutschland als Startansicht
    */

    const mapCenter =
      currentPosition
        ? [
            currentPosition.lat,
            currentPosition.lon,
          ]
        : [49.79, 9.95]

    return (
      <div className="record-map-wrapper">

        <MapContainer
          center={mapCenter}
          zoom={currentPosition ? 16 : 6}
          scrollWheelZoom={true}
          className="record-map"
        >

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {currentPosition && (
            <MapFollower
              position={currentPosition}
              follow={followPosition}
            />
          )}

          {track.length > 1 && (
            <Polyline
              positions={track.map(
                (point) => [
                  point.lat,
                  point.lon,
                ]
              )}
              pathOptions={{
                weight: 6,
              }}
            />
          )}

          {currentPosition && (
            <CircleMarker
              center={[
                currentPosition.lat,
                currentPosition.lon,
              ]}
              radius={10}
              pathOptions={{
                weight: 4,
              }}
            />
          )}

        </MapContainer>

        {currentPosition && (
          <button
            className="map-follow-button"
            onClick={() =>
              setFollowPosition(
                true
              )
            }
          >
            📍 Meine Position
          </button>
        )}

      </div>
    )
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <section className="page recording-page">

      <p className="eyebrow">
        MTB TRACKER
      </p>

      <h1>
        Tour aufzeichnen
      </h1>

      {!recording ? (

        <div className="record-start-card">

          <div className="record-big-icon">
            🚵
          </div>

          <h2>
            Bereit für deine Tour?
          </h2>

          <p>
            Deine GPS-Position wird
            während der Fahrt
            aufgezeichnet.
          </p>

          <button
            className="record-start-button"
            onClick={
              startRecording
            }
          >
            ▶ AUFZEICHNUNG STARTEN
          </button>

          <small>
            GPS-Berechtigung wird
            benötigt.
          </small>

        </div>

      ) : (

        <>

          <div
            className={
              'record-status ' +
              (paused
                ? 'paused'
                : 'active')
            }
          >

            <span className="record-dot" />

            {paused
              ? 'PAUSIERT'
              : 'AUFZEICHNUNG LÄUFT'}

          </div>

          {/* =========================================
              KARTE
          ========================================= */}

          {renderMap()}

          {/* =========================================
              STATISTIKEN
          ========================================= */}

          <div className="record-stats">

            <div className="record-stat">

              <strong>
                {formatTime(
                  seconds
                )}
              </strong>

              <span>
                ZEIT
              </span>

            </div>

            <div className="record-stat">

              <strong>
                {(
                  distance / 1000
                ).toFixed(2)}
              </strong>

              <span>
                KM
              </span>

            </div>

            <div className="record-stat">

              <strong>
                {Math.round(
                  elevation
                )}
              </strong>

              <span>
                HM
              </span>

            </div>

          </div>

          {/* =========================================
              GPS INFO
          ========================================= */}

          <div className="record-location-card">

            <div className="record-location-icon">
              📍
            </div>

            <div>

              <strong>
                GPS aktiv
              </strong>

              {currentPosition ? (

                <span>
                  Genauigkeit verfügbar
                  {' · '}
                  {currentPosition.lat.toFixed(5)}
                  {' · '}
                  {currentPosition.lon.toFixed(5)}
                </span>

              ) : (

                <span>
                  Warte auf GPS...
                </span>

              )}

            </div>

          </div>

          {error && (
            <div className="record-error">
              ⚠️ {error}
            </div>
          )}

          {/* =========================================
              BUTTONS
          ========================================= */}

          <div className="record-controls">

            <button
              className="record-pause-button"
              onClick={
                togglePause
              }
            >
              {paused
                ? '▶ WEITER'
                : '⏸ PAUSE'}
            </button>

           
<button
  className="record-stop-button"
  onClick={() => {
    setTourName('')
    setShowSaveDialog(true)
  }}
>
  ⏹ TOUR BEENDEN
</button>


          </div>

        </>

      )}
      
{showSaveDialog && (
  <div className="tour-save-overlay">

    <div className="tour-save-dialog">

      <div className="tour-save-icon">
        🚵
      </div>

      <p className="eyebrow">
        TOUR BEENDET
      </p>

      <h2>
        Wie soll deine Tour heißen?
      </h2>

      <p className="tour-save-description">
        Gib deiner Tour einen Namen,
        damit du sie später wiederfindest.
      </p>

      <input
        type="text"
        value={tourName}
        onChange={(event) =>
          setTourName(
            event.target.value
          )
        }
        placeholder="z. B. Blue-Line"
        maxLength={40}
        autoFocus
      />

      <div className="tour-save-buttons">

        <button
          className="tour-cancel-button"
          onClick={() =>
            setShowSaveDialog(false)
          }
        >
          ABBRECHEN
        </button>

        <button
          className="tour-save-button"
          onClick={finishRecording}
        >
          ✓ TOUR SPEICHERN
        </button>

      </div>

    </div>

  </div>
)}

    </section>
  )
}

export default RecordingPage
