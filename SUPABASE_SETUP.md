# Supabase Setup Útmutató

## 1. Supabase Projekt Létrehozása

1. **Menj a Supabase Dashboard-ra**: https://supabase.com/dashboard
2. **Kattints a "New Project" gombra**
3. **Töltsd ki az adatokat:**
   - Project name: `havikiadas` (vagy tetszőleges név)
   - Database Password: Generálj egy erős jelszót (mentsd el!)
   - Region: Válassz egy közeli régiót (pl. `eu-central-1` - Frankfurt)
4. **Kattints a "Create new project" gombra**
5. **Várj, amíg a projekt létrejön** (~2 perc)

---

## 2. Adatbázis Táblák Létrehozása

### SQL Migration futtatása:

1. **Menj a Supabase Dashboard-on a "SQL Editor" menüpontra** (bal oldali menü)
2. **Kattints a "New query" gombra**
3. **Másold be a `supabase/migrations/001_initial_schema.sql` fájl tartalmát**
4. **Kattints a "Run" gombra** (vagy nyomd meg: Ctrl/Cmd + Enter)
5. **Ellenőrizd, hogy minden sikeres volt-e** (zöld checkmark)

### RLS Policies létrehozása:

1. **Kattints újra a "New query" gombra**
2. **Másold be a `supabase/migrations/002_row_level_security.sql` fájl tartalmát**
3. **Kattints a "Run" gombra**
4. **Ellenőrizd, hogy minden sikeres volt-e**

---

## 3. Email Authentication Beállítása

1. **Menj az "Authentication" > "Providers" menüpontra**
2. **Email provider beállítás:**
   - Engedélyezd az "Email" provider-t (alapértelmezetten engedélyezett)
   - **Email Confirmation**: ENGEDÉLYEZD! (kötelező a spec szerint)
   - **Confirm email**: ON
3. **Email Templates testre szabása** (opcionális):
   - Menj az "Authentication" > "Email Templates" menüpontra
   - Testre szabhatod az email sablon szövegét magyarra

### Email SMTP konfiguráció (Ingyenes verzióhoz):

A Supabase ingyenes tier napi 3 emailt enged. Ha többet szeretnél:

1. **Menj az "Authentication" > "Email Settings" menüpontra**
2. **Állítsd be a saját SMTP szolgáltatásodat** (pl. SendGrid, Resend, Gmail SMTP)

**Példa (Resend):**
```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend (username)
SMTP Password: re_your_api_key_here
```

---

## 4. API Kulcsok Lekérése

1. **Menj a "Project Settings" > "API" menüpontra** (fogaskerék ikon)
2. **Másold ki az alábbi értékeket:**
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (nagyon hosszú string)
   - **service_role key**: `eyJhbGc...` (SECRET! Ne commitold!)

---

## 5. Environment Változók Beállítása

### Lokális fejlesztéshez:

1. **Hozz létre egy `.env.local` fájlt** a projekt gyökerében:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # SECRET!

# Később add hozzá:
ANTHROPIC_API_KEY=sk-ant-...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here
```

2. **Ellenőrizd, hogy a `.env.local` a `.gitignore`-ban van!** (alapértelmezetten benne van)

### Netlify Deployment-hez:

1. **Menj a Netlify Dashboard-ra** (később, deployment fázisban)
2. **Site settings > Environment variables**
3. **Add hozzá ugyanezeket az environment változókat**

---

## 6. Tesztelés

### Ellenőrizd a kapcsolatot:

1. **Indítsd el a Next.js dev servert:**
   ```bash
   npm run dev
   ```

2. **Nyisd meg a böngészőt:** http://localhost:3000

3. **Teszteld a Supabase kapcsolatot** (később, amikor elkészül az auth UI)

---

## 7. Adatbázis Ellenőrzése

1. **Menj a "Table Editor" menüpontra** a Supabase Dashboard-on
2. **Láthatod az összes létrehozott táblát:**
   - profiles
   - months
   - income
   - expenses
   - budget
   - savings
   - pro_tips
   - recurring_transactions

3. **Ellenőrizd az RLS policy-kat:**
   - Kattints egy táblára (pl. "expenses")
   - Menj a "Policies" fülre
   - Látnod kell: "Users can only access their own expenses"

---

## 8. Hasznos Linkek

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Supabase Docs**: https://supabase.com/docs
- **RLS Policies Guide**: https://supabase.com/docs/guides/auth/row-level-security

---

## ✅ Kész vagy!

Most már készen áll a Supabase backend. Folytathatod a fejlesztést:
- Auth komponensek létrehozása
- Dashboard UI építése
- CRUD műveletek implementálása
