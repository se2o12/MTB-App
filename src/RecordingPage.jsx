
import { useEffect, useRef, useState } from 'react'
import { supabase } from './supabaseClient'
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  useMap,
} from 'react-leaflet'

import { registerPlugin } from '@capacitor/core'

const BackgroundGeolocation =
  registerPlugin('BackgroundGeolocation')

import 'leaflet/dist/leaflet.css'

const isNativeIOS =
  window.Capacitor?.isNativePlatform?.() &&
  window.Capacitor?.getPlatform?.() === 'ios'

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
  const backgroundWatcherRef = useRef(null)

  const lastPositionRef = useRef(null)
  const trackRef = useRef([])
  const startTimeRef = useRef(null)
const pausedTimeRef = useRef(0)
const lastActiveTimeRef = useRef(Date.now())

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
  if (!recording || paused) {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    return
  }

  if (!startTimeRef.current) {
    startTimeRef.current = Date.now()
  }

  timerRef.current = setInterval(() => {
    const elapsed = Math.floor(
      (Date.now() - startTimeRef.current) / 1000
    )

    setSeconds(elapsed)
  }, 1000)

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

const startGPS = async () => {
  setError('')

  const isNativeIOS =
    window.Capacitor?.isNativePlatform?.() &&
    window.Capacitor?.getPlatform?.() === 'ios'

  // iPhone-App mit Background-GPS
  if (isNativeIOS) {
    try {
      if (backgroundWatcherRef.current !== null) {
        await BackgroundGeolocation.removeWatcher({
          id: backgroundWatcherRef.current,
        })

        backgroundWatcherRef.current = null
      }

      const watcherId =
        await BackgroundGeolocation.addWatcher(
          {
            backgroundTitle: 'MTB Community',
            backgroundMessage:
              'Deine MTB-Tour wird im Hintergrund aufgezeichnet.',
            requestPermissions: true,
            stale: false,
            distanceFilter: 2,
          },

          (location, gpsError) => {
            if (gpsError) {
              console.error(
                'Background GPS Fehler:',
                gpsError
              )

              if (
                gpsError.code === 'NOT_AUTHORIZED'
              ) {
                setError(
                  'GPS-Berechtigung fehlt. Bitte Standortzugriff in den iPhone-Einstellungen erlauben.'
                )

                BackgroundGeolocation.openSettings()
              } else {
                setError(
                  'GPS konnte nicht ermittelt werden.'
                )
              }

              return
            }

            if (!location) return

            const {
              latitude,
              longitude,
              altitude,
              accuracy,
            } = location

            if (
              accuracy !== null &&
              accuracy !== undefined &&
              accuracy > 100
            ) {
              return
            }

            const newPosition = {
              lat: Number(latitude),
              lon: Number(longitude),
              altitude:
                altitude ?? null,
              accuracy:
                accuracy ?? null,
              time:
                location.time ??
                Date.now(),
            }

            setCurrentPosition(
              newPosition
            )

            if (
              !recordingRef.current ||
              pausedRef.current
            ) {
              return
            }

            if (!lastPositionRef.current) {
              lastPositionRef.current =
                newPosition

              const firstPoint = {
                lat: Number(latitude),
                lon: Number(longitude),
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

            const meters =
              calculateDistance(
                previous.lat,
                previous.lon,
                latitude,
                longitude
              )

            if (
              meters > 2 &&
              meters < 200
            ) {
              setDistance(
                (value) =>
                  value + meters
              )

              const newPoint = {
                lat: Number(latitude),
                lon: Number(longitude),
              }

              trackRef.current.push(
                newPoint
              )

              setTrack([
                ...trackRef.current,
              ])
            }

            if (
              altitude !== null &&
              altitude !== undefined &&
              previous.altitude !== null &&
              previous.altitude !== undefined
            ) {
              const difference =
                altitude -
                previous.altitude

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

            lastPositionRef.current =
              newPosition
          }
        )

      backgroundWatcherRef.current =
        watcherId

      console.log(
        'Background GPS gestartet:',
        watcherId
      )
    } catch (gpsError) {
      console.error(
        'Background GPS konnte nicht gestartet werden:',
        gpsError
      )

      setError(
        'GPS konnte nicht gestartet werden.'
      )
    }

    return
  }

  // Browser-Fallback
  if (!navigator.geolocation) {
    setError(
      'Dein Gerät unterstützt keine GPS-Ortung.'
    )
    return
  }

  if (watchIdRef.current !== null) {
    navigator.geolocation.clearWatch(
      watchIdRef.current
    )

    watchIdRef.current = null
  }

  watchIdRef.current =
    navigator.geolocation.watchPosition(
      (position) => {
        const {
          latitude,
          longitude,
          altitude,
          accuracy,
        } = position.coords

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

        setCurrentPosition(
          newPosition
        )

        if (
          !recordingRef.current ||
          pausedRef.current
        ) {
          return
        }

        if (!lastPositionRef.current) {
          lastPositionRef.current =
            newPosition

          const firstPoint = {
            lat: Number(latitude),
            lon: Number(longitude),
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

        const meters =
          calculateDistance(
            previous.lat,
            previous.lon,
            latitude,
            longitude
          )

        if (
          meters > 2 &&
          meters < 200
        ) {
          setDistance(
            (value) =>
              value + meters
          )

          const newPoint = {
            lat: Number(latitude),
            lon: Number(longitude),
          }

          trackRef.current.push(
            newPoint
          )

          setTrack([
            ...trackRef.current,
          ])
        }

        if (
          altitude !== null &&
          altitude !== undefined &&
          previous.altitude !== null &&
          previous.altitude !== undefined
        ) {
          const difference =
            altitude -
            previous.altitude

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

        lastPositionRef.current =
          newPosition
      },

      (gpsError) => {
        console.error(
          'GPS Fehler:',
          gpsError
        )

        setError(
          'GPS konnte nicht ermittelt werden.'
        )
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
  startTimeRef.current = Date.now()

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
  /* =====================================================
     GPS + TIMER STOPPEN
  ===================================================== */

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

  /* =====================================================
     GPS-STRECKE SICHER KOPIEREN
  ===================================================== */

  const savedTrack = Array.isArray(trackRef.current)
    ? trackRef.current.map((point) => ({
        lat: Number(point.lat),
        lon: Number(point.lon),
      }))
    : []

  console.log(
    'GPS-Punkte gespeichert:',
    savedTrack.length
  )

  /* =====================================================
     TOUR ERSTELLEN
  ===================================================== */

  const tour = {
  id: Date.now(),

  name:
    tourName.trim() ||
    'Meine MTB Tour',

  date:
    new Date().toISOString(),

  duration:
    seconds,

  distance:
    distance / 1000,

  elevation:
    Math.round(elevation),

  // Die komplette GPS-Strecke
  track: savedTrack,

  // Kompatibilität mit älteren Touren
  route: savedTrack,
}

  /* =====================================================
     SOFORT LOKAL SPEICHERN
  ===================================================== */

  try {
    const storedTours =
      localStorage.getItem('mtb_tours')

    let existingTours = []

    if (storedTours) {
      try {
        existingTours =
          JSON.parse(storedTours)
      } catch {
        existingTours = []
      }
    }

    if (!Array.isArray(existingTours)) {
      existingTours = []
    }

    const updatedTours = [
      tour,
      ...existingTours,
    ]

    localStorage.setItem(
      'mtb_tours',
      JSON.stringify(updatedTours)
    )

    console.log(
      'Tour lokal gespeichert:',
      tour
    )

  } catch (storageError) {

    console.error(
      'LocalStorage Fehler:',
      storageError
    )

    setError(
      'Die Tour konnte nicht gespeichert werden.'
    )

    return
  }

  /* =====================================================
     UI SOFORT ZURÜCKSETZEN
  ===================================================== */

  setShowSaveDialog(false)
  setTourName('')

  setRecording(false)
  setPaused(false)

  /* =====================================================
     DIREKT ZUR TOUREN-SEITE
  ===================================================== */

  if (onFinish) {
    onFinish(tour)
  }

  /* =====================================================
     SUPABASE IM HINTERGRUND
  ===================================================== */

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error(
        'Benutzer konnte nicht geladen werden:',
        userError
      )

      return
    }

    if (!user) {
      console.log(
        'Kein eingeloggter Benutzer – nur lokal gespeichert.'
      )

      return
    }

    const { error: saveError } =
      await supabase
        .from('tours')
        .insert({
          user_id: user.id,

          title:
            tour.name,

          started_at:
            tour.date,

          duration_s:
            tour.duration,

          distance_m:
            Math.round(
              tour.distance * 1000
            ),

          elevation_gain_m:
            tour.elevation,

          track:
            savedTrack,
        })

    if (saveError) {
      console.error(
        'Supabase-Speicherung fehlgeschlagen:',
        saveError
      )
    } else {
      console.log(
        'Tour auch in Supabase gespeichert.'
      )
    }

  } catch (supabaseError) {

    console.error(
      'Supabase-Fehler:',
      supabaseError
    )

    // Die lokale Tour bleibt trotzdem gespeichert.
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
