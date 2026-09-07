import { useEffect, useState } from 'react'

function TourResultPage({
  tour,
  profile,
  onComplete,
}) {
  const [visibleLines, setVisibleLines] = useState(0)
  const [showTotal, setShowTotal] = useState(false)
  const [progress, setProgress] = useState(0)

  const distanceXP = Math.floor(
    Number(tour?.distance) || 0
  )

  const elevationXP = Math.floor(
    (Number(tour?.elevation) || 0) / 10
  )

  const completionXP = 25

  const difficultyXP =
    Number(tour?.difficultyXP) || 0

  const totalXP =
    distanceXP +
    elevationXP +
    difficultyXP +
    completionXP

  const currentXP =
    Number(profile?.points) || 0

  const newXP = currentXP + totalXP

  const getProgress = (xp) => {
  const ranks = [
    { points: 0 },
    { points: 500 },
    { points: 1000 },
    { points: 1500 },
    { points: 2000 },
    { points: 2500 },
    { points: 3000 },
    { points: 4000 },
    { points: 5000 },
    { points: 6500 },
  ]

  let current = ranks[0]
  let next = null

  for (const rank of ranks) {
    if (xp >= rank.points) {
      current = rank
    }
  }

  for (const rank of ranks) {
    if (rank.points > current.points) {
      next = rank
      break
    }
  }

  if (!next) return 100

  return Math.min(
    100,
    Math.max(
      0,
      ((xp - current.points) /
        (next.points - current.points)) *
        100
    )
  )
}

const currentProgress = getProgress(currentXP)
const newProgress = getProgress(newXP)

  useEffect(() => {
    const timers = []

    timers.push(
      setTimeout(() => setVisibleLines(1), 500)
    )

    timers.push(
      setTimeout(() => setVisibleLines(2), 1300)
    )

    timers.push(
      setTimeout(() => setVisibleLines(3), 2100)
    )

    timers.push(
      setTimeout(() => setVisibleLines(4), 2900)
    )

    timers.push(
      setTimeout(() => setShowTotal(true), 3900)
    )

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [])

  useEffect(() => {
  if (!showTotal) return

  setProgress(currentProgress)

  const timer = setTimeout(() => {
    setProgress(newProgress)
  }, 400)

  return () => clearTimeout(timer)
}, [showTotal, currentProgress, newProgress])

  if (!tour) return null

  return (
    <section className="page tour-result-page">

      <p className="eyebrow">
        TOUR AUSWERTUNG
      </p>

      <h1>
        Tour abgeschlossen! 🏁
      </h1>

      <p className="tour-result-description">
        Deine Tour wurde erfolgreich ausgewertet.
      </p>

      <div className="xp-result-card">

        {visibleLines >= 1 && (
          <div className="xp-result-line">
            <span>📏 Distanz</span>
            <strong>
              +{distanceXP} XP
            </strong>
          </div>
        )}

        {visibleLines >= 2 && (
          <div className="xp-result-line">
            <span>⛰️ Höhenmeter</span>
            <strong>
              +{elevationXP} XP
            </strong>
          </div>
        )}

        {visibleLines >= 3 && (
          <div className="xp-result-line">
            <span>
              🔴 Trail Schwierigkeit
              {tour.difficulty && (
                <> ({tour.difficulty})</>
              )}
            </span>

            <strong>
              +{difficultyXP} XP
            </strong>
          </div>
        )}

        {visibleLines >= 4 && (
          <div className="xp-result-line">
            <span>🏁 Tour abgeschlossen</span>

            <strong>
              +{completionXP} XP
            </strong>
          </div>
        )}

        {showTotal && (
          <>
            <div className="xp-total">
              <span>⭐ GESAMT</span>

              <strong>
                +{totalXP} XP
              </strong>
            </div>

            <div className="xp-progress-section">

              <div className="xp-progress-info">
                <span>
                  {currentXP} XP
                </span>

                <span>
                  {newXP} XP
                </span>
              </div>

              <div className="xp-progress-bar">
                <div
                  className="xp-progress-fill"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

            </div>
          </>
        )}

      </div>

      {showTotal && (
        <button
          className="create-button"
          onClick={() => onComplete(totalXP)}
        >
          WEITER
          <span>→</span>
        </button>
      )}

    </section>
  )
}

export default TourResultPage