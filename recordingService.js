import { supabase } from "./supabaseClient"

let watchId = null
let startTime = null
let lastPosition = null
let totalDistance = 0
let routePoints = []

const toRadians = (value) => {
  return (value * Math.PI) / 180
}

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371

  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export const startRecording = async () => {
  if (!navigator.geolocation) {
    throw new Error(
      "Dein Gerät unterstützt keine GPS-Ortung."
    )
  }

  if (watchId !== null) {
    return
  }

  startTime = Date.now()
  lastPosition = null
  totalDistance = 0
  routePoints = []

  await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude,
          timestamp: new Date().toISOString(),
        }

        lastPosition = point
        routePoints.push(point)

        resolve()
      },
      (error) => {
        reject(
          new Error(
            "GPS konnte nicht gestartet werden: " +
              error.message
          )
        )
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    )
  })

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const point = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        altitude: position.coords.altitude,
        timestamp: new Date().toISOString(),
      }

      if (lastPosition) {
        const distance = calculateDistance(
          lastPosition.latitude,
          lastPosition.longitude,
          point.latitude,
          point.longitude
        )

        // Kleine GPS-Sprünge ignorieren
        if (distance >= 0.003) {
          totalDistance += distance
          routePoints.push(point)
          lastPosition = point
        }
      } else {
        routePoints.push(point)
        lastPosition = point
      }
    },
    (error) => {
      console.error("GPS-Fehler:", error)
    },
    {
      enableHighAccuracy: true,
      maximumAge: 2000,
      timeout: 10000,
    }
  )
}

export const getRecordingStatus = async () => {
  if (!startTime) {
    return {
      distance: 0,
      duration: 0,
    }
  }

  return {
    distance: totalDistance,
    duration: (Date.now() - startTime) / 1000,
  }
}

export const stopRecording = async () => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId)
    watchId = null
  }

  if (!startTime) {
    return null
  }

  const duration = Math.floor(
    (Date.now() - startTime) / 1000
  )

  const distance = Number(totalDistance.toFixed(3))

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    throw new Error(
      "Benutzer konnte nicht geladen werden."
    )
  }

  if (!user) {
    throw new Error(
      "Du bist nicht eingeloggt."
    )
  }

  const tour = {
    user_id: user.id,
    distance_km: distance,
    duration_seconds: duration,
    route: routePoints,
    created_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from("tours")
    .insert(tour)
    .select()
    .single()

  if (error) {
    console.error("Supabase Fehler:", error)

    throw new Error(
      "Tour konnte nicht gespeichert werden: " +
        error.message
    )
  }

  startTime = null
  lastPosition = null
  totalDistance = 0
  routePoints = []

  return data
}