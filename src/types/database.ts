export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Position = "TOP" | "JUNGLE" | "MID" | "ADC" | "SUP";

export type MatchStatus =
  | "OPEN"
  | "MATCHED"
  | "PENDING_RESULT"
  | "COMPLETED"
  | "DISPUTED";

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string;
          name: string;
          region_depth1: string;
          region_depth2: string;
          region_depth3: string;
          captain_id: string;
          contact_link: string;
          avg_tier_score: number | null;
          win_count: number;
          loss_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          region_depth1: string;
          region_depth2: string;
          region_depth3: string;
          captain_id: string;
          contact_link: string;
          avg_tier_score?: number | null;
          win_count?: number;
          loss_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          region_depth1?: string;
          region_depth2?: string;
          region_depth3?: string;
          captain_id?: string;
          contact_link?: string;
          avg_tier_score?: number | null;
          win_count?: number;
          loss_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          team_id: string | null;
          position: Position | null;
          tier_data: Json | null;
          summoner_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          team_id?: string | null;
          position?: Position | null;
          tier_data?: Json | null;
          summoner_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string | null;
          position?: Position | null;
          tier_data?: Json | null;
          summoner_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      matches: {
        Row: {
          id: string;
          host_team_id: string;
          challenger_team_id: string | null;
          status: MatchStatus;
          scheduled_at: string;
          target_tier: string | null;
          result_screenshot_url: string | null;
          winner_team_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          host_team_id: string;
          challenger_team_id?: string | null;
          status?: MatchStatus;
          scheduled_at: string;
          target_tier?: string | null;
          result_screenshot_url?: string | null;
          winner_team_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          host_team_id?: string;
          challenger_team_id?: string | null;
          status?: MatchStatus;
          scheduled_at?: string;
          target_tier?: string | null;
          result_screenshot_url?: string | null;
          winner_team_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      position: Position;
      match_status: MatchStatus;
    };
  };
}
