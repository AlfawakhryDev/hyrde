import SwiftUI

struct TaskDetailView: View {
    let task: ArenaTask
    @EnvironmentObject var store: TaskStore

    @State private var email = ""
    @State private var role = ""
    @State private var mounting = false
    @State private var mounted = false

    var body: some View {
        ZStack {
            Brand.bg.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    Text(task.title).font(.title2).bold().foregroundStyle(.white)

                    HStack(spacing: 10) {
                        Text("Agent completed").font(.subheadline).foregroundStyle(.secondary)
                        Spacer()
                        Text("\(task.agentCompletion)%").font(.title3).bold().foregroundStyle(Brand.cyan)
                    }
                    ProgressView(value: Double(task.agentCompletion), total: 100).tint(Brand.cyan)

                    if let s = task.agentSummary {
                        Text(s).font(.body).foregroundStyle(.white.opacity(0.85))
                    }
                    Text(task.brief).font(.callout).foregroundStyle(.secondary)

                    Divider().overlay(Color.white.opacity(0.1))

                    // Mount section (writes a row to the `mounts` table)
                    Text("⊹ Mount this task")
                        .font(.headline).foregroundStyle(Brand.amber)
                    Text("Finish what the agent started. Drop your email and the role you’d take.")
                        .font(.caption).foregroundStyle(.secondary)

                    TextField("you@email.com", text: $email)
                        .textInputAutocapitalization(.never).keyboardType(.emailAddress)
                        .padding(12).background(Brand.card).cornerRadius(10).foregroundStyle(.white)
                    TextField("Your role (e.g. Brand Designer)", text: $role)
                        .padding(12).background(Brand.card).cornerRadius(10).foregroundStyle(.white)

                    if mounted {
                        Label("You’re mounted. We’ll be in touch.", systemImage: "checkmark.seal.fill")
                            .foregroundStyle(Brand.amber).font(.subheadline)
                    } else {
                        Button {
                            Task {
                                mounting = true
                                mounted = await store.mount(task: task, email: email, role: role)
                                mounting = false
                            }
                        } label: {
                            HStack {
                                if mounting { ProgressView().tint(.black) }
                                Text(mounting ? "Mounting…" : "MOUNT THIS TASK").bold()
                            }
                            .frame(maxWidth: .infinity).padding(.vertical, 14)
                        }
                        .background(Brand.amber).foregroundStyle(.black).cornerRadius(12)
                        .disabled(email.isEmpty || role.isEmpty || mounting)
                        .opacity(email.isEmpty || role.isEmpty ? 0.5 : 1)
                    }

                    if let err = store.error {
                        Text(err).font(.caption).foregroundStyle(.red)
                    }
                }
                .padding(20)
            }
        }
        .navigationBarTitleDisplayMode(.inline)
    }
}
