import SwiftUI

@main
struct HyrdeArenaApp: App {
    @StateObject private var store = TaskStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(store)
                .preferredColorScheme(.dark)
        }
    }
}

// Shared brand colors (machine cyan + human amber).
enum Brand {
    static let cyan  = Color(red: 0.13, green: 0.83, blue: 0.93)
    static let amber = Color(red: 0.98, green: 0.75, blue: 0.14)
    static let bg    = Color(red: 0.02, green: 0.024, blue: 0.04)
    static let card  = Color(red: 0.08, green: 0.09, blue: 0.11)
}
