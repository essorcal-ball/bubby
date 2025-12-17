/* ============================================================
   Shop Logic
   ============================================================ */

function initShop() {
  const u = getCurrentUser();
  const container = document.getElementById("shop-items");
  container.innerHTML = "";

  if (!u) {
    container.innerHTML = "<p class='text-red-500'>Please login to access the shop.</p>";
    return;
  }

  const data = getUserData(u);

  // Define shop items
  const shopItems = [
    { name: "Double Jump", cost: 10, key: "jump", description: "Allows you to jump twice." },
    { name: "Triple Jump", cost: 20, key: "jump2", description: "Allows you to jump three times." },
    { name: "Magnet", cost: 15, key: "magnet", description: "Pulls coins toward you." },
    { name: "Hacker Ability", cost: 20, key: "hacker", description: "Bypass obstacles temporarily." },
    { name: "Time Warp", cost: 25, key: "time", description: "Slow down time for a few seconds." },
    { name: "Curse Bender", cost: 30, key: "curseBender", description: "Block bad curses." },
    { name: "Golden Skin", cost: 100, key: "goldenSkin", description: "Special golden stickman skin." }
  ];

  shopItems.forEach(item => {
    const owned = checkOwned(data, item.key);
    const div = document.createElement("div");
    div.className = "bg-gray-700 p-3 rounded flex flex-col gap-2";

    const title = document.createElement("div");
    title.className = "flex justify-between items-center";
    title.innerHTML = `<span class="font-bold">${item.name}</span><span>Cost: ${item.cost}</span>`;

    const desc = document.createElement("p");
    desc.className = "text-sm text-gray-300";
    desc.textContent = item.description;

    const btn = document.createElement("button");
    btn.className = "bg-blue-500 px-2 py-1 rounded text-white";
    btn.textContent = owned ? "Owned" : "Buy";

    if (!owned) {
      btn.addEventListener("click", () => {
        if (data.coins >= item.cost) {
          data.coins -= item.cost;
          applyPurchase(data, item.key);
          saveUserData(u, data);
          alert("Purchased " + item.name);
          initShop();
        } else {
          alert("Not enough coins!");
        }
      });
    } else {
      btn.disabled = true;
      btn.classList.add("opacity-50","cursor-not-allowed");
    }

    div.appendChild(title);
    div.appendChild(desc);
    div.appendChild(btn);
    container.appendChild(div);
  });
}

/* ============================================================
   Helpers
   ============================================================ */

// Check if item is owned
function checkOwned(data, key) {
  if (key === "goldenSkin") {
    return data.skins.owned.includes("golden");
  }
  return (data.upgrades && data.upgrades[key] > 0);
}

// Apply purchase to user data
function applyPurchase(data, key) {
  if (key === "goldenSkin") {
    if (!data.skins.owned.includes("golden")) {
      data.skins.owned.push("golden");
    }
  } else {
    data.upgrades[key] = (data.upgrades[key] || 0) + 1;
  }
}
