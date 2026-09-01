import { useEffect, useState } from 'react'
import { supabase } from './supabase'

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor(
    (seconds % 3600) / 60
  )

  if (hours > 0) {
    return `${hours} h ${minutes} min`
  }

  return `${minutes} min`
}

function formatDistance(meters) {
  return `${(meters / 1000).toFixed(2)} km`
}

function formatDate(dateString) {
  if (!dateString) return ''

  return new Date(
    dateString
  ).toLocaleDateString(
    'de-DE',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }
  )
}

export default function ToursPage() {
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadTours = async () => {
    setLoading(true)
    setError('')

    try {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (userError) {
        throw userError
      }

      if (!user) {
        setTours([])
        return
      }

      const { data, error } =
        await supabase
          .from('tours')
          .select('*')
          .eq('user_id', user.id)
          .order(
            'created_at',
            { ascending: false }
          )

      if (error) {
        throw error
      }

      setTours(data ?? [])
    } catch (loadError) {
      console.error(
        'Touren konnten nicht geladen werden:',
        loadError
      )

      setError(
        'Touren konnten nicht geladen werden.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTours()
  }, [])

  if (loading) {
    return (
      <div className="page">
        <h1>Meine Touren</h1>

        <div className="bikepark-loading">
          Touren werden geladen...
        </div>
      </div>
    )
  }

  return (
    <div className="page">

      <div className="section-heading">
        <div>
          <p className="eyebrow">
            DEINE FAHRTEN
          </p>

          <h1>
            Meine Touren
          </h1>
        </div>

        <button
          onClick={loadTours}
          className="refresh-bikeparks"
        >
          ↻
        </button>
      </div>

      {error && (
        <div className="recording-error">
          {error}
        </div>
      )}

      {tours.length === 0 ? (
        <div className="empty-friends">

          <span>🚵</span>

          <strong>
            Noch keine Touren
          </strong>

          <small>
            Starte deine erste GPS-Aufzeichnung.
          </small>

        </div>
      ) : (
        <div className="tour-list">

          {tours.map((tour) => (
            <div
              className="saved-tour"
              key={tour.id}
            >

              <div className="saved-tour-image">
                🚵
              </div>

              <div>

                <span className="eyebrow">
                  MTB TOUR
                </span>

                <h3>
                  {tour.title}
                </h3>

                <p>
                  📏{' '}
                  {formatDistance(
                    tour.distance_m
                  )}
                  {' · '}
                  ⏱️{' '}
                  {formatDuration(
                    tour.duration_s
                  )}
                </p>

                <span className="tour-date">
                  {formatDate(
                    tour.started_at
                  )}
                </span>

                <div className="tour-stats">

                  <div>
                    <strong>
                      {Number(
                        tour.avg_speed_kmh
                      ).toFixed(1)}
                    </strong>

                    <span>
                      KM/H
                    </span>

                    <small>
                      Durchschnitt
                    </small>
                  </div>

                  <div>
                    <strong>
                      {Number(
                        tour.max_speed_kmh
                      ).toFixed(1)}
                    </strong>

                    <span>
                      KM/H
                    </span>

                    <small>
                      Maximum
                    </small>
                  </div>

                  <div>
                    <strong>
                      {Math.round(
                        tour.elevation_gain_m
                      )}
                    </strong>

                    <span>
                      M
                    </span>

                    <small>
                      Höhenmeter
                    </small>
                  </div>

                </div>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  )
}