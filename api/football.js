export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.football-data.org/v4/matches?competitions=2000", {
      headers: { "X-Auth-Token": "43eeec2981614dfc9b8f30a1a5bb8c01" }
    });
    
    const data = await response.json();

    // This is the magic line that forces the browser to accept the data
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
    
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch football data" });
  }
}
