import Foundation
import Supabase

@MainActor
final class TaskStore: ObservableObject {
    @Published var tasks: [ArenaTask] = []
    @Published var loading = false
    @Published var error: String?

    func load() async {
        loading = true; error = nil
        do {
            tasks = try await Supa.client
                .from("tasks")
                .select()
                .order("created_at", ascending: false)
                .limit(50)
                .execute()
                .value
        } catch {
            self.error = error.localizedDescription
        }
        loading = false
    }

    @discardableResult
    func post(title: String, brief: String, category: String?) async -> Bool {
        do {
            try await Supa.client
                .from("tasks")
                .insert(NewTask(title: title, brief: brief, category: category))
                .execute()
            await load()
            return true
        } catch {
            self.error = error.localizedDescription
            return false
        }
    }

    @discardableResult
    func mount(task: ArenaTask, email: String, role: String) async -> Bool {
        do {
            try await Supa.client
                .from("mounts")
                .insert(NewMount(task_id: task.id, pilot_email: email, role: role, xp: 150, bounty: "$80–$200"))
                .execute()
            return true
        } catch {
            self.error = error.localizedDescription
            return false
        }
    }
}
