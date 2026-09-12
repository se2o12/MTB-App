import {
  useEffect,
  useState,
  useRef
} from 'react'
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

import TourResultPage from './TourResultPage'

let notificationAudioContext = null

function unlockNotificationAudio() {
  try {
    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext

    if (!AudioContext) return

    if (!notificationAudioContext) {
      notificationAudioContext =
        new AudioContext()
    }

    if (
      notificationAudioContext.state ===
      'suspended'
    ) {
      notificationAudioContext.resume()
    }
  } catch (error) {
    console.error(
      'Audio freischalten:',
      error
    )
  }
}

function playNotificationSound(sound = 'pulse') {
  try {
    if (!notificationAudioContext) {
      unlockNotificationAudio()
    }

    if (!notificationAudioContext) return

    if (
      notificationAudioContext.state ===
      'suspended'
    ) {
      notificationAudioContext.resume()
      return
    }

    const audioContext =
      notificationAudioContext

    const now =
      audioContext.currentTime

    const playTone = (
      frequency,
      duration,
      type = 'sine',
      volume = 0.15,
      delay = 0
    ) => {
      const oscillator =
        audioContext.createOscillator()

      const gain =
        audioContext.createGain()

      oscillator.type = type

      oscillator.frequency.setValueAtTime(
        frequency,
        now + delay
      )

      gain.gain.setValueAtTime(
        0.001,
        now + delay
      )

      gain.gain.linearRampToValueAtTime(
        volume,
        now + delay + 0.02
      )

      gain.gain.linearRampToValueAtTime(
        0,
        now + delay + duration
      )

      oscillator.connect(gain)
      gain.connect(
        audioContext.destination
      )

      oscillator.start(
        now + delay
      )

      oscillator.stop(
        now +
          delay +
          duration +
          0.03
      )
    }

    if (sound === 'pulse') {
      playTone(
        600,
        0.14,
        'sine',
        0.18
      )

      playTone(
        850,
        0.16,
        'sine',
        0.14,
        0.08
      )
    }

    if (sound === 'echo') {
      playTone(
        650,
        0.16,
        'sine',
        0.16
      )

      playTone(
        650,
        0.16,
        'sine',
        0.12,
        0.18
      )
    }

    if (sound === 'boost') {
      playTone(
        360,
        0.16,
        'triangle',
        0.20
      )

      playTone(
        540,
        0.20,
        'triangle',
        0.16,
        0.08
      )
    }

    if (sound === 'signal') {
      playTone(
        900,
        0.09,
        'square',
        0.10
      )

      playTone(
        1200,
        0.11,
        'square',
        0.08,
        0.10
      )
    }
  } catch (error) {
    console.error(
      'Benachrichtigungston:',
      error
    )
  }
}

function playSelectedNotificationSound() {
  const enabled =
    localStorage.getItem(
      'mtb_notifications_enabled'
    ) === 'true'

  if (!enabled) return

  const selectedSound =
    localStorage.getItem(
      'mtb_notification_sound'
    ) || 'pulse'

  playNotificationSound(
    selectedSound
  )
}

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
   🏆 XP / RANGSYSTEM
===================================================== */

const RANKS = [
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

const getRankFromXP = (xp) => {
  const points = Number(xp) || 0

  let currentRank = RANKS[0]

  for (const rank of RANKS) {
    if (points >= rank.points) {
      currentRank = rank
    }
  }

  return currentRank
}

/* =====================================================
   APP
===================================================== */

function App() {
    useEffect(() => {
    const unlockAudio = () => {
      unlockNotificationAudio()
    }

    window.addEventListener(
      'pointerdown',
      unlockAudio,
      { once: true }
    )

    return () => {
      window.removeEventListener(
        'pointerdown',
        unlockAudio
      )
    }
  }, [])
  
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState('home')
  const [finishedTour, setFinishedTour] = useState(null)
  const [activeChat, setActiveChat] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [messageNotification, setMessageNotification] =
  useState(null)

  const lastNotificationMessageId =
    useRef(null)

  const notificationInitialized =
    useRef(false)

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
    notificationInitialized.current = false
    lastNotificationMessageId.current = null
    setMessageNotification(null)
    return
  }

  let cancelled = false

const checkForNewMessage = async () => {
  const notificationsEnabled =
    localStorage.getItem(
      'mtb_notifications_enabled'
    ) === 'true'

  if (!notificationsEnabled) {
    return
  }

  // =========================
  // FREUNDES-NACHRICHTEN
  // =========================

  const {
    data: friendMessages,
    error: friendError,
  } = await supabase
    .from('messages')
    .select(
      'id, sender_id, receiver_id, content, created_at'
    )
    .eq('receiver_id', session.user.id)
    .order('created_at', {
      ascending: false,
    })
    .limit(1)

  if (cancelled) return

  if (friendError) {
    console.error(
      'Nachrichten-Benachrichtigung:',
      friendError
    )
  }

  // =========================
  // COMMUNITY-NACHRICHTEN
  // =========================

  const {
    data: communityMessages,
    error: communityError,
  } = await supabase
    .from('community_messages')
    .select(
      'id, community_id, sender_id, content, created_at'
    )
    .order('created_at', {
      ascending: false,
    })
    .limit(1)

  if (cancelled) return

  if (communityError) {
    console.error(
      'Community-Benachrichtigung:',
      communityError
    )
  }

  const newestFriendMessage =
    friendMessages?.[0]

  const newestCommunityMessage =
    communityMessages?.[0]

  // Beide Nachrichten zusammenführen
  const allMessages = [
    newestFriendMessage
      ? {
          ...newestFriendMessage,
          notificationType: 'friend',
        }
      : null,

    newestCommunityMessage
      ? {
          ...newestCommunityMessage,
          notificationType: 'community',
        }
      : null,
  ].filter(Boolean)

  if (allMessages.length === 0) {
    return
  }

  // Neueste Nachricht bestimmen
  allMessages.sort(
    (a, b) =>
      new Date(b.created_at) -
      new Date(a.created_at)
  )

  const newestMessage = allMessages[0]

  // Beim ersten Laden nur aktuelle Nachricht merken
  if (!notificationInitialized.current) {
    lastNotificationMessageId.current =
      newestMessage.notificationType +
      '-' +
      newestMessage.id

    notificationInitialized.current = true
    return
  }

  const notificationId =
    newestMessage.notificationType +
    '-' +
    newestMessage.id

  // Nichts Neues
  if (
    notificationId ===
    lastNotificationMessageId.current
  ) {
    return
  }

  lastNotificationMessageId.current =
    notificationId

  // =========================
  // FREUND
  // =========================

  if (
    newestMessage.notificationType ===
    'friend'
  ) {
    // Eigene Nachrichten niemals melden
    if (
      newestMessage.sender_id ===
      session.user.id
    ) {
      return
    }

    const {
      data: senderProfile,
    } = await supabase
      .from('profiles')
      .select('id, name, image')
      .eq(
        'id',
        newestMessage.sender_id
      )
      .single()

    if (cancelled) return

    // Wenn wir bereits mit diesem Freund chatten
    if (
      activeChat?.id ===
      newestMessage.sender_id
    ) {
      return
    }

    setMessageNotification({
      id: notificationId,
      type: 'friend',
      senderId:
        newestMessage.sender_id,
      senderName:
        senderProfile?.name ||
        'Jemand',
      senderImage:
        senderProfile?.image || null,
      content:
        newestMessage.content || '',
    })
  }

  // =========================
  // COMMUNITY
  // =========================

  if (
    newestMessage.notificationType ===
    'community'
  ) {
    // Eigene Community-Nachrichten niemals melden
    if (
      newestMessage.sender_id ===
      session.user.id
    ) {
      return
    }

    // Prüfen, ob der User überhaupt Mitglied der Community ist
    const {
      data: membership,
    } = await supabase
      .from('community_members')
      .select('id')
      .eq(
        'community_id',
        newestMessage.community_id
      )
      .eq(
        'user_id',
        session.user.id
      )
      .maybeSingle()

    if (cancelled) return

    // Keine Benachrichtigung für Communities,
    // in denen wir nicht Mitglied sind
    if (!membership) {
      return
    }

    const {
      data: senderProfile,
    } = await supabase
      .from('profiles')
      .select('id, name, image')
      .eq(
        'id',
        newestMessage.sender_id
      )
      .single()

    const {
      data: community,
    } = await supabase
      .from('communities')
      .select('id, name')
      .eq(
        'id',
        newestMessage.community_id
      )
      .single()

    if (cancelled) return

    setMessageNotification({
      id: notificationId,
      type: 'community',
      senderId:
        newestMessage.sender_id,
      senderName:
        senderProfile?.name ||
        'Jemand',
      senderImage:
        senderProfile?.image || null,
      communityId:
        newestMessage.community_id,
      communityName:
        community?.name ||
        'Community',
      content:
        newestMessage.content || '',
    })
  }

  // Banner nach 6 Sekunden schließen
  setTimeout(() => {
    setMessageNotification(
      (current) => {
        if (
          current?.id ===
          notificationId
        ) {
          return null
        }

        return current
      }
    )
  }, 6000)
}

  checkForNewMessage()

  const interval = setInterval(
    checkForNewMessage,
    2000
  )

  return () => {
    cancelled = true
    clearInterval(interval)
  }
}, [session, activeChat])

    const loadProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error(
        'Fehler beim Laden des Profils:',
        error
      )
      setProfile(null)
      return
    }

    setProfile(data)
  }

  useEffect(() => {
    if (!session?.user?.id) return

    loadProfile(session.user.id)
  }, [session])

  const uploadProfileImage = async (imageData) => {
    if (!imageData) return null

    // Already-uploaded URL: nothing to upload again.
    if (!imageData.startsWith('data:image/')) {
      return imageData
    }

    try {
      const response = await fetch(imageData)
      const blob = await response.blob()

      const filePath =
        `${session.user.id}/avatar-${Date.now()}.jpg`

      const { error: uploadError } =
        await supabase.storage
          .from('profile-images')
          .upload(filePath, blob, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: false,
          })

      if (uploadError) {
        console.error(
          'Profilbild-Upload fehlgeschlagen:',
          uploadError
        )
        alert(
          'Profilbild konnte nicht hochgeladen werden: ' +
            uploadError.message
        )
        return null
      }

      const { data: publicUrlData } =
        supabase.storage
          .from('profile-images')
          .getPublicUrl(filePath)

      return publicUrlData.publicUrl
    } catch (error) {
      console.error(
        'Profilbild-Upload fehlgeschlagen:',
        error
      )
      alert(
        'Profilbild konnte nicht hochgeladen werden.'
      )
      return null
    }
  }

  const saveProfile = async (newProfile) => {
    if (!session?.user) return

    const uploadedImage =
      await uploadProfileImage(newProfile.image)

    // If a new image was selected but the upload failed,
    // don't overwrite the existing profile picture.
    if (
      newProfile.image &&
      newProfile.image.startsWith('data:image/') &&
      !uploadedImage
    ) {
      return
    }

    const profileData = {
      id: session.user.id,
      name: newProfile.name,
      image: uploadedImage || null,
      points: newProfile.points ?? 0,
      level: newProfile.level ?? 1,
      rank: newProfile.rank ?? 'Trail Rider',
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

  const addXP = async (earnedXP) => {
  const xp = Number(earnedXP) || 0

  const currentXP =
    Number(profile?.points) || 0

  const newXP = currentXP + xp

  const newRank = getRankFromXP(newXP)

  const updatedProfile = {
    ...profile,
    points: newXP,
    level: newRank.level,
    rank: newRank.name,
  }

  setProfile(updatedProfile)

  if (!session?.user) {
    return
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      points: newXP,
      level: newRank.level,
      rank: newRank.name,
    })
    .eq('id', session.user.id)

  if (error) {
    console.error(
      'XP speichern fehlgeschlagen:',
      error
    )
  }
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
      {messageNotification && (
  <button
    type="button"
    className="message-notification"
    onClick={() => {
  if (
    messageNotification.type ===
    'community'
  ) {
    setMessageNotification(null)

    // Community öffnen
    // Die Community-Auswahl selbst wird in FriendsPage verwaltet.
    setActivePage('friends')

    return
  }

  const friend = {
    id: messageNotification.senderId,
    name: messageNotification.senderName,
    image: messageNotification.senderImage,
  }

  setMessageNotification(null)
  setActivePage('friends')
  setActiveChat(friend)
}}
  >
    <div className="message-notification-avatar">
      {messageNotification.senderImage ? (
        <img
          src={
            messageNotification.senderImage
          }
          alt=""
        />
      ) : (
        '👤'
      )}
    </div>

    <div className="message-notification-content">
      <strong>
        {messageNotification.senderName}
      </strong>

      <span>
  {messageNotification.type === 'community'
    ? `hat in ${messageNotification.communityName} geschrieben`
    : 'hat dir eine Nachricht geschrieben'}
</span>

      {messageNotification.content && (
        <small>
          {messageNotification.content}
        </small>
      )}
    </div>

    <span className="message-notification-arrow">
      →
    </span>
  </button>
)}

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
    profile={profile}
    onFinish={(tour) => {
      setActivePage('tour-result')
      setFinishedTour(tour)
    }}
  />
)}

{activePage === 'tour-result' && (
  <TourResultPage
    tour={finishedTour}
    onComplete={async (totalXP) => {
      await addXP(totalXP)

      setFinishedTour(null)
      setActivePage('home')
    }}
  />
)}

{activePage === 'stats' && (
  <StatsPage />
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

/* =====================================================
   LOGIN / REGISTRIERUNG
   E-MAIL + EINMAL-CODE
===================================================== */

function AuthPage() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('email')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const sendCode = async (event) => {
    event.preventDefault()

    const cleanEmail = email.trim().toLowerCase()

    setMessage('')

    if (!cleanEmail) {
      setMessage('Bitte deine E-Mail-Adresse eingeben.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: true,
      },
    })

    if (error) {
      console.error('OTP senden:', error)

      setMessage(
        'Code konnte nicht gesendet werden: ' +
          error.message
      )
    } else {
      setStep('code')
      setMessage(
        'Wir haben dir einen Code per E-Mail geschickt.'
      )
    }

    setLoading(false)
  }

  const verifyCode = async (event) => {
    event.preventDefault()

    const cleanEmail = email.trim().toLowerCase()
    const cleanCode = code.trim()

    setMessage('')

    if (!cleanCode) {
      setMessage('Bitte den Code eingeben.')
      return
    }

    setLoading(true)

    const { data, error } =
      await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanCode,
        type: 'email',
      })

    if (error) {
      console.error('OTP bestätigen:', error)

      setMessage(
        'Der Code ist ungültig oder abgelaufen.'
      )

      setLoading(false)
      return
    }

    if (data.session) {
      console.log('Login erfolgreich')
    }

    setLoading(false)
  }

  const resendCode = async () => {
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail) return

    setLoading(true)
    setMessage('')

    const { error } =
      await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
        },
      })

    if (error) {
      setMessage(
        'Code konnte nicht erneut gesendet werden: ' +
          error.message
      )
    } else {
      setMessage(
        'Ein neuer Code wurde an deine E-Mail gesendet.'
      )
    }

    setLoading(false)
  }

  const changeEmail = () => {
    setStep('email')
    setCode('')
    setMessage('')
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">

        <div className="setup-logo">
          <span>⌁</span>
          MTB
        </div>

        <div className="auth-badge">
          {step === 'email' ? '✉️' : '🔐'}
        </div>

        {step === 'email' ? (
          <>
            <h1>
              Willkommen! 👋
            </h1>

            <p className="setup-description">
              Gib deine E-Mail-Adresse ein und
              wir schicken dir einen Anmeldecode.
            </p>

            <form onSubmit={sendCode}>

              <label className="input-label">
                E-MAIL
              </label>

              <input
                className="name-input"
                type="email"
                placeholder="deine@email.de"
                value={email}
                autoComplete="email"
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoFocus
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
                  ? 'CODE WIRD GESENDET...'
                  : 'CODE ANFORDERN'}

                {!loading && (
                  <span>→</span>
                )}
              </button>

            </form>
          </>
        ) : (
          <>
            <h1>
              Code eingeben 🔐
            </h1>

            <p className="setup-description">
              Wir haben einen Anmeldecode an
              <strong> {email}</strong> geschickt.
            </p>

            <form onSubmit={verifyCode}>

              <label className="input-label">
                ANMELDECODE
              </label>

              <input
                className="name-input auth-code-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={code}
                maxLength={6}
                onChange={(event) =>
                  setCode(
                    event.target.value.replace(
                      /\D/g,
                      ''
                    )
                  )
                }
                autoFocus
              />

              {message && (
                <div className="auth-message">
                  {message}
                </div>
              )}

              <button
                className="create-button"
                type="submit"
                disabled={
                  loading ||
                  code.length < 6
                }
              >
                {loading
                  ? 'WIRD ANGEMELDET...'
                  : 'ANMELDEN'}

                {!loading && (
                  <span>→</span>
                )}
              </button>

            </form>

            <div className="auth-code-actions">

              <button
                className="auth-switch"
                type="button"
                onClick={resendCode}
                disabled={loading}
              >
                Code erneut senden
              </button>

              <button
                className="auth-switch"
                type="button"
                onClick={changeEmail}
                disabled={loading}
              >
                ← Andere E-Mail verwenden
              </button>

            </div>
          </>
        )}

        <p className="privacy-note">
          Kostenlos anmelden · Kein Passwort notwendig
        </p>

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
  const [cropImage, setCropImage] = useState(null)
  const fileInput = useRef(null)

  const chooseImage = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = () => {
      setCropImage(reader.result)
    }

    reader.readAsDataURL(file)
    event.target.value = ''
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

      {cropImage && (
        <ProfileImageCropper
          image={cropImage}
          onCancel={() => setCropImage(null)}
          onConfirm={(croppedImage) => {
            setImage(croppedImage)
            setCropImage(null)
          }}
        />
      )}
    </div>
  )
}

/* =====================================================
   HOME
===================================================== */
function MiniTourMap({ tour }) {
  const route =
    tour?.route ||
    tour?.track ||
    tour?.path ||
    tour?.coordinates ||
    []

  const points = route
    .map((point) => {
      if (Array.isArray(point)) {
        return [
          Number(point[0]),
          Number(point[1]),
        ]
      }

      return [
        Number(point.lat),
        Number(point.lon ?? point.lng),
      ]
    })
    .filter(
      ([lat, lon]) =>
        Number.isFinite(lat) &&
        Number.isFinite(lon)
    )

  if (points.length < 2) {
    return (
      <div className="mini-tour-map-empty">
        <span>🗺️</span>
        <small>Keine Route vorhanden</small>
      </div>
    )
  }

  const start = points[0]
  const end = points[points.length - 1]

  return (
    <MapContainer
      center={start}
      zoom={14}
      scrollWheelZoom={true}
      zoomControl={true}
      dragging={true}
      doubleClickZoom={true}
      touchZoom={true}
      className="mini-tour-map"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Polyline
        positions={points}
        pathOptions={{
          color: "#a5f51a",
          weight: 5,
          opacity: 0.95,
        }}
      />

      <CircleMarker
        center={start}
        radius={7}
        pathOptions={{
          color: "#ffffff",
          weight: 3,
          fillColor: "#a5f51a",
          fillOpacity: 1,
        }}
      />

      <CircleMarker
        center={end}
        radius={7}
        pathOptions={{
          color: "#ffffff",
          weight: 3,
          fillColor: "#ff4d4d",
          fillOpacity: 1,
        }}
      />
    </MapContainer>
  )
}

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

      <section className="rank-card rank-xp-card">

  {(() => {
    const currentXP = Number(profile?.points) || 0

    // Aktuellen Rang anhand der echten XP bestimmen
    const currentRank = getRankFromXP(currentXP)

    // Nächsten Rang finden
    const currentIndex = RANKS.findIndex(
      (rank) => rank.level === currentRank.level
    )

    const nextRank =
      currentIndex < RANKS.length - 1
        ? RANKS[currentIndex + 1]
        : null

    // XP innerhalb des aktuellen Rangs
    const currentRankXP = currentRank.points

    const nextRankXP = nextRank
      ? nextRank.points
      : currentRank.points

    const xpInRank =
      Math.max(0, currentXP - currentRankXP)

    const xpNeeded =
      Math.max(1, nextRankXP - currentRankXP)

    const progressPercent = nextRank
      ? Math.min(
          100,
          Math.max(
            0,
            (xpInRank / xpNeeded) * 100
          )
        )
      : 100

    return (
      <>
        <div className="rank-xp-header">

          {/* AKTUELLER RANG */}
          <div className="rank-xp-side current-rank">

            <img
              src={currentRank.icon}
              alt={currentRank.name}
            />

            <span>LVL {currentRank.level}</span>

          </div>


          {/* XP LEISTE */}
          <div className="rank-xp-main">

            <div className="rank-xp-title">
              <span></span>
              <strong>XP</strong>
              <span></span>
            </div>

            <div className="rank-xp-bar">

              <div
                className="rank-xp-fill"
                style={{
                  width: `${progressPercent}%`,
                }}
              />

            </div>

            <div className="rank-xp-numbers">

              <strong>
                {currentXP.toLocaleString('de-DE')}
              </strong>

              <span>
                {nextRank
                  ? ` / ${nextRank.points.toLocaleString('de-DE')}`
                  : ' XP MAX'}
              </span>

            </div>

          </div>


          {/* NÄCHSTER RANG */}
          <div className="rank-xp-side next-rank">

            {nextRank ? (
              <>
                <img
                  src={nextRank.icon}
                  alt={nextRank.name}
                />

                <span>LVL {nextRank.level}</span>
              </>
            ) : (
              <>
                <div className="rank-xp-max">
                  MAX
                </div>

                <span>MAX RANG</span>
              </>
            )}

          </div>

        </div>


        {/* RANG-NAMEN */}
        <div className="rank-xp-labels">

          <div>
            <strong>{currentRank.name}</strong>
            <small>AKTUELL</small>
          </div>

          <div className="rank-xp-next-label">

            {nextRank ? (
              <>
                <span>NÄCHSTER RANG</span>
                <strong>{nextRank.name}</strong>
              </>
            ) : (
              <strong>MAXIMALER RANG</strong>
            )}

          </div>

        </div>
      </>
    )
  })()}

</section>

      <section className="section">
  <div className="section-heading">
    <h2>Letzte Tour</h2>
    <span>
      {(() => {
        const savedTours = JSON.parse(
          localStorage.getItem('mtb_tours') || '[]'
        )

        if (savedTours.length === 0) {
          return 'Noch keine Tour'
        }

        const latestTour = savedTours[0]

        return new Date(
          latestTour.date
        ).toLocaleDateString('de-DE')
      })()}
    </span>
  </div>

  {(() => {
    const savedTours = JSON.parse(
      localStorage.getItem('mtb_tours') || '[]'
    )

    if (savedTours.length === 0) {
      return (
        <div className="tour-card">
          <div className="tour-image">
            <div className="mountain">
              ⛰️
            </div>
          </div>

          <div className="tour-info">
            <div className="tour-title">
              Noch keine Tour
            </div>

            <span className="difficulty">
              Zeichne deine erste Tour auf
            </span>
          </div>
        </div>
      )
    }

    const latestTour = savedTours[0]

    const duration =
      Number(latestTour.duration) || 0

    const hours = Math.floor(
      duration / 3600
    )

    const minutes = Math.floor(
      (duration % 3600) / 60
    )

    const seconds =
      duration % 60

    const formattedDuration =
      hours > 0
        ? `${hours}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}`
        : `${minutes}:${seconds
            .toString()
            .padStart(2, '0')}`

    return (
      <div className="tour-card">
        <div className="tour-image tour-preview-map">
  {savedTours[0]?.route?.length > 0 ? (
    <MiniTourMap tour={savedTours[0]} />
  ) : (
    <div className="mountain">
      ⛰️
    </div>
  )}
</div>

        <div className="tour-info">
          <div className="tour-title">
            <span className="green-dot"></span>

            {latestTour.name ||
              'Meine MTB Tour'}
          </div>

          <span className="difficulty blue">
            MTB TOUR
          </span>

          <div className="tour-stats">
            <Stat
              number={Number(
                latestTour.distance || 0
              ).toFixed(2)}
              unit="km"
              label="Distanz"
            />

            <Stat
              number={Math.round(
                latestTour.elevation || 0
              )}
              unit="hm"
              label="Höhenmeter"
            />

            <Stat
              number={formattedDuration}
              label="Dauer"
            />

            <Stat
              number={
                duration > 0
                  ? (
                      (Number(
                        latestTour.distance || 0
                      ) /
                        (duration / 3600))
                    ).toFixed(1)
                  : '0.0'
              }
              unit="km/h"
              label="Ø Geschwindigkeit"
            />
          </div>
        </div>
      </div>
    )
  })()}
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

    const rawCoordinates =
  tour.path ||
  tour.route ||
  tour.track ||
  tour.coordinates ||
  []

const coordinates = Array.isArray(rawCoordinates)
  ? rawCoordinates
      .map((point) => {
        // GPS-Punkt als Objekt
        if (
          point &&
          typeof point === 'object' &&
          !Array.isArray(point)
        ) {
          const lat = Number(point.lat)
          const lon = Number(
            point.lon ?? point.lng
          )

          if (
            Number.isFinite(lat) &&
            Number.isFinite(lon)
          ) {
            return [lon, lat]
          }

          return null
        }

        // Bereits im MapLibre-Format [lon, lat]
        if (
          Array.isArray(point) &&
          point.length >= 2
        ) {
          const lon = Number(point[0])
          const lat = Number(point[1])

          if (
            Number.isFinite(lon) &&
            Number.isFinite(lat)
          ) {
            return [lon, lat]
          }
        }

        return null
      })
      .filter(Boolean)
  : []

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

  layout: {
    'line-cap': 'round',
    'line-join': 'round',
  },

  paint: {
    'line-color': '#a5f51a',
    'line-width': 5,
    'line-opacity': 0.95,
    'line-blur': 0.3,
  },
})

const smoothCoordinates = coordinates.filter((_, index) => {
  if (index === 0 || index === coordinates.length - 1) {
    return true
  }

  // Jeden zweiten GPS-Punkt entfernen
  return index % 2 === 0
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
      const newMessages = data || []

      setMessages(newMessages)
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
  const [showCreateCommunity, setShowCreateCommunity] = useState(false)
  const [communityName, setCommunityName] = useState('')
  const [communityDescription, setCommunityDescription] = useState('')
  const [communityImage, setCommunityImage] = useState(null)
  const [selectedFriends, setSelectedFriends] = useState([])
  const [communities, setCommunities] = useState([])
  const [loadingCommunities, setLoadingCommunities] = useState(true)
  const [activeCommunity, setActiveCommunity] = useState(null)

  useEffect(() => {
  loadFriends()
  loadCommunities()
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
const toggleCommunityFriend = (friendId) => {
  setSelectedFriends((current) =>
    current.includes(friendId)
      ? current.filter((id) => id !== friendId)
      : [...current, friendId]
  )
}

const createCommunity = async () => {
  if (!communityName.trim()) {
    alert('Bitte gib einen Community-Namen ein.')
    return
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    alert('Du bist nicht eingeloggt.')
    return
  }

  try {
    // Community erstellen
    const { data: community, error: communityError } =
      await supabase
        .from('communities')
        .insert({
          name: communityName.trim(),
          description: communityDescription.trim(),
          image: communityImage,
          owner_id: user.id,
        })
        .select()
        .single()

    if (communityError) {
      console.error('Community erstellen:', communityError)
      alert(
        'Community konnte nicht erstellt werden: ' +
        communityError.message
      )
      return
    }

    // Ersteller als Admin hinzufügen
    const members = [
      {
        community_id: community.id,
        user_id: user.id,
        role: 'owner',
      },

      ...selectedFriends.map((friendId) => ({
        community_id: community.id,
        user_id: friendId,
        role: 'member',
      })),
    ]

    const { error: memberError } =
      await supabase
        .from('community_members')
        .insert(members)

    if (memberError) {
      console.error(
        'Community-Mitglieder:',
        memberError
      )

      alert(
        'Community wurde erstellt, aber die Mitglieder konnten nicht hinzugefügt werden.'
      )

      return
    }

    alert('Community erfolgreich erstellt! 🚀')

    setCommunityName('')
    setCommunityDescription('')
    setCommunityImage(null)
    setSelectedFriends([])
    setShowCreateCommunity(false)

  } catch (error) {
    console.error('Community:', error)

    alert(
      'Beim Erstellen der Community ist ein Fehler aufgetreten.'
    )
  }
}
const loadCommunities = async () => {
  setLoadingCommunities(true)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    setCommunities([])
    setLoadingCommunities(false)
    return
  }

  const { data: memberships, error } =
    await supabase
      .from('community_members')
      .select('community_id')
      .eq('user_id', user.id)

  if (error) {
    console.error('Communitys laden:', error)
    setCommunities([])
    setLoadingCommunities(false)
    return
  }

  const communityIds =
    (memberships || []).map(
      (membership) => membership.community_id
    )

  if (communityIds.length === 0) {
    setCommunities([])
    setLoadingCommunities(false)
    return
  }

  const { data, error: communityError } =
    await supabase
      .from('communities')
      .select(
        'id, name, description, image, owner_id, created_at'
      )
      .in('id', communityIds)
      .order('created_at', {
        ascending: false,
      })

  if (communityError) {
    console.error(
      'Communitys laden:',
      communityError
    )
    setCommunities([])
  } else {
    setCommunities(data || [])
  }

  setLoadingCommunities(false)
}

if (activeCommunity) {
  return (
    <CommunityPage
      community={activeCommunity}
      onBack={() => setActiveCommunity(null)}
    />
  )
}

return (
  <Page
    title="Freunde"
    eyebrow="DEINE COMMUNITY"
  >

    {/* =====================================================
       FREUND HINZUFÜGEN
    ===================================================== */}

    <div className="friends-add-box">

      <div className="section-heading">
        <h2>Neuen Freund hinzufügen</h2>
      </div>

      <div className="friend-search">
        <input
          type="text"
          value={search}
          onChange={(event) =>
            searchUsers(event.target.value)
          }
          placeholder="Nach einem Namen suchen..."
        />
      </div>

      {searching && (
        <div className="friend-search-info">
          Suche läuft...
        </div>
      )}

      {results.length > 0 && (
        <div className="friend-search-results">

          {results.map((result) => (
            <div
              className="friend-card"
              key={result.id}
            >

              <div className="friend-avatar">
                {result.image ? (
                  <img
                    src={result.image}
                    alt=""
                  />
                ) : (
                  <span>
                    {(result.name || '?')
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <div className="friend-info">
                <strong>
                  {result.name}
                </strong>

                <small>
                  {result.rank || 'Rider'}
                </small>
              </div>

              <button
                className="friend-action-button"
                onClick={() =>
                  addFriend(result.id)
                }
              >
                Hinzufügen
              </button>

            </div>
          ))}

        </div>
      )}

    </div>


    {/* =====================================================
       COMMUNITY ERSTELLEN
    ===================================================== */}

    <button
      className="create-community-button"
      onClick={() =>
        setShowCreateCommunity(true)
      }
    >
      ＋ &nbsp; NEUE COMMUNITY ERSTELLEN
    </button>


    {/* =====================================================
       FREUNDSCHAFTSANFRAGEN
    ===================================================== */}

    {requests.length > 0 && (
      <section className="friends-section">

        <div className="section-heading">
          <h2>Freundschaftsanfragen</h2>

          <span>
            {requests.length}
          </span>
        </div>

        <div className="friends-list">

          {requests.map((request) => (
            <div
              className="friend-card"
              key={request.id}
            >

              <div className="friend-avatar">
                {request.profile?.image ? (
                  <img
                    src={request.profile.image}
                    alt=""
                  />
                ) : (
                  <span>
                    {(request.profile?.name || '?')
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <div className="friend-info">
                <strong>
                  {request.profile?.name}
                </strong>

                <small>
                  Möchte dein Freund werden
                </small>
              </div>

              <div className="friend-request-actions">

                <button
                  className="friend-accept-button"
                  onClick={() =>
                    acceptRequest(request)
                  }
                >
                  ✓
                </button>

                <button
                  className="friend-reject-button"
                  onClick={() =>
                    rejectRequest(request)
                  }
                >
                  ✕
                </button>

              </div>

            </div>
          ))}

        </div>

      </section>
    )}


    {/* =====================================================
       FREUNDE
    ===================================================== */}

    <section className="friends-section">

      <div className="section-heading">
        <h2>Meine Freunde</h2>

        <span>
          {friends.length}
        </span>
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
            Suche oben nach anderen Ridern und
            füge sie hinzu.
          </small>

        </div>
      ) : (
        <div className="friends-list">

          {friends.map((friend) => (
            <div
              className="friend-card"
              key={friend.id}
            >

              <div className="friend-avatar">
                {friend.image ? (
                  <img
                    src={friend.image}
                    alt=""
                  />
                ) : (
                  <span>
                    {(friend.name || '?')
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <div className="friend-info">
                <strong>
                  {friend.name}
                </strong>

                <small>
                  {friend.rank || 'Rider'}
                </small>
              </div>

              <div className="friend-card-actions">

                <button
                  className="friend-chat-button"
                  onClick={() =>
                    setActiveChat(friend)
                  }
                >
                  💬
                </button>

                <button
                  className="friend-remove-button"
                  onClick={() =>
                    removeFriend(friend.id)
                  }
                >
                  ✕
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </section>


    {/* =====================================================
       MEINE COMMUNITIES
    ===================================================== */}

    <div className="friends-section communities-section">

      <div className="section-heading">

        <h2>Meine Communitys</h2>

        <span>
          {communities.length}
        </span>

      </div>

      {loadingCommunities ? (
        <div className="friend-search-info">
          Communitys werden geladen...
        </div>
      ) : communities.length === 0 ? (
        <div className="empty-friends">

          <span>👥</span>

          <strong>
            Noch keine Communitys
          </strong>

          <small>
            Erstelle deine erste Community über
            „Neue Community erstellen“.
          </small>

        </div>
      ) : (
        <div className="community-list">

          {communities.map((community) => (
            <div
              className="community-card"
              key={community.id}
            >

              <div className="community-card-image">

                {community.image ? (
                  <img
                    src={community.image}
                    alt=""
                  />
                ) : (
                  <span>👥</span>
                )}

              </div>

              <div className="community-card-info">

                <strong>
                  {community.name}
                </strong>

                <p>
                  {community.description ||
                    'Keine Beschreibung'}
                </p>

              </div>

              <button
                className="community-open-button"
                onClick={() =>
                  setActiveCommunity(community)
                }
              >
                Öffnen
              </button>

            </div>
          ))}

        </div>
      )}

    </div>


    {/* =====================================================
       COMMUNITY ERSTELLEN MODAL
    ===================================================== */}

    {showCreateCommunity && (
      <div
        className="community-modal-overlay"
        onClick={() =>
          setShowCreateCommunity(false)
        }
      >

        <div
          className="community-modal"
          onClick={(event) =>
            event.stopPropagation()
          }
        >

          <div className="section-heading">
            <h2>Neue Community erstellen</h2>
          </div>


          <div className="community-form">

            <label>
              Community-Name

              <input
                type="text"
                value={communityName}
                onChange={(event) =>
                  setCommunityName(
                    event.target.value
                  )
                }
                placeholder="z. B. Würzburg MTB Crew"
              />

            </label>


            <label>
              Beschreibung

              <textarea
                value={communityDescription}
                onChange={(event) =>
                  setCommunityDescription(
                    event.target.value
                  )
                }
                placeholder="Was ist das für eine Community?"
                rows={4}
              />

            </label>


            <label>
              Community-Bild

              <input
                type="file"
                accept="image/*"
                onChange={(event) => {

                  const file =
                    event.target.files?.[0]

                  if (!file) return

                  const reader =
                    new FileReader()

                  reader.onload = () => {
                    setCommunityImage(
                      reader.result
                    )
                  }

                  reader.readAsDataURL(file)

                }}
              />

            </label>


            {communityImage && (
              <div className="community-image-preview">

                <img
                  src={communityImage}
                  alt="Community Vorschau"
                />

              </div>
            )}


            <div className="community-friend-selection">

              <h3>
                Freunde hinzufügen
              </h3>

              {friends.length === 0 ? (
                <p>
                  Du hast noch keine Freunde.
                </p>
              ) : (
                <div className="community-friend-list">

  {friends.map((friend, index) => {

    const selected =
      selectedFriends.includes(friend.id)

    return (
      <button
        type="button"
        key={friend.id}
        className={`community-friend-option community-user-color-${index % 8} ${
          selected ? 'selected' : ''
        }`}
        onClick={() =>
          toggleCommunityFriend(friend.id)
        }
      >

        <div className="community-friend-left">

          <div className="friend-avatar">

            {friend.image ? (
              <img
                src={friend.image}
                alt=""
              />
            ) : (
              <span>
                {(friend.name || '?')
                  .charAt(0)
                  .toUpperCase()}
              </span>
            )}

          </div>

          <div className="community-friend-info">

            <strong>
              {friend.name}
            </strong>

            <small>
              {friend.rank || 'Rider'}
            </small>

          </div>

        </div>

        <div
          className={`community-select-box ${
            selected ? 'selected' : ''
          }`}
        >
          {selected && '✓'}
        </div>

      </button>
    )
  })}

</div>
              )}

            </div>


            <div className="community-modal-actions">

              <button
                type="button"
                className="community-cancel-button"
                onClick={() =>
                  setShowCreateCommunity(false)
                }
              >
                Abbrechen
              </button>

              <button
                type="button"
                className="community-save-button"
                onClick={createCommunity}
              >
                Community erstellen
              </button>

            </div>

          </div>

        </div>

      </div>
    )}

  </Page>
)
}


function CommunityPage({ community, onBack }) {
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [memberProfiles, setMemberProfiles] = useState({})
  const previousCommunityMessageCount =
  useRef(0)

  const hasLoadedCommunityMessages =
    useRef(false)

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setCurrentUser(user)
    }

    getCurrentUser()
  }, [])

  const loadMembers = async () => {
    if (!community?.id) return

    const { data, error } = await supabase
      .from('community_members')
      .select('user_id, role')
      .eq('community_id', community.id)

    if (error) {
      console.error(
        'Community-Mitglieder laden:',
        error
      )
      return
    }

    const userIds = (data || []).map(
      (member) => member.user_id
    )

    if (userIds.length === 0) {
      setMemberProfiles({})
      return
    }

    const { data: profiles, error: profileError } =
      await supabase
        .from('profiles')
        .select(
          'id, name, image, level, rank'
        )
        .in('id', userIds)

    if (profileError) {
      console.error(
        'Community-Profile laden:',
        profileError
      )
      return
    }

    const profileMap = {}

    ;(profiles || []).forEach((profile) => {
      profileMap[profile.id] = profile
    })

    setMemberProfiles(profileMap)
  }

  const loadMessages = async () => {
  if (!community?.id) return

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return

    const { data, error } = await supabase
      .from('community_messages')
      .select('*')
      .eq('community_id', community.id)
      .order('created_at', {
        ascending: true,
      })

    if (error) {
      console.error(
        'Community-Nachrichten laden:',
        error
      )
      setMessages([])
    } else {
  const newMessages = data || []

  if (
    hasLoadedCommunityMessages.current &&
    newMessages.length >
      previousCommunityMessageCount.current
  ) {
    const newestMessage =
      newMessages[newMessages.length - 1]

    if (
  newestMessage?.sender_id !==
  user.id
) {
      playSelectedNotificationSound()
    }
  }

  previousCommunityMessageCount.current =
    newMessages.length

  hasLoadedCommunityMessages.current =
    true

  setMessages(newMessages)
}

    setLoading(false)
  }

  useEffect(() => {
    if (!community?.id) return

    loadMembers()
    loadMessages()

    const interval = setInterval(() => {
      loadMessages()
    }, 3000)

    return () => {
      clearInterval(interval)
    }
  }, [community?.id])

  const sendMessage = async () => {
    const text = message.trim()

    if (
      !text ||
      sending ||
      !community?.id
    ) {
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    setSending(true)

    const { error } = await supabase
      .from('community_messages')
      .insert({
        community_id: community.id,
        sender_id: user.id,
        content: text,
      })

    if (error) {
      console.error(
        'Community-Nachricht senden:',
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
    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {
      event.preventDefault()
      sendMessage()
    }
  }

  const getUserColor = (userId) => {
    if (!userId) {
      return '#a5f51a'
    }

    let hash = 0

    for (let i = 0; i < userId.length; i++) {
      hash =
        userId.charCodeAt(i) +
        ((hash << 5) - hash)
    }

    const colors = [
      '#a5f51a',
      '#61a7ff',
      '#b875ff',
      '#ff6b8a',
      '#ffad4d',
      '#35e0c2',
      '#f5e85b',
      '#ff6bdf',
    ]

    return colors[
      Math.abs(hash) % colors.length
    ]
  }

  const getProfile = (userId) => {
    return memberProfiles[userId] || null
  }

  return (
    <Page
      title={community?.name || 'Community'}
      eyebrow="COMMUNITY"
    >

      <div className="community-chat-page">

        {/* =====================================================
           HEADER
        ===================================================== */}

        <div className="community-chat-header">

          <button
            className="chat-back-button"
            onClick={onBack}
          >
            ← Zurück
          </button>

          <div className="community-chat-user">

            <div className="large-avatar">

              {community?.image ? (
                <img
                  src={community.image}
                  alt=""
                />
              ) : (
                '👥'
              )}

            </div>

            <div>

              <strong>
                {community?.name}
              </strong>

              <span>
                Community · gemeinsamer Chat
              </span>

            </div>

          </div>

        </div>


        {/* =====================================================
           NACHRICHTEN
        ===================================================== */}

        <div className="community-chat-messages">

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
                Schreibe die erste Nachricht
                in dieser Community.
              </small>

            </div>

          ) : (

            messages.map((item) => {

              const isOwn =
                item.sender_id ===
                currentUser?.id

              const profile =
                getProfile(item.sender_id)

              const userColor =
                getUserColor(
                  item.sender_id
                )

              return (
                <div
                  key={item.id}
                  className={
                    isOwn
                      ? 'community-message-row own'
                      : 'community-message-row'
                  }
                >

                  {!isOwn && (
                    <div className="community-message-avatar">

                      {profile?.image ? (
                        <img
                          src={profile.image}
                          alt=""
                        />
                      ) : (
                        <span>
                          {(profile?.name || '?')
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}

                    </div>
                  )}


                  <div
                    className="community-message-content"
                  >

                    {!isOwn && (
                      <strong
                        style={{
                          color: userColor,
                        }}
                      >
                        {profile?.name ||
                          'Unbekannter Rider'}
                      </strong>
                    )}

                    <div
                      className={
                        isOwn
                          ? 'community-message-bubble own'
                          : 'community-message-bubble'
                      }
                      style={
                        !isOwn
                          ? {
                              borderLeft:
                                `3px solid ${userColor}`,
                            }
                          : undefined
                      }
                    >
                      {item.content}
                    </div>

                  </div>

                </div>
              )
            })

          )}

        </div>


        {/* =====================================================
           EINGABE
        ===================================================== */}

        <div className="community-chat-input-area">

          <textarea
            value={message}
            onChange={(event) =>
              setMessage(
                event.target.value
              )
            }
            onKeyDown={handleKeyDown}
            placeholder="Nachricht schreiben..."
            rows={1}
          />

          <button
            className="chat-send-button"
            onClick={sendMessage}
            disabled={
              sending ||
              !message.trim()
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

  const [position, setPosition] = useState(null)
const [locationError, setLocationError] = useState(false)
const [search, setSearch] = useState('')
const [selectedPark, setSelectedPark] = useState(null)

const [isRecording, setIsRecording] = useState(false)
const [tourDistance, setTourDistance] = useState(0)
const [tourElevation, setTourElevation] = useState(0)

const trackRef = useRef([])

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
   GPS TRACKING
--------------------------------------------- */

useEffect(() => {
  if (!navigator.geolocation) {
    setLocationError(true)
    return
  }

  const watchId = navigator.geolocation.watchPosition(
    (location) => {
      const coords = [
        location.coords.longitude,
        location.coords.latitude,
      ]

      setPosition(coords)

     // Nur während einer aktiven Tour aufzeichnen
if (isRecording) {
  const previousPoint =
    trackRef.current[trackRef.current.length - 1]

  const currentPoint = {
    coords,
    altitude: location.coords.altitude,
    accuracy: location.coords.accuracy,
    timestamp: location.timestamp,
  }

  trackRef.current.push(currentPoint)

  // Höhenmeter berechnen
  if (
    previousPoint &&
    previousPoint.altitude !== null &&
    currentPoint.altitude !== null
  ) {
    const elevationDifference =
      currentPoint.altitude -
      previousPoint.altitude

    if (elevationDifference > 0) {
      setTourElevation((value) =>
        value + elevationDifference
      )
    }
  }
}
    },
    () => {
      setLocationError(true)
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
    }
  )

  return () => {
    navigator.geolocation.clearWatch(watchId)
  }
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

/* ---------------------------------------------
   TOUR AUFZEICHNUNG
--------------------------------------------- */

const startTour = () => {
  trackRef.current = []
  setTourDistance(0)
  setTourElevation(0)
  setIsRecording(true)
}

const stopTour = () => {
  setIsRecording(false)

  console.log('Tour beendet')
  console.log('GPS Punkte:', trackRef.current)
  console.log('Höhenmeter:', tourElevation)
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
function ProfileImageCropper({
  image,
  onCancel,
  onConfirm,
}) {
  const viewportRef = useRef(null)
  const imageRef = useRef(null)

  const pointers = useRef(new globalThis.Map())
  const lastPinchDistance = useRef(null)
  const dragStart = useRef(null)

  const [naturalSize, setNaturalSize] = useState({
    width: 1,
    height: 1,
  })

  const [cropSize, setCropSize] = useState(280)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  })

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth

      setCropSize(
        Math.min(
          300,
          Math.max(220, width - 80)
        )
      )
    }

    updateSize()

    window.addEventListener(
      'resize',
      updateSize
    )

    return () =>
      window.removeEventListener(
        'resize',
        updateSize
      )
  }, [])

  const handleImageLoad = () => {
    const img = imageRef.current

    if (!img) return

    setNaturalSize({
      width: img.naturalWidth,
      height: img.naturalHeight,
    })

    setZoom(1)
    setPosition({
      x: 0,
      y: 0,
    })
  }

  const getBaseDimensions = () => {
    const scale = Math.max(
      cropSize / naturalSize.width,
      cropSize / naturalSize.height
    )

    return {
      width: naturalSize.width * scale,
      height: naturalSize.height * scale,
    }
  }

  const clampPosition = (x, y, nextZoom = zoom) => {
    const dimensions = getBaseDimensions()

    const width =
      dimensions.width * nextZoom

    const height =
      dimensions.height * nextZoom

    const maxX = Math.max(
      0,
      (width - cropSize) / 2
    )

    const maxY = Math.max(
      0,
      (height - cropSize) / 2
    )

    return {
      x: Math.max(
        -maxX,
        Math.min(maxX, x)
      ),
      y: Math.max(
        -maxY,
        Math.min(maxY, y)
      ),
    }
  }

  const distanceBetweenPointers = () => {
    const values = Array.from(
      pointers.current.values()
    )

    if (values.length < 2) return null

    const a = values[0]
    const b = values[1]

    return Math.hypot(
      a.x - b.x,
      a.y - b.y
    )
  }

  const handlePointerDown = (event) => {
    event.currentTarget.setPointerCapture(
      event.pointerId
    )

    pointers.current.set(
      event.pointerId,
      {
        x: event.clientX,
        y: event.clientY,
      }
    )

    if (pointers.current.size === 1) {
      dragStart.current = {
        pointerX: event.clientX,
        pointerY: event.clientY,
        positionX: position.x,
        positionY: position.y,
      }
    }

    if (pointers.current.size === 2) {
      lastPinchDistance.current =
        distanceBetweenPointers()
    }
  }

  const handlePointerMove = (event) => {
  if (!pointers.current.has(event.pointerId)) {
    return
  }

  pointers.current.set(
    event.pointerId,
    {
      x: event.clientX,
      y: event.clientY,
    }
  )

  // 1 Finger = Bild verschieben
  if (pointers.current.size === 1) {
    if (!dragStart.current) return

    const start = dragStart.current

    const newX =
      start.positionX +
      (event.clientX - start.pointerX)

    const newY =
      start.positionY +
      (event.clientY - start.pointerY)

    setPosition(
      clampPosition(newX, newY)
    )

    return
  }

  // 2 Finger = Pinch-Zoom
  if (pointers.current.size === 2) {
    const values = Array.from(
      pointers.current.values()
    )

    const a = values[0]
    const b = values[1]

    const distance = Math.hypot(
      a.x - b.x,
      a.y - b.y
    )

    if (!lastPinchDistance.current) {
      lastPinchDistance.current = distance
      return
    }

    const difference =
      distance -
      lastPinchDistance.current

    const nextZoom = Math.max(
      1,
      Math.min(
        4,
        zoom * (1 + difference * 0.004)
      )
    )

    // Mittelpunkt der beiden Finger
    const centerX =
      (a.x + b.x) / 2

    const centerY =
      (a.y + b.y) / 2

    const rect =
      viewportRef.current?.getBoundingClientRect()

    if (!rect) return

    const viewportCenterX =
      rect.left + rect.width / 2

    const viewportCenterY =
      rect.top + rect.height / 2

    // Zoom zur Position zwischen den Fingern
    const factor =
      nextZoom / zoom

    const nextX =
      centerX -
      viewportCenterX -
      (
        centerX -
        viewportCenterX -
        position.x
      ) * factor

    const nextY =
      centerY -
      viewportCenterY -
      (
        centerY -
        viewportCenterY -
        position.y
      ) * factor

    setZoom(nextZoom)

    setPosition(
      clampPosition(
        nextX,
        nextY,
        nextZoom
      )
    )

    lastPinchDistance.current =
      distance
  }
}

  const handlePointerUp = (event) => {
    pointers.current.delete(
      event.pointerId
    )

    if (pointers.current.size < 2) {
      lastPinchDistance.current = null
    }

    if (pointers.current.size === 0) {
      dragStart.current = null
    }
  }

  const handleWheel = (event) => {
    event.preventDefault()

    const nextZoom = Math.max(
      1,
      Math.min(
        4,
        zoom - event.deltaY * 0.001
      )
    )

    setZoom(nextZoom)

    setPosition(
      clampPosition(
        position.x,
        position.y,
        nextZoom
      )
    )
  }

  const handleZoomSlider = (event) => {
    const nextZoom =
      Number(event.target.value)

    setZoom(nextZoom)

    setPosition(
      clampPosition(
        position.x,
        position.y,
        nextZoom
      )
    )
  }

  const createCroppedImage = () => {
    const canvas =
      document.createElement('canvas')

    const outputSize = 512

    canvas.width = outputSize
    canvas.height = outputSize

    const context =
      canvas.getContext('2d')

    const dimensions =
      getBaseDimensions()

    const displayedWidth =
      dimensions.width * zoom

    const displayedHeight =
      dimensions.height * zoom

    const imageLeft =
      cropSize / 2 -
      displayedWidth / 2 +
      position.x

    const imageTop =
      cropSize / 2 -
      displayedHeight / 2 +
      position.y

    const sourceX =
      ((0 - imageLeft) /
        displayedWidth) *
      naturalSize.width

    const sourceY =
      ((0 - imageTop) /
        displayedHeight) *
      naturalSize.height

    const sourceWidth =
      (cropSize /
        displayedWidth) *
      naturalSize.width

    const sourceHeight =
      (cropSize /
        displayedHeight) *
      naturalSize.height

    context.drawImage(
      imageRef.current,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      outputSize,
      outputSize
    )

    onConfirm(
      canvas.toDataURL(
        'image/jpeg',
        0.9
      )
    )
  }

  const dimensions = getBaseDimensions()

  return (
    <div className="profile-crop-overlay">

      <div
        className="profile-crop-editor"
        style={{
          background: '#071a0d',
          borderColor: '#163d22',
        }}
      >

        <div
          className="profile-crop-header"
          style={{
            background: '#071a0d',
            borderColor: '#163d22',
          }}
        >

          <button
            type="button"
            className="profile-crop-close"
            onClick={onCancel}
          >
            ×
          </button>

          <div className="profile-crop-title">
            <strong>Profilbild</strong>
            <span>Bewegen und Skalieren</span>
          </div>

          <button
            type="button"
            className="profile-crop-confirm"
            onClick={createCroppedImage}
          >
            ✓
          </button>

        </div>

        <div
  ref={viewportRef}
  className="profile-crop-viewport"
  style={{
    touchAction: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTouchCallout: 'none',
  }}
  onPointerDown={handlePointerDown}
  onPointerMove={handlePointerMove}
  onPointerUp={handlePointerUp}
  onPointerCancel={handlePointerUp}
  onWheel={handleWheel}
>

          <img
            ref={imageRef}
            src={image}
            alt="Profilbild bearbeiten"
            className="profile-crop-image"
            onLoad={handleImageLoad}
            draggable={false}
            style={{
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              transform: `
                translate(
                  calc(-50% + ${position.x}px),
                  calc(-50% + ${position.y}px)
                )
                scale(${zoom})
              `,
            }}
          />

          <div
            className="profile-crop-darkness"
            style={{
              '--crop-size':
                `${cropSize}px`,
            }}
          />

          <div
            className="profile-crop-circle"
            style={{
              width: cropSize,
              height: cropSize,
              borderColor: '#a5f51a',
              boxShadow: '0 0 0 2px rgba(165,245,26,0.18)',
            }}
          />

        </div>

        <div
          className="profile-crop-controls"
          style={{
            background: '#071a0d',
            borderColor: '#163d22',
          }}
        >

          <span>−</span>

          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={handleZoomSlider}
          />

          <span>+</span>

        </div>

        <div
          className="profile-crop-hint"
          style={{
            background: '#071a0d',
          }}
        >
          Bild mit dem Finger verschieben ·
          mit zwei Fingern zoomen
        </div>

      </div>

    </div>
  )
}

function ProfileModal({
  profile,
  onSave,
  onClose,
  onLogout,
}) {
  const [name, setName] = useState(profile.name)
  const [image, setImage] = useState(profile.image)
  const [cropImage, setCropImage] = useState(null)

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(
      localStorage.getItem(
        'mtb_notifications_enabled'
      ) === 'true'
    )

  const [selectedSound, setSelectedSound] =
    useState(
      localStorage.getItem(
        'mtb_notification_sound'
      ) || 'pulse'
    )

  const fileInput = useRef(null)

  useEffect(() => {
    const updateNotificationSettings = () => {
      setNotificationsEnabled(
        localStorage.getItem(
          'mtb_notifications_enabled'
        ) === 'true'
      )

      setSelectedSound(
        localStorage.getItem(
          'mtb_notification_sound'
        ) || 'pulse'
      )
    }

    window.addEventListener(
      'mtb-notification-settings-changed',
      updateNotificationSettings
    )

    return () => {
      window.removeEventListener(
        'mtb-notification-settings-changed',
        updateNotificationSettings
      )
    }
  }, [])

  const chooseImage = (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    const reader = new FileReader()

    reader.onload = () => {
      setCropImage(reader.result)
    }

    reader.readAsDataURL(file)

    event.target.value = ''
  }

  return (
    <>
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

          {/* =====================================================
              BENACHRICHTIGUNGEN
          ===================================================== */}

          <div className="notification-settings">

            <div className="notification-settings-header">

              <div className="notification-settings-title">
                <strong>Benachrichtigungen</strong>
                <small>Neue Nachrichten</small>
              </div>

              <button
                type="button"
                className={`notification-toggle ${
                  notificationsEnabled
                    ? 'enabled'
                    : ''
                }`}
                onClick={() => {
                  const nextValue =
                    !notificationsEnabled

                  localStorage.setItem(
                    'mtb_notifications_enabled',
                    String(nextValue)
                  )

                  setNotificationsEnabled(
                    nextValue
                  )

                  window.dispatchEvent(
                    new Event(
                      'mtb-notification-settings-changed'
                    )
                  )
                }}
              >
                <span></span>

                {notificationsEnabled
                  ? 'AN'
                  : 'AUS'}
              </button>

            </div>

            {notificationsEnabled && (

              <div className="notification-sound-settings">

                <label className="input-label">
                  BENACHRICHTIGUNGSTON
                </label>

                <div className="notification-sound-list">

                  {[
                    {
                      id: 'pulse',
                      name: 'Pulse',
                      description: 'Kurz & clean',
                      icon: '◉',
                    },
                    {
                      id: 'echo',
                      name: 'Echo',
                      description: 'Sanfter Doppelton',
                      icon: '〽',
                    },
                    {
                      id: 'boost',
                      name: 'Boost',
                      description: 'Kräftig & direkt',
                      icon: '⚡',
                    },
                    {
                      id: 'signal',
                      name: 'Signal',
                      description: 'Modern & digital',
                      icon: '◆',
                    },
                  ].map((sound) => {

                    const selected =
                      selectedSound === sound.id

                    return (
                      <button
                        type="button"
                        key={sound.id}
                        className={`notification-sound-option ${
                          selected
                            ? 'selected'
                            : ''
                        }`}
                        onClick={() => {

                          localStorage.setItem(
                            'mtb_notification_sound',
                            sound.id
                          )

                          setSelectedSound(
                            sound.id
                          )

                          playNotificationSound(
                            sound.id
                          )

                          window.dispatchEvent(
                            new Event(
                              'mtb-notification-settings-changed'
                            )
                          )
                        }}
                      >

                        <span className="notification-sound-icon">
                          {sound.icon}
                        </span>

                        <span className="notification-sound-info">

                          <strong>
                            {sound.name}
                          </strong>

                          <small>
                            {sound.description}
                          </small>

                        </span>

                        <span
                          className={`notification-sound-check ${
                            selected
                              ? 'selected'
                              : ''
                          }`}
                        >
                          {selected
                            ? '✓'
                            : ''}
                        </span>

                      </button>
                    )
                  })}

                </div>

                <small className="notification-sound-hint">
                  Tippe auf einen Ton, um ihn direkt zu testen.
                </small>

              </div>

            )}

          </div>

          {/* =====================================================
              AUSLOGGEN
          ===================================================== */}

          <button
            className="logout-button"
            onClick={onLogout}
          >
            AUSLOGGEN
          </button>

        </div>
      </div>

      {/* =====================================================
          PROFILBILD CROPPER
      ===================================================== */}

      {cropImage && (
        <ProfileImageCropper
          image={cropImage}
          onCancel={() =>
            setCropImage(null)
          }
          onConfirm={(croppedImage) => {
            setImage(croppedImage)
            setCropImage(null)
          }}
        />
      )}
    </>
  )
}
export default App