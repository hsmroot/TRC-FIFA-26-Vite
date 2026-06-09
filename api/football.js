export default async function handler(req, res) {
  // 1. Force the browser to accept this response, even if it's an error
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    console.log("Attempting to fetch from Football API...");
    
    const response = await fetch("https://api.football-data.org/v4/matches?competitions=2000", {
      headers: { "X-Auth-Token": "43eeec2981614dfc9b8f30a1a5bb8c01" }
    });
    
    const data = await response.json();

    // 2. If the Football API rejects us (e.g., rate limit), pass that exact error to the browser
    if (!response.ok) {
      console.error("Football API rejected the request:", data);
      return res.status(response.status).json(data);
    }

    console.log("Success! Sending data to frontend.");
    res.status(200).json(data);
    
  } catch (error) {
    // 3. If the server crashes, log the exact reason
    console.error("Vercel Server Crash:", error.message);
    res.status(500).json({ error: error.message || "Failed to fetch football data" });
  }
}
