export default async function handler(req, res) {
  // Force the browser to accept this response
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    console.log("Fetching entire tournament bracket...");
    
    // UPDATED URL: Fetching the entire Euro 2024 competition bracket
    const response = await fetch("https://api.football-data.org/v4/competitions/2000/matches", {
      headers: { "X-Auth-Token": "43eeec2981614dfc9b8f30a1a5bb8c01" }
    });
    
    const data = await response.json();

    if (!response.ok) {
      console.error("Football API rejected the request:", data);
      return res.status(response.status).json(data);
    }

    console.log("Success! Sending full bracket to frontend.");
    res.status(200).json(data);
    
  } catch (error) {
    console.error("Vercel Server Crash:", error.message);
    res.status(500).json({ error: error.message || "Failed to fetch football data" });
  }
}
