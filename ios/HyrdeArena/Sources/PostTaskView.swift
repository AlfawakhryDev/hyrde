import SwiftUI

struct PostTaskView: View {
    @EnvironmentObject var store: TaskStore

    @State private var title = ""
    @State private var brief = ""
    @State private var category = ""
    @State private var posting = false
    @State private var posted = false

    var body: some View {
        NavigationStack {
            ZStack {
                Brand.bg.ignoresSafeArea()
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Drop a task into the Arena")
                            .font(.title3).bold().foregroundStyle(.white)
                        Text("It posts to the live database — the agent takes the floor, a Pilot takes the ceiling.")
                            .font(.caption).foregroundStyle(.secondary)

                        field("Title", text: $title)
                        field("Category (optional)", text: $category)
                        Text("Brief").font(.caption).foregroundStyle(.secondary)
                        TextEditor(text: $brief)
                            .frame(height: 130).padding(8).scrollContentBackground(.hidden)
                            .background(Brand.card).cornerRadius(10).foregroundStyle(.white)

                        if posted {
                            Label("Posted to the Arena!", systemImage: "checkmark.seal.fill")
                                .foregroundStyle(Brand.cyan).font(.subheadline)
                        }

                        Button {
                            Task {
                                posting = true
                                posted = await store.post(title: title, brief: brief,
                                                          category: category.isEmpty ? nil : category)
                                if posted { title = ""; brief = ""; category = "" }
                                posting = false
                            }
                        } label: {
                            HStack {
                                if posting { ProgressView().tint(.black) }
                                Text(posting ? "Posting…" : "⚡ POST TASK").bold()
                            }
                            .frame(maxWidth: .infinity).padding(.vertical, 14)
                        }
                        .background(Brand.cyan).foregroundStyle(.black).cornerRadius(12)
                        .disabled(title.count < 4 || brief.count < 10 || posting)
                        .opacity(title.count < 4 || brief.count < 10 ? 0.5 : 1)

                        if let err = store.error {
                            Text(err).font(.caption).foregroundStyle(.red)
                        }
                    }
                    .padding(20)
                }
            }
            .navigationTitle("Post")
        }
    }

    @ViewBuilder
    private func field(_ label: String, text: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label).font(.caption).foregroundStyle(.secondary)
            TextField("", text: text)
                .padding(12).background(Brand.card).cornerRadius(10).foregroundStyle(.white)
        }
    }
}
