# Xaccess Mobile (Ionic + Angular + Capacitor)

Run from this folder:

```bash
npm install
npm start          # dev server
npm run build      # output: www/
npm run android    # open Android Studio (after cap sync)
```

Capacitor config: `capacitor.config.ts` (`webDir: www`).  
Android project: `android/` — open in Android Studio from repo root:

```bash
cd mobile && npm run android
```

## NestJS API

1. Start the API from `../api`: `npm run start:dev` (default `http://localhost:3000`).
2. **Dev** base URL is in `src/environments/environment.ts` → `apiUrl: 'http://localhost:3000/api/v1'`.
3. **Android emulator** cannot use `localhost` for the host machine — set `apiUrl` to `http://10.0.2.2:3000/api/v1` when testing on emulator.
4. **Production** URL: `src/environments/environment.prod.ts`.

Auth uses `HttpClient` + `AuthInterceptor` (Bearer token from `localStorage`). Login and sign-up call `POST /api/v1/auth/login` and `POST /api/v1/auth/register`.

If you registered **without** a community, `user.communityId` is `null`. Use **`POST /api/v1/auth/join-community`** (resident JWT) with `{ "slug": "harmony-estate" }` or `{ "communityId": "<uuid>" }`. The app exposes **`/join-community`** (banner on Home) which stores the new JWT (includes `communityId`).

### Access token & session (`TokenStorageService`)

- **`xaccess_access_token`** — JWT for `Authorization: Bearer …` (see `core/interceptors/auth.interceptor.ts`).
- **`xaccess_user_snapshot`** — cached `PublicUser` from login/register or refreshed via `GET /auth/me`.
- Use **`persistSession(accessToken, user)`** after auth; **`clearSession()`** on logout (profile).

### Dashboard (Home) API wiring

On each visit to **Home**, the app:

1. Calls **`GET /auth/me`** (when a token exists) to refresh the cached user.
2. Calls **`GET /access/logs/me`** for **resident** accounts and maps rows into **Access History** (first 8 events).  
   Non-residents receive **403** — the UI shows a short message instead of history.

Related client code:

| File | Role |
|------|------|
| `core/services/access-api.service.ts` | `getMyAccessLogs()`, `listMyTokens()` |
| `core/services/auth-api.service.ts` | `login`, `register`, `me()` |
| `core/models/access.models.ts` | DTOs for logs / token list |

### Access tokens (Access Control screen)

| Method | Path | Use |
|--------|------|-----|
| `POST` | `/access/tokens` | Create token — response includes **plain `token` once** (QR / keypad material). |
| `GET` | `/access/tokens` | List issued tokens (no secret). |
| `POST` | `/access/tokens/:id/revoke` | Revoke a token. |

Mobile: `AccessApiService` (`createToken`, `listMyTokens`, `revokeToken`) + **Access Control** page maps UI types → API `type`: **One-Time** → `TEMPORARY`, **Multi-Entry** → `PERMANENT`, **Event** → `EVENT`. Methods default to **QR only** (`qr: true`). Apartment / location are appended to `guestName` for traceability until dedicated fields exist.

### Demo users (API seed)

See `../api/README.md` — e.g. `resident@xaccess.local` / `Resident123!`.

### Postman

Import `../postman/Xaccess-API.postman_collection.json`, set `baseUrl` = `http://localhost:3000`, run Login, copy JWT into the `token` variable for protected routes.
