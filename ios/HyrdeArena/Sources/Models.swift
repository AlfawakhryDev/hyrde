import Foundation

// Rows returned from Supabase (snake_case columns mapped to Swift camelCase).
struct ArenaTask: Codable, Identifiable, Hashable {
    let id: UUID
    let createdAt: String?
    let title: String
    let brief: String
    let category: String?
    let origin: String
    let status: String
    let agentCompletion: Int
    let agentSummary: String?

    enum CodingKeys: String, CodingKey {
        case id, title, brief, category, origin, status
        case createdAt = "created_at"
        case agentCompletion = "agent_completion"
        case agentSummary = "agent_summary"
    }
}

// Insert payloads.
struct NewTask: Encodable {
    let title: String
    let brief: String
    let category: String?
    let origin: String = "human"
}

struct NewMount: Encodable {
    let task_id: UUID
    let pilot_email: String?
    let role: String?
    let xp: Int
    let bounty: String?
}

struct NewPilot: Encodable {
    let name: String?
    let email: String
    let primary_skill: String?
    let location: String?
}
