import { getSupabaseConfig, getSupabaseOverrideKeys, isSupabaseConfigured } from "./supabase-config.js";

const TABLES = {
  articles: "policy_articles",
  codices: "policy_codices",
  entries: "policy_codex_entries",
  toolDocuments: "tool_documents"
};

function createUnavailableService() {
  return {
    configured: false,
    available: false,
    config: getSupabaseConfig(),
    overrideKeys: getSupabaseOverrideKeys()
  };
}

export function createSupabaseBrowserService() {
  if (!isSupabaseConfigured() || !globalThis.supabase?.createClient) {
    return createUnavailableService();
  }

  const config = getSupabaseConfig();
  const client = globalThis.supabase.createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storageKey: "ditu-supabase-auth-v1"
    }
  });

  return {
    configured: true,
    available: true,
    config,
    client,
    overrideKeys: getSupabaseOverrideKeys(),
    async getSession() {
      const { data, error } = await client.auth.getSession();
      if (error) {
        throw error;
      }
      return data.session;
    },
    async signInWithOtp(email) {
      const { error } = await client.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: globalThis.location?.href
        }
      });
      if (error) {
        throw error;
      }
    },
    async signOut() {
      const { error } = await client.auth.signOut();
      if (error) {
        throw error;
      }
    },
    onAuthStateChange(callback) {
      return client.auth.onAuthStateChange((event, session) => callback(event, session));
    },
    async fetchPolicyCodexSnapshot(ownerId) {
      const [articlesResult, codicesResult, entriesResult] = await Promise.all([
        client
          .from(TABLES.articles)
          .select("*")
          .eq("owner_id", ownerId)
          .order("updated_at", { ascending: false }),
        client
          .from(TABLES.codices)
          .select("*")
          .eq("owner_id", ownerId)
          .order("updated_at", { ascending: false }),
        client
          .from(TABLES.entries)
          .select("*")
          .eq("owner_id", ownerId)
          .order("sort_order", { ascending: true })
      ]);

      const error = articlesResult.error || codicesResult.error || entriesResult.error;
      if (error) {
        throw error;
      }

      const entriesByCodexId = new Map();
      for (const row of entriesResult.data || []) {
        const collection = entriesByCodexId.get(row.codex_id) || [];
        collection.push(mapEntryRow(row));
        entriesByCodexId.set(row.codex_id, collection);
      }

      const codices = (codicesResult.data || []).map((row) => ({
        ...mapCodexRow(row),
        entries: entriesByCodexId.get(row.id) || []
      }));

      return {
        articles: (articlesResult.data || []).map(mapArticleRow),
        codices
      };
    },
    async pushPolicyCodexSnapshot(ownerId, snapshot) {
      const articles = Array.isArray(snapshot?.articles) ? snapshot.articles : [];
      const codices = Array.isArray(snapshot?.codices) ? snapshot.codices : [];
      const entries = codices.flatMap((codex) =>
        (codex.entries || []).map((entry, index) => mapEntryModel(entry, codex.id, ownerId, index))
      );

      await syncRows(client, TABLES.articles, ownerId, articles.map((article) => mapArticleModel(article, ownerId)));
      await syncRows(
        client,
        TABLES.codices,
        ownerId,
        codices.map((codex) => mapCodexModel(codex, ownerId))
      );
      await syncRows(client, TABLES.entries, ownerId, entries);
    },
    async fetchToolDocument(ownerId, toolKey) {
      const { data, error } = await client
        .from(TABLES.toolDocuments)
        .select("*")
        .eq("owner_id", ownerId)
        .eq("tool_key", toolKey)
        .maybeSingle();
      if (error) {
        throw error;
      }
      return data ? data.payload : null;
    },
    async upsertToolDocument(ownerId, toolKey, payload) {
      const { error } = await client.from(TABLES.toolDocuments).upsert(
        {
          owner_id: ownerId,
          tool_key: toolKey,
          payload,
          updated_at: new Date().toISOString()
        },
        { onConflict: "owner_id,tool_key" }
      );
      if (error) {
        throw error;
      }
    }
  };
}

async function syncRows(client, table, ownerId, rows) {
  const ids = rows.map((row) => row.id);

  if (rows.length) {
    const { error } = await client.from(table).upsert(rows, { onConflict: "id" });
    if (error) {
      throw error;
    }
  }

  const { data: remoteRows, error: fetchError } = await client.from(table).select("id").eq("owner_id", ownerId);
  if (fetchError) {
    throw fetchError;
  }

  const staleIds = (remoteRows || []).map((row) => row.id).filter((id) => !ids.includes(id));
  if (!staleIds.length) {
    return;
  }

  const { error: deleteError } = await client.from(table).delete().eq("owner_id", ownerId).in("id", staleIds);
  if (deleteError) {
    throw deleteError;
  }
}

function mapArticleRow(row) {
  return {
    id: row.id,
    pinned: Boolean(row.pinned),
    category: row.category || "重大会议",
    title: row.title || "",
    date: row.article_date || "",
    source: row.source || "",
    tags: Array.isArray(row.tags) ? row.tags : [],
    markdown: row.markdown || "",
    updatedAt: row.updated_at || new Date(0).toISOString()
  };
}

function mapCodexRow(row) {
  return {
    id: row.id,
    title: row.title || "",
    summary: row.summary || "",
    date: row.publish_date || "",
    source: row.source || "",
    tags: Array.isArray(row.tags) ? row.tags : [],
    updatedAt: row.updated_at || new Date(0).toISOString()
  };
}

function mapEntryRow(row) {
  return {
    id: row.id,
    number: row.entry_number || "",
    title: row.title || "",
    body: row.body || "",
    notes: row.notes || "",
    updatedAt: row.updated_at || new Date(0).toISOString()
  };
}

function mapArticleModel(article, ownerId) {
  return {
    id: article.id,
    owner_id: ownerId,
    title: article.title || "",
    category: article.category || "重大会议",
    article_date: article.date || null,
    source: article.source || "",
    tags: Array.isArray(article.tags) ? article.tags : [],
    markdown: article.markdown || "",
    pinned: Boolean(article.pinned),
    updated_at: article.updatedAt || new Date().toISOString()
  };
}

function mapCodexModel(codex, ownerId) {
  return {
    id: codex.id,
    owner_id: ownerId,
    title: codex.title || "",
    summary: codex.summary || "",
    publish_date: codex.date || null,
    source: codex.source || "",
    tags: Array.isArray(codex.tags) ? codex.tags : [],
    updated_at: codex.updatedAt || new Date().toISOString()
  };
}

function mapEntryModel(entry, codexId, ownerId, index) {
  return {
    id: entry.id,
    codex_id: codexId,
    owner_id: ownerId,
    entry_number: entry.number || "",
    title: entry.title || "",
    body: entry.body || "",
    notes: entry.notes || "",
    sort_order: index,
    updated_at: entry.updatedAt || new Date().toISOString()
  };
}
