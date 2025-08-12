function saveSite() {
  const site = document.getElementById("siteInput").value.trim();
  const limit = parseInt(document.getElementById("limitInput").value.trim());

  if (!site || isNaN(limit) || limit <= 0) {
    alert("Por favor, ingresa un sitio válido y un tiempo mayor a 0.");
    return;
  }

  chrome.storage.local.get("siteLimits", (data) => {
    const siteLimits = data.siteLimits || {};
    siteLimits[site] = limit;
    chrome.storage.local.set({ siteLimits }, loadList);
  });
}

function removeSite(site) {
  chrome.storage.local.get("siteLimits", (data) => {
    const siteLimits = data.siteLimits || {};
    delete siteLimits[site];
    chrome.storage.local.set({ siteLimits }, loadList);
  });
}

function loadList() {
  chrome.storage.local.get("siteLimits", (data) => {
    const siteLimits = data.siteLimits || {};
    const list = document.getElementById("siteList");
    list.innerHTML = "";

    Object.entries(siteLimits).forEach(([site, limit]) => {
      const li = document.createElement("li");
      li.className = "site-item";
      li.innerHTML = `
        <span><strong>${site}</strong>: ${limit} min/día</span>
        <button onclick="removeSite('${site}')">Eliminar</button>
      `;
      list.appendChild(li);
    });
  });
}

document.getElementById("addBtn").addEventListener("click", saveSite);
document.addEventListener("DOMContentLoaded", loadList);
