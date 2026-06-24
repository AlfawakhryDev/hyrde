import Foundation
import Supabase

// Single shared Supabase client, configured from Secrets.swift.
enum Supa {
    static let client = SupabaseClient(
        supabaseURL: URL(string: Secrets.supabaseURL)!,
        supabaseKey: Secrets.supabaseAnonKey
    )
}
