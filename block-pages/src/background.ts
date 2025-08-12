
const LIMIT_PER_SITE_MINUTES : number = 10;
const TRACKED_SITES : Array<string>= ["instagram.com", "facebook.com"];

// const config = await chrome.storage.local.get("siteLimits");
// const siteLimits: { [host: string]: number } = config.siteLimits || {};

interface UsageData {
  [hostname: string]: {
    minutesToday: number;
    lastAccess: number;
    lastReset: string;
  };
}

//create id for dinamic rules
function hashId(host: string): number {
  // Convierte el hostname en un número único (simple hash numérico)
  return host.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

async function addBlockRule(hostname: string) {
  const ruleId = hashId(hostname);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [ruleId],
    addRules: [
      {
        id: ruleId,
        priority: 1,
        action: {
          type: "redirect",
          redirect: { extensionPath: "block/block.html" }
        },
        condition: {
          urlFilter: hostname,
          resourceTypes: ["main_frame"]
        }
      }
    ]
  });
}

async function removeBlockRule(hostname: string) {
  const ruleId = hashId(hostname);
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [ruleId]
  });
}

// Verifica y actualiza cada minuto
setInterval(async () => {
  const tabs = await chrome.tabs.query({ url: "<all_urls>" });
  const res = await chrome.storage.local.get("usage");
  const usage: UsageData = res.usage || {};

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  for (const tab of tabs) {
    if (!tab.url || !tab.id) continue;

    const url = new URL(tab.url);
    const hostname = url.hostname;

    // Verifica si es un sitio rastreado
    if (TRACKED_SITES.some(site => hostname.includes(site))) continue;

    // Inicializa datos si no existen
    if (!usage[hostname]) {
      usage[hostname] = {
        minutesToday: 0,
        lastAccess: Date.now(),
        lastReset: todayStr
      };
    }

    const siteData = usage[hostname];

    // Reset diario
    if (siteData.lastReset !== todayStr) {
      siteData.minutesToday = 0;
      siteData.lastReset = todayStr;

      // Quita la regla si estaba bloqueado
      await removeBlockRule(hostname);
    }

    siteData.minutesToday += 1;
    siteData.lastAccess = Date.now();

    // Si pasa del límite, bloquea y agrega regla
    if (siteData.minutesToday >= LIMIT_PER_SITE_MINUTES) {

      await addBlockRule(hostname);

      // Redirige si ya está abierta
      chrome.tabs.update(tab.id, {
        url: chrome.runtime.getURL("block/block.html")
      });
    }

    usage[hostname] = siteData;
  }

  await chrome.storage.local.set({ usage });
}, 10000); // Ejecutar cada 60 segundos

