/* ============================================================
   Admin Panel Logic
   ============================================================ */

function initAdmin() {
  const container = document.getElementById("admin-panel");
  container.innerHTML = "";

  // Reset Leaderboard Button
  const resetBtn = document.createElement("button");
  resetBtn.className = "bg-red-500 px-2 py-1 rounded";
  resetBtn.textContent = "Reset Leaderboard";
  resetBtn.addEventListener("click", () => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("arcadeUser_")) {
        const data = JSON.parse(localStorage.getItem(key));
        data.highScoreStickman = 0;
        saveUserData(key.replace("arcadeUser_", ""), data);
      }
    }
    alert("Leaderboard reset!");
  });

  // Ban User Button
  const banBtn = document.createElement("button");
  banBtn.className = "bg-red-700 px-2 py-1 rounded";
  banBtn.textContent = "Ban User";
  banBtn.addEventListener("click", () => {
    const username = prompt("Enter username to ban:");
    if (username) {
      localStorage.removeItem("arcadeUser_" + username);
      alert(username + " has been banned (data deleted).");
    }
  });

  // View All Users Button
  const viewBtn = document.createElement("button");
  viewBtn.className = "bg-blue-600 px-2 py-1 rounded";
  viewBtn.textContent = "View All Users";
  viewBtn.addEventListener("click", () => {
    let users = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("arcadeUser_")) {
        const data = JSON.parse(localStorage.getItem(key));
        users.push(`${key.replace("arcadeUser_", "")} | Coins: ${data.coins} | High Score: ${data.highScoreStickman}`);
      }
    }
    alert("Users:\n" + users.join("\n"));
  });

  // Append buttons to container
  container.appendChild(resetBtn);
  container.appendChild(banBtn);
  container.appendChild(viewBtn);
}
