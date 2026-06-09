import React, { useState, useEffect, useMemo } from "react";

// 24 Participants - Ranked Top-Tier paired inversely with Lowest-Tier
const INITIAL_ROSTER = [
  { id: 1, name: "Zhihao", topTeam: "France", topFlag: "🇫🇷", lowTeam: "Curaçao", lowFlag: "🇨🇼" },
  { id: 2, name: "Junrun", topTeam: "Argentina", topFlag: "🇦🇷", lowTeam: "Cape Verde", lowFlag: "🇨🇻" },
  { id: 3, name: "Tahmid", topTeam: "Brazil", topFlag: "🇧🇷", lowTeam: "Haiti", lowFlag: "🇭🇹" },
  { id: 4, name: "Hari", topTeam: "Uruguay", topFlag: "🇺🇾", lowTeam: "DR Congo", lowFlag: "🇨🇩" },
  { id: 5, name: "Theuns", topTeam: "Spain", topFlag: "🇪🇸", lowTeam: "Bahrain", lowFlag: "🇧🇭" },
  { id: 6, name: "Doug", topTeam: "Portugal", topFlag: "🇵🇹", lowTeam: "Uzbekistan", lowFlag: "🇺🇿" },
  { id: 7, name: "Nikhil", topTeam: "Netherlands", topFlag: "🇳🇱", lowTeam: "Oman", lowFlag: "🇴🇲" },
  { id: 8, name: "Qihan", topTeam: "Germany", topFlag: "🇩🇪", lowTeam: "Jordan", lowFlag: "🇯🇴" },
  { id: 9, name: "Pari", topTeam: "Italy", topFlag: "🇮🇹", lowTeam: "Bosnia", lowFlag: "🇧🇦" },
  { id: 10, name: "Yunlong", topTeam: "Belgium", topFlag: "🇧🇪", lowTeam: "New Zealand", lowFlag: "🇳🇿" },
  { id: 11, name: "Minh", topTeam: "England", topFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", lowTeam: "El Salvador", lowFlag: "🇸🇻" },
  { id: 12, name: "Paul", topTeam: "Colombia", topFlag: "🇨🇴", lowTeam: "Honduras", lowFlag: "🇭🇳" },
  { id: 13, name: "Sean", topTeam: "Croatia", topFlag: "🇭🇷", lowTeam: "Qatar", lowFlag: "🇶🇦" },
  { id: 14, name: "Hongyu", topTeam: "Morocco", topFlag: "🇲🇦", lowTeam: "South Africa", lowFlag: "🇿🇦" },
  { id: 15, name: "Hassan", topTeam: "USA", topFlag: "🇺🇸", lowTeam: "Iraq", lowFlag: "🇮🇶" },
  { id: 16, name: "Neil", topTeam: "Mexico", topFlag: "🇲🇽", lowTeam: "Jamaica", lowFlag: "🇯🇲" },
  { id: 17, name: "Irina", topTeam: "Senegal", topFlag: "🇸🇳", lowTeam: "Venezuela", lowFlag: "🇻🇪" },
  { id: 18, name: "Jawed", topTeam: "Japan", topFlag: "🇯🇵", lowTeam: "Mali", lowFlag: "🇲🇱" },
  { id: 19, name: "Jade", topTeam: "Switzerland", topFlag: "🇨🇭", lowTeam: "Ghana", lowFlag: "🇬🇭" },
  { id: 20, name: "Qi", topTeam: "South Korea", topFlag: "🇰🇷", lowTeam: "Saudi Arabia", lowFlag: "🇸🇦" },
  { id: 21, name: "Bevan", topTeam: "Denmark", topFlag: "🇩🇰", lowTeam: "Panama", lowFlag: "🇵🇦" },
  { id: 22, name: "Johnson", topTeam: "Austria", topFlag: "🇦🇹", lowTeam: "Tunisia", lowFlag: "🇹🇳" },
  { id: 23, name: "Huo", topTeam: "Ecuador", topFlag: "🇪🇨", lowTeam: "Egypt", lowFlag: "🇪🇬" },
  { id: 24, name: "Hassan", topTeam: "Ukraine", topFlag: "🇺🇦", lowTeam: "Czech Republic", lowFlag: "🇨🇿" }
];

const INITIAL_TEAM_STATS = {};
INITIAL_ROSTER.forEach((p) => {
  INITIAL_TEAM_STATS[p.topTeam] = { wins: 0, draws: 0, goals: 0 };
  INITIAL_TEAM_STATS[p.lowTeam] = { wins: 0, draws: 0, goals: 0 };
});

export default function App() {
  const [teamStats, setTeamStats] = useState(INITIAL_TEAM_STATS);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchLiveData = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch("/api/football");
      if (!response.ok) throw new Error(`API returned status: ${response.status}`);

      const data = await response.json();
      const freshStats = JSON.parse(JSON.stringify(INITIAL_TEAM_STATS));

      data.matches?.forEach((match) => {
        if (match.status === "FINISHED") {
          const homeTeam = match.homeTeam.name;
          const awayTeam = match.awayTeam.name;
          
          // 1. Grab the API's raw full-time score (which awkwardly includes penalty shootout goals)
          let homeOfficialScore = match.score.fullTime.home !== null ? match.score.fullTime.home : 0;
          let awayOfficialScore = match.score.fullTime.away !== null ? match.score.fullTime.away : 0;

          // 2. OFFICIAL UEFA RULES: Subtract the shootout goals to get the true score at the end of 120 minutes
          if (match.score.penalties && match.score.penalties.home !== null) {
            homeOfficialScore -= match.score.penalties.home;
            awayOfficialScore -= match.score.penalties.away;
          }

          if (freshStats[homeTeam]) {
            // 3. Award Wins/Draws based ONLY on the true 120-minute score
            if (homeOfficialScore > awayOfficialScore) freshStats[homeTeam].wins += 1;
            else if (homeOfficialScore === awayOfficialScore) freshStats[homeTeam].draws += 1;
            
            // 4. Add the real, in-game goals
            freshStats[homeTeam].goals += homeOfficialScore;
          }
          if (freshStats[awayTeam]) {
            if (awayOfficialScore > homeOfficialScore) freshStats[awayTeam].wins += 1;
            else if (homeOfficialScore === awayOfficialScore) freshStats[awayTeam].draws += 1;
            
            freshStats[awayTeam].goals += awayOfficialScore;
          }
        }
      });
      setTeamStats(freshStats);
    } catch (error) {
      console.error("Sync Error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
  }, []);

  const leaderboardData = useMemo(() => {
    return INITIAL_ROSTER.map((p) => {
      const top = teamStats[p.topTeam] || { wins: 0, draws: 0, goals: 0 };
      const low = teamStats[p.lowTeam] || { wins: 0, draws: 0, goals: 0 };
      
      const totalWins = top.wins + low.wins;
      const totalDraws = top.draws + low.draws;
      const totalGoals = top.goals + low.goals;
      
      const totalPoints = (totalWins * 3) + (totalDraws * 1);
      const initials = p.name.substring(0, 2).toUpperCase();

      return {
        ...p,
        wins: totalWins,
        draws: totalDraws,
        goals: totalGoals,
        points: totalPoints,
        initials,
      };
    }).sort((a, b) => b.points - a.points || b.goals - a.goals);
  }, [teamStats]);

  const styles = {
    wrapper: { backgroundColor: "#0f172a", color: "#f8fafc", fontFamily: "system-ui, sans-serif", minHeight: "100vh", padding: "24px" },
    container: { maxWidth: "1100px", margin: "0 auto" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #1e293b", paddingBottom: "20px", marginBottom: "30px", flexWrap: "wrap", gap: "20px" },
    title: { fontSize: "2.5rem", fontWeight: "800", color: "#ffffff", margin: 0, letterSpacing: "-0.05em" },
    subtitle: { color: "#fbbf24", fontSize: "1.25rem", fontWeight: "700", marginTop: "6px", letterSpacing: "0.05em" },
    apiBtn: (loading) => ({ padding: "10px 20px", backgroundColor: loading ? "#64748b" : "#10b981", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", transition: "background-color 0.2s" }),
    table: { width: "100%", borderCollapse: "collapse", textAlign: "left", backgroundColor: "#1e293b", borderRadius: "12px", overflow: "hidden" },
    th: { backgroundColor: "#0f172a", color: "#94a3b8", padding: "16px", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #334155" },
    td: { padding: "16px", borderBottom: "1px solid #334155", fontSize: "0.95rem" },
    badge: (rank) => ({
      display: "inline-flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "50%", fontWeight: "bold", fontSize: "0.85rem",
      backgroundColor: rank === 1 ? "#fef3c7" : rank === 2 ? "#e2e8f0" : rank === 3 ? "#ffedd5" : "#334155",
      color: rank === 1 ? "#d97706" : rank === 2 ? "#475569" : rank === 3 ? "#c2410c" : "#94a3b8"
    }),
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>2026 TRC FIFA World Cup Sweepstakes!</h1>
            <div style={styles.subtitle}>Winner Winner Chicken Dinner (Top) & Wooden Spoon (Low)</div>
          </div>
          <button onClick={fetchLiveData} disabled={isSyncing} style={styles.apiBtn(isSyncing)}>
            {isSyncing ? "Syncing..." : "Refresh Live Data"}
          </button>
        </header>

        <div style={{ overflowX: "auto", borderRadius: "12px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.4)" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, textAlign: "center", width: "70px" }}>Rank</th>
                <th style={styles.th}>Participant</th>
                <th style={styles.th}>Top-Tier Pick</th>
                <th style={styles.th}>Lower-Tier Pick</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Wins</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Draws</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Goals</th>
                <th style={{ ...styles.th, textAlign: "right", paddingRight: "30px", color: "#fbbf24" }}>Total Pts</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((player, index) => (
                <tr
                  key={player.id}
                  style={{ borderBottom: "1px solid #334155", transition: "background-color 0.2s" }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0f172a")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td style={{ ...styles.td, textAlign: "center" }}>
                    <span style={styles.badge(index + 1)}>{index + 1}</span>
                  </td>
                  <td style={{ ...styles.td, fontWeight: "600", color: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#475569", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: "bold", color: "#e2e8f0" }}>
                        {player.initials}
                      </div>
                      {player.name}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{ marginRight: "8px", fontSize: "1.1rem" }}>{player.topFlag}</span> {player.topTeam}
                  </td>
                  <td style={styles.td}>
                    <span style={{ marginRight: "8px", fontSize: "1.1rem" }}>{player.lowFlag}</span> {player.lowTeam}
                  </td>
                  <td style={{ ...styles.td, textAlign: "center", color: "#cbd5e1", fontWeight: "500" }}>{player.wins}</td>
                  <td style={{ ...styles.td, textAlign: "center", color: "#94a3b8", fontWeight: "500" }}>{player.draws}</td>
                  <td style={{ ...styles.td, textAlign: "center", color: "#22d3ee", fontWeight: "500" }}>{player.goals}</td>
                  <td style={{ ...styles.td, textAlign: "right", paddingRight: "30px", fontWeight: "900", fontSize: "1.2rem", color: "#fbbf24" }}>
                    {player.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
