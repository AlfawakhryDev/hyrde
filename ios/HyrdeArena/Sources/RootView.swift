import SwiftUI

struct RootView: View {
    var body: some View {
        TabView {
            ArenaFeedView()
                .tabItem { Label("Arena", systemImage: "bolt.fill") }
            PostTaskView()
                .tabItem { Label("Post", systemImage: "plus.circle.fill") }
        }
        .tint(Brand.cyan)
    }
}
