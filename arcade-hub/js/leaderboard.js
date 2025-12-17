/* ============================================================
   Leaderboard Logic
   ============================================================ */

function initLeaderboard() {
  const container = document.getElementById("leaderboard");
  container.innerHTML = "";

  const users = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("arcadeUser_")) {
      const data = JSON.parse(localStorage.getItem(key));
      users.push({ name: key.replace("arcadeUser_", ""), score: data.highScoreStickman || 0 });
    }
  }

  users.sort((a, b) => b.score - a.score);

  users.forEach(u => {
    const div = document.createElement("div");
    div.className = "flex justify-between bg-gray-700 p-2 rounded";
    div.innerHTML = `<span>${u.name}</span><span>${u.score}</span>`;
    container.appendChild(div);
  });
}
