import React, { useState, useEffect, useMemo } from "react";

// 24 Participants - Names strictly match official FIFA 2026 designations
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
  const [recentMatches, setRecentMatches] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [nextUpdateIn, setNextUpdateIn] = useState(TWO_HOURS_MS);

  // Bracket state: dynamically tracks advancing teams into center stage
  const [bracketState, setBracketState] = useState({
    R32: [],
    R16: [],
    QF: [],
    SF: [],
    Finals: [],
    Winner: null
  });

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

      // Track knockout phase advancements
      const knockouts = { R32: new Set(), R16: new Set(), QF: new Set(), SF: new Set(), Finals: new Set(), Winner: null };

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

          // Populate bracket progression from official tournament stages
          const stage = match.stage;
          const winner = (match.score.winner === "HOME_TEAM") ? homeTeam : (match.score.winner === "AWAY_TEAM") ? awayTeam : null;
          
          if (stage === "LAST_32") { knockouts.R32.add(homeTeam); knockouts.R32.add(awayTeam); if(winner) knockouts.R16.add(winner); }
          if (stage === "LAST_16") { knockouts.R16.add(homeTeam); knockouts.R16.add(awayTeam); if(winner) knockouts.QF.add(winner); }
          if (stage === "QUARTER_FINALS") { knockouts.QF.add(homeTeam); knockouts.QF.add(awayTeam); if(winner) knockouts.SF.add(winner); }
          if (stage === "SEMI_FINALS") { knockouts.SF.add(homeTeam); knockouts.SF.add(awayTeam); if(winner) knockouts.Finals.add(winner); }
          if (stage === "FINAL") { knockouts.Finals.add(homeTeam); knockouts.Finals.add(awayTeam); if(winner) knockouts.Winner = winner; }
        }
      });

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

      const pastFixtures = (data.matches || [])
        .filter((m) => m.status === "FINISHED")
        .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate))
        .slice(0, 3)
        .map((m) => {
          const hTeam = normalize(m.homeTeam.name);
          const aTeam = normalize(m.awayTeam.name);
          return {
            id: m.id,
            homeScore: m.score.fullTime.home !== null ? m.score.fullTime.home : 0,
            awayScore: m.score.fullTime.away !== null ? m.score.fullTime.away : 0,
            home: { country: hTeam, person: teamToPersonMap[hTeam] || "External" },
            away: { country: aTeam, person: teamToPersonMap[aTeam] || "External" }
          };
        });

      setTeamStats(freshStats);
      setUpcomingMatches(futureFixtures);
      setRecentMatches(pastFixtures);
      
      // Update knockout state arrays
      setBracketState({
        R32: Array.from(knockouts.R32),
        R16: Array.from(knockouts.R16),
        QF: Array.from(knockouts.QF),
        SF: Array.from(knockouts.SF),
        Finals: Array.from(knockouts.Finals),
        Winner: knockouts.Winner
      });

      setLastUpdated(new Date().toLocaleTimeString());
      setNextUpdateIn(TWO_HOURS_MS);

    } catch (error) {
      console.error("Sync Error:", error);
    }
  };

  useEffect(() => {
    fetchLiveData();
    const syncInterval = setInterval(fetchLiveData, TWO_HOURS_MS);
    return () => clearInterval(syncInterval);
  }, []);
