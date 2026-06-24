import SwiftUI

struct ArenaFeedView: View {
    @EnvironmentObject var store: TaskStore

    var body: some View {
        NavigationStack {
            ZStack {
                Brand.bg.ignoresSafeArea()
                Group {
                    if store.loading && store.tasks.isEmpty {
                        ProgressView().tint(Brand.cyan)
                    } else if let err = store.error, store.tasks.isEmpty {
                        VStack(spacing: 12) {
                            Text("Couldn’t reach the Arena").font(.headline)
                            Text(err).font(.caption).foregroundStyle(.secondary)
                                .multilineTextAlignment(.center).padding(.horizontal)
                            Button("Retry") { Task { await store.load() } }
                                .buttonStyle(.borderedProminent).tint(Brand.cyan)
                        }
                    } else {
                        List {
                            ForEach(store.tasks) { task in
                                NavigationLink(value: task) {
                                    TaskRow(task: task)
                                }
                                .listRowBackground(Brand.card)
                            }
                        }
                        .listStyle(.plain)
                        .scrollContentBackground(.hidden)
                        .refreshable { await store.load() }
                    }
                }
            }
            .navigationTitle("Live in the Arena")
            .navigationDestination(for: ArenaTask.self) { TaskDetailView(task: $0) }
            .task { if store.tasks.isEmpty { await store.load() } }
        }
    }
}

struct TaskRow: View {
    let task: ArenaTask
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text((task.category ?? "Task").uppercased())
                    .font(.caption2).bold().foregroundStyle(Brand.cyan)
                if task.origin == "ai_client" {
                    Text("🤖 AI client").font(.caption2).foregroundStyle(.secondary)
                }
                Spacer()
                Text("\(task.agentCompletion)% by agent")
                    .font(.caption2).foregroundStyle(.secondary)
            }
            Text(task.title).font(.headline).foregroundStyle(.white)
            ProgressView(value: Double(task.agentCompletion), total: 100)
                .tint(Brand.cyan)
        }
        .padding(.vertical, 6)
    }
}
