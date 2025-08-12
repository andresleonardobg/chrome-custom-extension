document.getElementById("unblock")?.addEventListener("click", async () => {
  const rules = await chrome.declarativeNetRequest.getDynamicRules();
  const ids = rules.map(r => r.id);
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: ids
  });

  alert("Reglas de bloqueo eliminadas. Intenta recargar la página.");
});
