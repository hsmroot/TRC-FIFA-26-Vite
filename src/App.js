import React, { useState, useEffect, useMemo } from "react";

// Hardcoded API Token
const API_KEY = "43eeec2981614dfc9b8f30a1a5bb8c01";

// Exactly 20 participants parsed from the TRC email header image
const INITIAL_ROSTER = [
  {
    id: 1,
    name: "Doug Wilson",
    topTeam: "France",
    topFlag: "🇫🇷",
    lowTeam: "DR Congo",
    lowFlag: "🇨🇩",
  },
  {
    id: 2,
    name: "Minh Kieu",
    topTeam: "Spain",
    topFlag: "🇪🇸",
    lowTeam: "Uzbekistan",
    lowFlag: "🇺🇿",
  },
  {
    id: 3,
    name: "Prakash Ranjitkar",
    topTeam: "Argentina",
    topFlag: "🇦🇷",
    lowTeam: "Curaçao",
    lowFlag: "🇨🇼",
  },
  {
    id: 4,
    name: "Harisankar Menon",
    topTeam: "England",
    topFlag: "🇬🇧",
    lowTeam: "Cape Verde",
    lowFlag: "🇨🇻",
  },
  {
    id: 5,
    name: "Yunlong Wang",
    topTeam: "Portugal",
    topFlag: "🇵🇹",
    lowTeam: "Haiti",
    lowFlag: "🇭🇹",
  },
  {
    id: 6,
    name: "Harshana Senanayake",
    topTeam: "Brazil",
    topFlag: "🇧🇷",
    lowTeam: "Bosnia",
    lowFlag: "🇧🇦",
  },
  {
    id: 7,
    name: "Seosamh Costello",
    topTeam: "Netherlands",
    topFlag: "🇳🇱",
    lowTeam: "New Zealand",
    lowFlag: "🇳🇿",
  },
  {
    id: 8,
    name: "Theuns Henning",
    topTeam: "Morocco",
    topFlag: "🇲🇦",
    lowTeam: "South Africa",
    lowFlag: "🇿🇦",
  },
  {
    id: 9,
    name: "Subeh Chowdhury",
    topTeam: "Belgium",
    topFlag: "🇧🇪",
    lowTeam: "Panama",
    lowFlag: "🇵🇦",
  },
  {
    id: 10,
    name: "Bevan Clement",
    topTeam: "Germany",
    topFlag: "🇩🇪",
    lowTeam: "Ghana",
    lowFlag: "🇬🇭",
  },
  {
    id: 11,
    name: "Nikhil Narayan",
    topTeam: "Uruguay",
    topFlag: "🇺🇾",
    lowTeam: "Jordan",
    lowFlag: "🇯🇴",
  },
  {
    id: 12,
    name: "Neil Airey",
    topTeam: "USA",
    topFlag: "🇺🇸",
    lowTeam: "Iraq",
    lowFlag: "🇮🇶",
  },
  {
    id: 13,
    name: "Paul Martin",
    topTeam: "Mexico",
    topFlag: "🇲🇽",
    lowTeam: "Saudi Arabia",
    lowFlag: "🇸🇦",
  },
  {
    id: 14,
    name: "Bernard Jacobsen",
    topTeam: "Colombia",
    topFlag: "🇨🇴",
    lowTeam: "Qatar",
    lowFlag: "🇶🇦",
  },
  {
    id: 15,
    name: "Kamran Mukhtar",
    topTeam: "Switzerland",
    topFlag: "🇨🇭",
    lowTeam: "Tunisia",
    lowFlag: "🇹🇳",
  },
  {
    id: 16,
    name: "Parichehr Dogani Aghcheghloo",
    topTeam: "Croatia",
    topFlag: "🇭🇷",
    lowTeam: "Egypt",
    lowFlag: "🇪🇬",
  },
  {
    id: 17,
    name: "Irina Holleran",
    topTeam: "Japan",
    topFlag: "🇯🇵",
    lowTeam: "Czech Republic",
    lowFlag: "🇨🇿",
  },
  {
    id: 18,
    name: "Qihan Zhong",
    topTeam: "Senegal",
    topFlag: "🇸🇳",
    lowTeam: "Austria",
    lowFlag: "🇦🇹",
  },
  {
    id: 19,
    name: "Hongyu Wang",
    topTeam: "Italy",
    topFlag: "🇮🇹",
    lowTeam: "Jamaica",
    lowFlag: "🇯🇲",
  },
  {
    id: 20,
    name: "Sean Bearsley",
    topTeam: "South Korea",
    topFlag: "🇰🇷",
    lowTeam: "Ecuador",
    lowFlag: "🇪🇨",
  },
];

const INITIAL_TEAM_STATS = {};
INITIAL_ROSTER.forEach((p) => {
  INITIAL_TEAM_STATS[p.topTeam] = { wins: 0, cleanSheets: 0 };
  INITIAL_TEAM_STATS[p.lowTeam] = { wins: 0, cleanSheets: 0 };
});

export default function App() {
  const [teamStats, setTeamStats] = useState(INITIAL_TEAM_STATS);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchLiveData = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(
        "https://api.football-data.org/v4/matches?competitions=2000",
        { headers: { "X-Auth-Token": API_KEY } }
      );

      if (!response.ok)
        throw new Error(`API returned status: ${response.status}`);

      const data = await response.json();
      const freshStats = JSON.parse(JSON.stringify(INITIAL_TEAM_STATS));

      data.matches?.forEach((match) => {
        if (match.status === "FINISHED") {
          const homeTeam = match.homeTeam.name;
          const awayTeam = match.awayTeam.name;
          const homeGoals = match.score.fullTime.home;
          const awayGoals = match.score.fullTime.away;

          if (freshStats[homeTeam]) {
            if (homeGoals > awayGoals) freshStats[homeTeam].wins += 1;
            if (awayGoals === 0) freshStats[homeTeam].cleanSheets += 1;
          }
          if (freshStats[awayTeam]) {
            if (awayGoals > homeGoals) freshStats[awayTeam].wins += 1;
            if (homeGoals === 0) freshStats[awayTeam].cleanSheets += 1;
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
      const top = teamStats[p.topTeam] || { wins: 0, cleanSheets: 0 };
      const low = teamStats[p.lowTeam] || { wins: 0, cleanSheets: 0 };
      const totalWins = top.wins + low.wins;
      const totalCS = top.cleanSheets + low.cleanSheets;
      const totalPoints = totalWins * 3 + totalCS * 1;
      const initials = p.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2);

      return {
        ...p,
        wins: totalWins,
        cleanSheets: totalCS,
        points: totalPoints,
        initials,
      };
    }).sort((a, b) => b.points - a.points || b.wins - a.wins);
  }, [teamStats]);

  const styles = {
    wrapper: {
      backgroundColor: "#0f172a",
      color: "#f8fafc",
      fontFamily: "system-ui, sans-serif",
      minHeight: "100vh",
      padding: "24px",
    },
    container: { maxWidth: "1100px", margin: "0 auto" },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "2px solid #1e293b",
      paddingBottom: "20px",
      marginBottom: "30px",
      flexWrap: "wrap",
      gap: "20px",
    },
    title: {
      fontSize: "2.5rem",
      fontWeight: "800",
      color: "#ffffff",
      margin: 0,
      letterSpacing: "-0.05em",
    },
    subtitle: {
      color: "#fbbf24",
      fontSize: "1.25rem",
      fontWeight: "700",
      marginTop: "6px",
      letterSpacing: "0.05em",
    },
    apiBtn: (loading) => ({
      padding: "10px 20px",
      backgroundColor: loading ? "#64748b" : "#10b981",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      fontWeight: "bold",
      cursor: loading ? "not-allowed" : "pointer",
      transition: "background-color 0.2s",
    }),
    table: {
      width: "100%",
      borderCollapse: "collapse",
      textAlign: "left",
      backgroundColor: "#1e293b",
      borderRadius: "12px",
      overflow: "hidden",
    },
    th: {
      backgroundColor: "#0f172a",
      color: "#94a3b8",
      padding: "16px",
      fontSize: "0.8rem",
      textTransform: "uppercase",
      letterSpacing: "1px",
      borderBottom: "1px solid #334155",
    },
    td: {
      padding: "16px",
      borderBottom: "1px solid #334155",
      fontSize: "0.95rem",
    },
    badge: (rank) => ({
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      fontWeight: "bold",
      fontSize: "0.85rem",
      backgroundColor:
        rank === 1
          ? "#fef3c7"
          : rank === 2
          ? "#e2e8f0"
          : rank === 3
          ? "#ffedd5"
          : "#334155",
      color:
        rank === 1
          ? "#d97706"
          : rank === 2
          ? "#475569"
          : rank === 3
          ? "#c2410c"
          : "#94a3b8",
    }),
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>2026 TRC FIFA World Cup Sweepstakes!</h1>
            <div style={styles.subtitle}>Winner WInner TRC Chicken DInner!</div>
          </div>
          <button
            onClick={fetchLiveData}
            disabled={isSyncing}
            style={styles.apiBtn(isSyncing)}
          >
            {isSyncing ? "Syncing..." : "Refresh Live Data"}
          </button>
        </header>

        <div
          style={{
            overflowX: "auto",
            borderRadius: "12px",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.4)",
          }}
        >
          <table style={styles.table}>
            <thead>
              <tr>
                <th
                  style={{ ...styles.th, textAlign: "center", width: "70px" }}
                >
                  Rank
                </th>
                <th style={styles.th}>Participant Name</th>
                <th style={styles.th}>Top-Tier Pick</th>
                <th style={styles.th}>Lower-Tier Pick</th>
                <th style={{ ...styles.th, textAlign: "center" }}>
                  Total Wins
                </th>
                <th style={{ ...styles.th, textAlign: "center" }}>
                  Clean Sheets
                </th>
                <th
                  style={{
                    ...styles.th,
                    textAlign: "right",
                    paddingRight: "30px",
                    color: "#fbbf24",
                  }}
                >
                  Total Pts
                </th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((player, index) => (
                <tr
                  key={player.id}
                  style={{
                    borderBottom: "1px solid #334155",
                    transition: "background-color 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#0f172a")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <td style={{ ...styles.td, textAlign: "center" }}>
                    <span style={styles.badge(index + 1)}>{index + 1}</span>
                  </td>
                  <td
                    style={{ ...styles.td, fontWeight: "600", color: "#fff" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          backgroundColor: "#475569",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          color: "#e2e8f0",
                        }}
                      >
                        {player.initials}
                      </div>
                      {player.name}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{ marginRight: "8px", fontSize: "1.1rem" }}>
                      {player.topFlag}
                    </span>{" "}
                    {player.topTeam}
                  </td>
                  <td style={styles.td}>
                    <span style={{ marginRight: "8px", fontSize: "1.1rem" }}>
                      {player.lowFlag}
                    </span>{" "}
                    {player.lowTeam}
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      textAlign: "center",
                      color: "#cbd5e1",
                      fontWeight: "500",
                    }}
                  >
                    {player.wins}
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      textAlign: "center",
                      color: "#22d3ee",
                      fontWeight: "500",
                    }}
                  >
                    {player.cleanSheets}
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      textAlign: "right",
                      paddingRight: "30px",
                      fontWeight: "900",
                      fontSize: "1.2rem",
                      color: "#fbbf24",
                    }}
                  >
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
