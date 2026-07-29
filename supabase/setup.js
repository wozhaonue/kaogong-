import { getSupabaseConfig, getSupabaseOverrideKeys, isSupabaseConfigured } from "../scripts/supabase-config.js";

const elements = {
  form: document.getElementById("setup-form"),
  url: document.getElementById("supabase-url"),
  anonKey: document.getElementById("supabase-anon-key"),
  clear: document.getElementById("clear-config"),
  reload: document.getElementById("reload-config"),
  currentOrigin: document.getElementById("current-origin"),
  configState: document.getElementById("config-state"),
  urlKey: document.getElementById("url-key"),
  anonKeyKey: document.getElementById("anon-key"),
  status: document.getElementById("status-banner")
};

const overrideKeys = getSupabaseOverrideKeys();

bootstrap();

function bootstrap() {
  elements.currentOrigin.textContent = globalThis.location.origin;
  elements.urlKey.textContent = overrideKeys.url;
  elements.anonKeyKey.textContent = overrideKeys.anonKey;
  renderCurrentValues();

  elements.form.addEventListener("submit", handleSubmit);
  elements.clear.addEventListener("click", handleClear);
  elements.reload.addEventListener("click", function () {
    renderCurrentValues();
    setStatus("已从当前浏览器重新读取配置。", "info");
  });
}

function handleSubmit(event) {
  event.preventDefault();

  const url = elements.url.value.trim();
  const anonKey = elements.anonKey.value.trim();

  if (!url || !anonKey) {
    setStatus("请先同时填写 Supabase URL 和 anon key。", "warning");
    return;
  }

  try {
    new URL(url);
  } catch {
    setStatus("Supabase URL 不是合法的地址。", "warning");
    elements.url.focus();
    return;
  }

  localStorage.setItem(overrideKeys.url, url);
  localStorage.setItem(overrideKeys.anonKey, anonKey);
  renderCurrentValues();
  setStatus("配置已保存到当前浏览器。现在回到工具页刷新即可继续联调。", "success");
}

function handleClear() {
  localStorage.removeItem(overrideKeys.url);
  localStorage.removeItem(overrideKeys.anonKey);
  renderCurrentValues();
  setStatus("当前浏览器中的 Supabase 本地配置已清除。", "info");
}

function renderCurrentValues() {
  const config = getSupabaseConfig();
  elements.url.value = config.url || "";
  elements.anonKey.value = config.anonKey || "";
  elements.configState.textContent = isSupabaseConfigured() ? "已配置" : "未配置";
}

function setStatus(message, tone) {
  elements.status.dataset.tone = tone;
  elements.status.textContent = message;
}
