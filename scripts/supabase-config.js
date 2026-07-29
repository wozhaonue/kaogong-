const LOCAL_OVERRIDE_KEYS = {
  url: "ditu-supabase-url",
  anonKey: "ditu-supabase-anon-key"
};

const FILE_DEFAULTS = {
  url: "",
  anonKey: ""
};

function readGlobalConfig() {
  const value = globalThis.__DITU_SUPABASE_CONFIG__;
  if (!value || typeof value !== "object") {
    return {};
  }

  return {
    url: typeof value.url === "string" ? value.url.trim() : "",
    anonKey: typeof value.anonKey === "string" ? value.anonKey.trim() : ""
  };
}

function readOverride(key) {
  try {
    return globalThis.localStorage?.getItem(key)?.trim() || "";
  } catch {
    return "";
  }
}

export function getSupabaseConfig() {
  const globalConfig = readGlobalConfig();
  return {
    url: readOverride(LOCAL_OVERRIDE_KEYS.url) || globalConfig.url || FILE_DEFAULTS.url,
    anonKey: readOverride(LOCAL_OVERRIDE_KEYS.anonKey) || globalConfig.anonKey || FILE_DEFAULTS.anonKey
  };
}

export function isSupabaseConfigured() {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.anonKey);
}

export function getSupabaseOverrideKeys() {
  return { ...LOCAL_OVERRIDE_KEYS };
}
