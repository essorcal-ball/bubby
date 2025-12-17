/* ============================================================
   Shop Logic
   ============================================================ */

function initShop() {
  const u = getCurrentUser();
  if (!u) {
    document.getElementById("shop-items").innerHTML = "<p>Please login to access the shop.</p>";
    return;
  }
  const data = getUserData(u);

  const shopItems = [
    { name: "Double Jump", cost: 10, key: "jump" },
    { name: "Magnet", cost: 15, key: "magnet" },
    { name: "Hacker Ability", cost: 20, key: "hacker" },
    { name: "Time Warp", cost: 25, key: "time" },
    { name: "Curse Bender", cost: 30, key: "curseBender" },
    { name: "Golden Skin", cost: 100, key: "goldenSkin" }
  ];

  const container = document.getElementById("shop-items");
  container.innerHTML = "";

  shopItems.forEach(item => {
    const owned = data.upgrades[item.key] > 0 || (item.key === "goldenSkin" && data.skins.owned.includes("golden"));
    const div = document.createElement("div");
    div.className = "flex justify-between bg-gray-700 p-2 rounded";
    div.innerHTML = `
      <span>${item.name} (Cost: ${item.cost})</span>
      <button class="bg-blue-500 px-2 py-1 rounded">${owned ? "Owned" : "Buy"}</button>
    `;
    const btn = div.querySelector("button");
    if (!owned) {
      btn.addEventListener("click", () => {
        if (data.coins >= item.cost) {
          data.coins -= item.cost;
          if (item.key === "goldenSkin") {
            data.skins.owned.push("golden");
          } else {
            data.upgrades[item.key] = (data.upgrades[item.key] || 0) + 1;
          }
          saveUserData(u, data);
          alert("Purchased " + item.name);
          initShop();
        } else {
          alert("Not enough coins!");
        }
      });
    }
    container.appendChild(div);
  });
}
