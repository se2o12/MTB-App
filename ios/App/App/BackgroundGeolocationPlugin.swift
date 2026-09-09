import Foundation
import CoreLocation
import Capacitor

@objc(BackgroundGeolocationPlugin)
public class BackgroundGeolocationPlugin: CAPPlugin, CAPBridgedPlugin, CLLocationManagerDelegate {

    public let identifier = "BackgroundGeolocationPlugin"
    public let jsName = "BackgroundGeolocation"

    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(
            name: "start",
            returnType: CAPPluginReturnPromise
        ),
        CAPPluginMethod(
            name: "stop",
            returnType: CAPPluginReturnPromise
        )
    ]

    private let locationManager = CLLocationManager()
    private var startCall: CAPPluginCall?

    public override func load() {
        super.load()

        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.distanceFilter = 2
        locationManager.pausesLocationUpdatesAutomatically = false

        if #available(iOS 9.0, *) {
            locationManager.allowsBackgroundLocationUpdates = true
        }

        if #available(iOS 11.0, *) {
            locationManager.showsBackgroundLocationIndicator = true
        }
    }

    @objc func start(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.startCall = call

            let status = self.locationManager.authorizationStatus

            switch status {
            case .authorizedAlways, .authorizedWhenInUse:
                self.startLocationUpdates()

            case .notDetermined:
                self.locationManager.requestAlwaysAuthorization()

            case .denied, .restricted:
                call.reject(
                    "Standortberechtigung wurde verweigert."
                )

            @unknown default:
                call.reject(
                    "Unbekannter Standortberechtigungsstatus."
                )
            }
        }
    }

    private func startLocationUpdates() {
        locationManager.startUpdatingLocation()

        startCall?.resolve()
        startCall = nil
    }

    @objc func stop(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.locationManager.stopUpdatingLocation()

            call.resolve()
        }
    }

    public func locationManagerDidChangeAuthorization(
        _ manager: CLLocationManager
    ) {
        let status = manager.authorizationStatus

        switch status {
        case .authorizedAlways, .authorizedWhenInUse:
            if startCall != nil {
                startLocationUpdates()
            }

        case .denied, .restricted:
            startCall?.reject(
                "Standortberechtigung wurde verweigert."
            )
            startCall = nil

        default:
            break
        }
    }

    public func locationManager(
        _ manager: CLLocationManager,
        didUpdateLocations locations: [CLLocation]
    ) {
        guard let location = locations.last else {
            return
        }

        let data: [String: Any] = [
            "lat": location.coordinate.latitude,
            "lon": location.coordinate.longitude,
            "altitude": location.altitude,
            "accuracy": location.horizontalAccuracy,
            "speed": location.speed,
            "time": Int(
                location.timestamp.timeIntervalSince1970 * 1000
            )
        ]

        notifyListeners(
            "location",
            data: data
        )
    }

    public func locationManager(
        _ manager: CLLocationManager,
        didFailWithError error: Error
    ) {
        notifyListeners(
            "error",
            data: [
                "message": error.localizedDescription
            ]
        )
    }
}