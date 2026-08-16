// Mock do supabase-js: intercepta o script real e injeta um cliente falso,
// com um "banco" em memória (window.__mockDb), pra testar admin.js/jogos.js
// sem tocar no projeto Supabase de verdade.

const MOCK_EMAIL = "admin@teste.com";
const MOCK_PASSWORD = "senha123";

function clientScript(seed) {
  return `
    window.isSupabaseConfigured = true;
    window.__mockDb = ${JSON.stringify(seed)};
    window.__mockAuthEmail = ${JSON.stringify(MOCK_EMAIL)};
    window.__mockAuthPassword = ${JSON.stringify(MOCK_PASSWORD)};

    class MockQueryBuilder {
      constructor(table) {
        this._table = table;
        this._op = "select";
        this._filters = [];
        this._payload = null;
        this._order = null;
        this._single = false;
      }
      select() { return this; }
      order(col, opts) {
        this._order = { col, asc: !opts || opts.ascending !== false };
        return this;
      }
      eq(col, val) { this._filters.push([col, val]); return this; }
      insert(payload) { this._op = "insert"; this._payload = payload; return this; }
      update(payload) { this._op = "update"; this._payload = payload; return this; }
      delete() { this._op = "delete"; return this; }
      single() { this._single = true; return this; }
      then(resolve, reject) { return this._exec().then(resolve, reject); }
      async _exec() {
        const db = window.__mockDb;
        const rows = db[this._table];
        const matches = r => this._filters.every(([c, v]) => r[c] === v);

        if (this._op === "select") {
          let result = rows.filter(matches);
          if (this._order) {
            const { col, asc } = this._order;
            result = [...result].sort((a, b) => {
              if (a[col] < b[col]) return asc ? -1 : 1;
              if (a[col] > b[col]) return asc ? 1 : -1;
              return 0;
            });
          }
          if (this._single) return { data: result[0] || null, error: null };
          return { data: result, error: null };
        }
        if (this._op === "insert") {
          const items = Array.isArray(this._payload) ? this._payload : [this._payload];
          const inserted = items.map(item => ({
            id: item.id || crypto.randomUUID(),
            created_at: new Date().toISOString(),
            ...item,
          }));
          rows.push(...inserted);
          if (this._single) return { data: inserted[0], error: null };
          return { data: inserted, error: null };
        }
        if (this._op === "update") {
          rows.forEach(r => { if (matches(r)) Object.assign(r, this._payload); });
          return { data: null, error: null };
        }
        if (this._op === "delete") {
          db[this._table] = rows.filter(r => !matches(r));
          return { data: null, error: null };
        }
      }
    }

    class MockAuth {
      constructor() { this.session = null; this.listeners = []; }
      async getSession() { return { data: { session: this.session } }; }
      onAuthStateChange(cb) {
        this.listeners.push(cb);
        return { data: { subscription: { unsubscribe(){} } } };
      }
      async signInWithPassword({ email, password }) {
        if (email === window.__mockAuthEmail && password === window.__mockAuthPassword) {
          this.session = { user: { email } };
          this.listeners.forEach(cb => cb("SIGNED_IN", this.session));
          return { error: null };
        }
        return { error: { message: "Credenciais inválidas." } };
      }
      async signOut() {
        this.session = null;
        this.listeners.forEach(cb => cb("SIGNED_OUT", null));
        return { error: null };
      }
    }

    window.supabaseClient = {
      from: (table) => new MockQueryBuilder(table),
      auth: new MockAuth(),
      storage: {
        from: (bucket) => ({
          async upload(path) { return { data: { path }, error: null }; },
          getPublicUrl(path) { return { data: { publicUrl: \`https://mock.local/\${bucket}/\${path}\` } }; },
        }),
      },
    };
  `;
}

/**
 * Intercepta o CDN do supabase-js e o js/supabase-config.js real, e injeta
 * o cliente mock acima com os dados iniciais passados em `seed`.
 * seed: { jogos: [...], jogos_resultados: [...] }
 */
async function installMockSupabase(page, seed) {
  await page.route("**://cdn.jsdelivr.net/**", route =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "window.supabase = window.supabase || {};" })
  );
  await page.route("**/js/supabase-config.js", route =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: clientScript(seed) })
  );
}

module.exports = { installMockSupabase, MOCK_EMAIL, MOCK_PASSWORD };
