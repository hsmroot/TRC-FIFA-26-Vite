import React, { useState, useEffect, useMemo, useRef } from "react";

// 24 Participants - Ranked Top-Tier paired inversely with Lowest-Tier (100% 2026 Qualified Teams)
const INITIAL_ROSTER = [
  { id: 1, name: "Zhihao", topTeam: "France", topFlag: "🇫🇷", lowTeam: "Scotland", lowFlag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { id: 2, name: "Junrun", topTeam: "Argentina", topFlag: "🇦🇷", lowTeam: "Tunisia", lowFlag: "🇹🇳" },
  { id: 3, name: "Tahmid", topTeam: "Brazil", topFlag: "🇧🇷", lowTeam: "Haiti", lowFlag: "🇭🇹" },
  { id: 4, name: "Hari", topTeam: "Uruguay", topFlag: "🇺🇾", lowTeam: "Congo DR", lowFlag: "🇨🇩" },
  { id: 5, name: "Theuns", topTeam: "Spain", topFlag: "🇪🇸", lowTeam: "Paraguay", lowFlag: "🇵🇾" },
  { id: 6, name: "Doug", topTeam: "Portugal", topFlag: "🇵🇹", lowTeam: "Uzbekistan", lowFlag: "🇺🇿" },
  { id: 7, name: "Nikhil", topTeam: "Netherlands", topFlag: "🇳🇱", lowTeam: "Jordan", lowFlag: "🇯🇴" },
  { id: 8, name: "Qihan", topTeam: "Germany", topFlag: "🇩🇪", lowTeam: "Cabo Verde", lowFlag: "🇨🇻" },
  { id: 9, name: "Neil", topTeam: "USA", topFlag: "🇺🇸", lowTeam: "IR Iran", lowFlag: "🇮🇷" },
  { id: 10, name: "Yunlong", topTeam: "Belgium", topFlag: "🇧🇪", lowTeam: "New Zealand", lowFlag: "🇳🇿" },
  { id: 11, name: "Minh", topTeam: "England", topFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", lowTeam: "Canada", lowFlag: "🇨🇦" },
  { id: 12, name: "Paul", topTeam: "Colombia", topFlag: "🇨🇴", lowTeam: "Algeria", lowFlag: "🇩🇿" },
  { id: 13, name: "Sean", topTeam: "Croatia", topFlag: "🇭🇷", lowTeam: "Qatar", lowFlag: "🇶🇦" },
  { id: 14, name: "Hongyu", topTeam: "Morocco", topFlag: "🇲🇦", lowTeam: "South Africa", lowFlag: "🇿🇦" },
  { id: 15, name: "Hassan", topTeam: "Mexico", topFlag: "🇲🇽", lowTeam: "Iraq", lowFlag: "🇮🇶" },
  { id: 16, name: "Pari", topTeam: "Sweden", topFlag: "🇸🇪", lowTeam: "Curaçao", lowFlag: "🇨🇼" },
  { id: 17, name: "Harshana", topTeam: "Senegal", topFlag: "🇸🇳", lowTeam: "Bosnia and Herzegovina", lowFlag: "🇧🇦" },
  { id: 18, name: "Jawed", topTeam: "Japan", topFlag: "🇯🇵", lowTeam: "Czechia", lowFlag: "🇨🇿" },
  { id: 19, name: "Jade", topTeam: "Switzerland", topFlag: "🇨🇭", lowTeam: "Ghana", lowFlag: "🇬🇭" },
  { id: 20, name: "Qi", topTeam: "Korea Republic", topFlag: "🇰🇷", lowTeam: "Saudi Arabia", lowFlag: "🇸🇦" },
  { id: 21, name: "Bevan", topTeam: "Australia", topFlag: "🇦🇺", lowTeam: "Panama", lowFlag: "🇵🇦" },
  { id: 22, name: "Johnson", topTeam: "Austria", topFlag: "🇦🇹", lowTeam: "Egypt", lowFlag: "🇪🇬" },
  { id: 23, name: "Huo", topTeam: "Ecuador", topFlag: "🇪🇨", lowTeam: "Côte d'Ivoire", lowFlag: "🇨🇮" },
  { id: 24, name: "Jackie", topTeam: "Türkiye", topFlag: "🇹🇷", lowTeam: "Norway", lowFlag: "🇳🇴" }
];

const INITIAL_TEAM_STATS = {};
INITIAL_ROSTER.forEach((p) => {
  INITIAL_TEAM_STATS[p.topTeam] = { wins: 0, draws: 0, goals: 0 };
  INITIAL_TEAM_STATS[p.lowTeam] = { wins: 0, draws: 0, goals: 0 };
});

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

export default function App() {
  const [teamStats, setTeamStats] = useState(INITIAL_TEAM_STATS);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [nextUpdateIn, setNextUpdateIn] = useState(TWO_HOURS_MS);

  // Quick lookup table to match a Country name -> Participant Name
  const teamToPersonMap = useMemo(() => {
    const map = {};
    INITIAL_ROSTER.forEach((p) => {
      map[p.topTeam] = p.name;
      map[p.lowTeam] = p.name;
    });
    return map;
  }, []);

  const fetchLiveData = async () => {
    try {
      const response = await fetch("/api/football");
      if (!response.ok) throw new Error(`API returned status: ${response.status}`);

      const data = await response.json();
      const freshStats = JSON.parse(JSON.stringify(INITIAL_TEAM_STATS));

      const apiNameMap = {
        "Czech Republic": "Czechia",
        "South Korea": "Korea Republic",
        "United States": "USA",
        "Ivory Coast": "Côte d'Ivoire",
        "Turkey": "Türkiye",
        "Cape Verde": "Cabo Verde",
        "Iran": "IR Iran",
        "DR Congo": "Congo DR"
      };

      const normalize = (name) => apiNameMap[name] || name;

      data.matches?.forEach((match) => {
        const homeTeam = normalize(match.homeTeam.name);
        const awayTeam = normalize(match.awayTeam.name);

        if (match.status === "FINISHED") {
          let homeOfficialScore = match.score.fullTime.home !== null ? match.score.fullTime.home : 0;
          let awayOfficialScore = match.score.fullTime.away !== null ? match.score.fullTime.away : 0;

          if (match.score.penalties && match.score.penalties.home !== null) {
            homeOfficialScore -= match.score.penalties.home;
            awayOfficialScore -= match.score.penalties.away;
          }

          if (freshStats[homeTeam]) {
            if (homeOfficialScore > awayOfficialScore) freshStats[homeTeam].wins += 1;
            else if (homeOfficialScore === awayOfficialScore) freshStats[homeTeam].draws += 1;
            freshStats[homeTeam].goals += homeOfficialScore;
          }
          if (freshStats[awayTeam]) {
            if (awayOfficialScore > homeOfficialScore) freshStats[awayTeam].wins += 1;
            else if (homeOfficialScore === awayOfficialScore) freshStats[awayTeam].draws += 1;
            freshStats[awayTeam].goals += awayOfficialScore;
          }
        }
      });

      // Filter for upcoming fixtures
      const futureFixtures = (data.matches || [])
        .filter((m) => m.status === "TIMED" || m.status === "SCHEDULED")
        .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
        .slice(0, 3)
        .map((m) => {
          const hTeam = normalize(m.homeTeam.name);
          const aTeam = normalize(m.awayTeam.name);
          return {
            id: m.id,
            date: new Date(m.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', weekday: 'short' }),
            home: { country: hTeam, person: teamToPersonMap[hTeam] || "External" },
            away: { country: aTeam, person: teamToPersonMap[aTeam] || "External" }
          };
        });

      setTeamStats(freshStats);
      setUpcomingMatches(futureFixtures);
      setLastUpdated(new Date().toLocaleTimeString());
      setNextUpdateIn(TWO_HOURS_MS); // Reset countdown clock

    } catch (error) {
      console.error("Sync Error:", error);
    }
  };

  // 1. Initial Fetch + 2-Hour Auto-Sync Cycle
  useEffect(() => {
    fetchLiveData();
    const syncInterval = setInterval(fetchLiveData, TWO_HOURS_MS);
    return () => clearInterval(syncInterval);
  }, []);

  // 2. Visual Countdown Ticker (Updates every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setNextUpdateIn((prev) => (prev > 1000 ? prev - 1000 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (ms) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
  };

  const leaderboardData = useMemo(() => {
    return INITIAL_ROSTER.map((p) => {
      const top = teamStats[p.topTeam] || { wins: 0, draws: 0, goals: 0 };
      const low = teamStats[p.lowTeam] || { wins: 0, draws: 0, goals: 0 };
      
      const totalWins = top.wins + low.wins;
      const totalDraws = top.draws + low.draws;
      const totalGoals = top.goals + low.goals;
      
      // Standard FIFA rule: 3 pts for Win, 1 pt for Draw. 
      // (Add "+ totalGoals" at the end of the line below if you want custom 1 Goal = 1 Pt rules!)
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
    header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #1e293b", paddingBottom: "24px", marginBottom: "24px", flexWrap: "wrap", gap: "20px" },
    titleBox: { display: "flex", flexDirection: "column", gap: "6px", flex: "1 1 300px" },
    title: { fontSize: "2.2rem", fontWeight: "800", color: "#ffffff", margin: 0, letterSpacing: "-0.04em" },
    subtitle: { color: "#fbbf24", fontSize: "1.1rem", fontWeight: "700", margin: 0 },
    timestampBox: { marginTop: "8px", fontSize: "0.85rem", color: "#94a3b8" },
    
    // Upcoming Matches Widget Styling
    fixturesWidget: { flex: "1 1 450px", backgroundColor: "#1e293b", borderRadius: "10px", padding: "16px", border: "1px solid #334155" },
    widgetHeader: { fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px", color: "#38bdf8", fontWeight: "700", marginBottom: "12px", borderBottom: "1px solid #334155", paddingBottom: "6px" },
    matchRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", fontSize: "0.9rem", borderBottom: "1px solid rgba(255,255,255,0.05)" },
    teamSide: { display: "flex", flexDirection: "column", width: "42%" },
    personTag: { fontSize: "0.75rem", color: "#fbbf24", fontWeight: "600" },
    vsBadge: { fontSize: "0.75rem", fontWeight: "800", backgroundColor: "#0f172a", color: "#64748b", padding: "2px 6px", borderRadius: "4px" },
    matchTime: { fontSize: "0.7rem", color: "#64748b", width: "100%", textAlign: "center", marginTop: "2px" },

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
          
          {/* Left Side: Title & Sync Timestamps */}
          <div style={styles.titleBox}>
            <h1 style={styles.title}>2026 TRC World Cup Sweepstakes</h1>
            <h2 style={styles.subtitle}>Winner Winner Chicken Dinner</h2>
            <div style={styles.timestampBox}>
              <div>⚡ Last API Sync: <strong style={{color: "#e2e8f0"}}>{lastUpdated || "Fetching..."}</strong></div>
              <div>⏳ Next Auto-Update in: <span style={{color: "#38bdf8"}}>{formatCountdown(nextUpdateIn)}</span></div>
            </div>
          </div>

          {/* Right Side: Next 3 Matches Banner */}
          <div style={styles.fixturesWidget}>
            <div style={styles.widgetHeader}>📅 Next 3 Upcoming Matches</div>
            {upcomingMatches.length === 0 ? (
              <div style={{fontSize: "0.85rem", color: "#64748b", padding: "10px 0"}}>No upcoming scheduled fixtures found.</div>
            ) : (
              upcomingMatches.map((m) => (
                <div key={m.id} style={styles.matchRow}>
                  {/* Home Team */}
                  <div style={{...styles.teamSide, alignItems: "flex-start"}}>
                    <strong>{m.home.country}</strong>
                    <span style={styles.personTag}>👤 {m.home.person}</span>
                  </div>

                  {/* VS Divider */}
                  <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <span style={styles.vsBadge}>VS</span>
                    <span style={styles.matchTime}>{m.date}</span>
                  </div>

                  {/* Away Team */}
                  <div style={{...styles.teamSide, alignItems: "flex-end"}}>
                    <strong>{m.away.country}</strong>
                    <span style={styles.personTag}>{m.away.person} 👤</span>
                  </div>
                </div>
              ))
            )}
          </div>

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
