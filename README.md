# Project Context: "DongTier" (Scrim Platform Ver.)

## 1. Project Overview
**"DongTier"** is a location-based **League of Legends Scrim (5v5 Custom Match) Matching Platform**.
It moves away from individual solo-rank leaderboards to focus on **Team-vs-Team** matchmaking within local neighborhoods.

* **Core Loop:** Create Team $\rightarrow$ Find Opponent (via Board) $\rightarrow$ Play Match $\rightarrow$ Report Result $\rightarrow$ Gain Territory Points.
* **Key Constraint:** No real-time chat/socket logic. Use external links (Kakao OpenChat/Discord) for communication.

## 2. Database Schema (Supabase) - *Redesigned*

### A. `teams` (The Central Unit)
* `id` (uuid)
* `name` (text): Team Name
* `region_depth1/2/3`: Address (e.g., Seoul / Mapo-gu / Seogyo-dong)
* `captain_id`: Link to `profiles.id`
* `contact_link`: **URL for external chat (Kakao/Discord) - REQUIRED**
* `avg_tier_score`: Auto-calculated average of members
* `win_count`, `loss_count`

### B. `profiles` (Users)
* `team_id`: FK to `teams`
* `position`: TOP, JUNGLE, MID, ADC, SUP
* `tier_data`: Synced from Riot API

### C. `matches` (The Board)
* `id` (uuid)
* `host_team_id`: Team creating the challenge
* `challenger_team_id`: Team accepting the challenge (nullable initially)
* `status`: OPEN $\rightarrow$ MATCHED $\rightarrow$ PENDING_RESULT $\rightarrow$ COMPLETED (or DISPUTED)
* `scheduled_at`: Date/Time of the match
* `target_tier`: e.g., "GOLD~PLATINUM"
* `result_screenshot_url`: Evidence
* `winner_team_id`

## 3. UI/UX Priorities

### Page 1: The "Arena" (Main Feed)
* A list of "Wanted" cards (Scrim requests).
* Filters: Region (My Dong/Gu), Average Tier, Time.
* **CTA:** Floating Action Button "Post a Challenge" (격문 쓰기).

### Page 2: Team Management
* "My Team" Dashboard.
* Invite Link Generator.
* Roster View (Who is Top, who is Mid?).

### Page 3: "Territory War" (Map)
* A visual map or leaderboard showing which "Dong" has the most wins.
* Copy: "Seogyo-dong is currently dominating Mapo-gu!"

## 4. Key Logic (Lean Development)
* **Communication:** Do not build chat. When a match is accepted, simply reveal the `contact_link` to the other captain.
* **Verification:** Use a "Mutual Agreement" system for results.
    1.  Team A claims Victory.
    2.  Team B gets a notification "Did Team A win?".
    3.  If Team B clicks "Yes", update stats. If "No", flag as Dispute.

## 5. Instructions for AI
* Prioritize **Team Creation** and **Scrim Board** features over individual stats.
* Use `react-kakao-maps-sdk` or simple SVG map for the Territory feature later.
* All UI text in **Korean**.
