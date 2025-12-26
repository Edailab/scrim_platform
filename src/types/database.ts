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
          invite_code: string;
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
          invite_code: string;
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
          invite_code?: string;
          avg_tier_score?: number | null;
          win_count?: number;
          loss_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "teams_captain_id_fkey";
            columns: ["captain_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          id: string;
          team_id: string | null;
          position: Position | null;
          tier_data: Json | null;
          summoner_name: string | null;
          riot_puuid: string | null;
          riot_game_name: string | null;
          riot_tag_line: string | null;
          riot_region: string | null;
          summoner_level: number | null;
          tier: string | null;
          tier_rank: string | null;
          tier_lp: number | null;
          riot_verified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          team_id?: string | null;
          position?: Position | null;
          tier_data?: Json | null;
          summoner_name?: string | null;
          riot_puuid?: string | null;
          riot_game_name?: string | null;
          riot_tag_line?: string | null;
          riot_region?: string | null;
          summoner_level?: number | null;
          tier?: string | null;
          tier_rank?: string | null;
          tier_lp?: number | null;
          riot_verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string | null;
          position?: Position | null;
          tier_data?: Json | null;
          summoner_name?: string | null;
          riot_puuid?: string | null;
          riot_game_name?: string | null;
          riot_tag_line?: string | null;
          riot_region?: string | null;
          summoner_level?: number | null;
          tier?: string | null;
          tier_rank?: string | null;
          tier_lp?: number | null;
          riot_verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_team_id_fkey";
            columns: ["team_id"];
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "matches_host_team_id_fkey";
            columns: ["host_team_id"];
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_challenger_team_id_fkey";
            columns: ["challenger_team_id"];
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_winner_team_id_fkey";
            columns: ["winner_team_id"];
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_win_count: {
        Args: { team_id: string };
        Returns: void;
      };
      increment_loss_count: {
        Args: { team_id: string };
        Returns: void;
      };
    };
    Enums: {
      position: Position;
      match_status: MatchStatus;
    };
  };
}

// Helper types for convenience
export type Team = Database["public"]["Tables"]["teams"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Match = Database["public"]["Tables"]["matches"]["Row"];
