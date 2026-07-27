# CampusShop — Architecture & Analysis

> **Generated:** July 27, 2026  
> **Purpose:** Comprehensive technical analysis of the CampusShop marketplace codebase — covering authentication, database, and the full item posting/buying flows.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Authentication System](#3-authentication-system)
4. [Database & Scalability](#4-database--scalability)
5. [Posting an Item Flow](#5-posting-an-item-flow)
6. [Buying an Item Flow](#6-buying-an-item-flow)
7. [File-by-File Breakdown](#7-file-by-file-breakdown)
8. [Security Assessment](#8-security-assessment)
9. [Scalability Assessment](#9-scalability-assessment)
10. [Recommended Improvements](#10-recommended-improvements)
11. [Architecture Diagram](#11-architecture-diagram)

---

## 1. Project Overview

**CampusShop** is a campus-only marketplace for Nigerian university students to buy and sell items within their institution. It functions as a **classifieds platform** — there is no in-app payment processing or purchasing. All buyer-seller contact happens externally via WhatsApp.

### Core Purpose
- Students can **post items** they want to sell (textbooks, electronics, furniture, etc.)
- Other students at the **same campus** can browse and express interest
- Communication happens **directly on WhatsApp** — the app generates a `wa.me` link

### Target Audience
- Nigerian university students (100+ universities supported)
- Each user is associated with exactly one campus/institution

---

## 2. Technology Stack

### Frontend

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | **React** | ^19.2.6 |
| Build Tool | **Vite** | ^8.0.12 |
| UI Library | **Ant Design** | ^6.4.3 |
| Routing | **react-router-dom** | ^7.15.1 |
| Icons | **lucide-react** | ^1.17.0 |

### Backend (BaaS)

| Layer | Technology |
|-------|-----------|
| Database | **Supabase PostgreSQL** (managed cloud) |
| Auth | **Supabase Auth** (JWT-based, email/password) |
| Storage | **Supabase Storage** (for listing images) |
| Real-time | **Supabase Realtime** (WebSocket subscriptions) |
| Client SDK | **@supabase/supabase-js** ^2.106.1 |

### Utilities

| Tool | Usage |
|------|-------|
| `sharp` | Image processing (listed in deps) |

---

## 3. Authentication System

### 3.1 What's Used

**Supabase Auth** with email/password authentication. The implementation is split across:

#### `src/services/auth.js` — Auth Functions

| Function | Supabase API Call | Notes |
|----------|------------------|-------|
| `registerUser({ name, email, password, phone, campusId, campusName })` | `supabase.auth.signUp()` | Passes metadata: name, phone, campus_id, campus_name. After signup, does an upsert to `profiles` table if a session is returned immediately (email confirmation disabled). |
| `loginUser({ email, password })` | `supabase.auth.signInWithPassword()` | Returns the user object. |
| `logoutUser()` | `supabase.auth.signOut()` | Clears session. |
| `resendVerification(email)` | `supabase.auth.resend({ type: 'signup' })` | Sends a new confirmation email. |
| `resetPassword(email)` | `supabase.auth.resetPasswordForEmail()` | Sends password reset link. |
| `updatePassword(newPassword)` | `supabase.auth.updateUser({ password })` | Updates password after reset. |

#### `src/context/AuthContext.jsx` — Auth State Management

- A React Context (`AuthContext`) wraps the entire app
- On mount, it fetches the current session via `supabase.auth.getSession()`
- Subscribes to auth state changes via `supabase.auth.onAuthStateChange()`
- Exposes `currentUser` (formatted user object) and `loading` (boolean)
- The `formatUser()` function extracts fields from `user.user_metadata`:
  ```js
  {
    uid: user.id,
    id: user.id,
    email: user.email,
    displayName: user_metadata?.name || '',
    phone: user_metadata?.phone || '',
    campusId: user_metadata?.campus_id || null,
    campusName: user_metadata?.campus_name || null,
  }
  ```

#### `src/components/ProtectedRoute.jsx` — Route Guard

- Wraps protected pages (marketplace, add listing, my listings)
- If `loading` is true, shows a spinner
- If `currentUser` is null, redirects to `/login`
- Otherwise renders the children

### 3.2 Registration Flow (Detailed)

```
User fills Signup form
  ├─ CampusSearch component ── campus autocomplete (Supabase or local fallback)
  ├─ Name, email, phone, password, confirmPassword
  └─ Submits
       └─ registerUser() called
            ├─ supabase.auth.signUp({ email, password, options: { data: { name, phone, campus_id, campus_name } } })
            │
            ├─ [Supabase DB Trigger] handle_new_user()
            │   └─ INSERT INTO profiles (id, campus_id, name, phone) VALUES (NEW.id, meta.campus_id, meta.name, meta.phone)
            │
            ├─ If session returned immediately (email confirmation DISABLED):
            │   └─ upsert profile row to guarantee it exists (safe if trigger already ran)
            │
            ├─ If session NOT returned (email confirmation ENABLED):
            │   └─ Show modal: "Check your email for verification link"
            │
            └─ Return: navigate to /market or /login
```

### 3.3 Login Flow (Detailed)

```
User fills Login form
  ├─ Email + password
  └─ Submits
       └─ loginUser() called
            └─ supabase.auth.signInWithPassword({ email, password })
                 ├─ Success → navigate to /market
                 └─ Error
                      ├─ "Email not confirmed" → Modal with "Resend Verification Link" option
                      └─ Other errors → message.error()
```

### 3.4 Password Reset Flow

```
User clicks "Forgot Password?"
  └─ Modal opens with email input
       └─ resetPassword(email) called
            └─ supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' })
                 └─ Email sent → user clicks link → ResetPasswordPage
                      └─ User enters new password
                           └─ updatePassword(newPassword) called
                                └─ supabase.auth.updateUser({ password: newPassword })
                                     └─ Success → message
```

### 3.5 Profile Auto-Creation (DB Trigger)

From `supabase/migration_campus_schema.sql`:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, campus_id, name, phone)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'campus_id')::UUID,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Key detail:** The trigger runs `SECURITY DEFINER` (with `search_path = ''` to avoid search-path injection), which means it runs with the privileges of the function creator (a superuser), allowing it to insert into `public.profiles` even though the auth user doesn't have a session yet.

---

## 4. Database & Scalability

### 4.1 Database Schema

#### Table: `campuses`
```sql
CREATE TABLE public.campuses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  domain     TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigram index for fast ILIKE search
CREATE INDEX idx_campuses_name_trgm ON public.campuses USING GIN (name gin_trgm_ops);
```

#### Table: `profiles`
```sql
CREATE TABLE public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  campus_id  UUID NOT NULL REFERENCES public.campuses(id),
  name       TEXT,
  phone      TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Table: `listings`
```sql
CREATE TABLE public.listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  price           NUMERIC NOT NULL,
  category        TEXT NOT NULL,
  image_url       TEXT DEFAULT '',
  seller_id       UUID NOT NULL,
  seller_name     TEXT NOT NULL DEFAULT 'Anonymous',
  whatsapp_number TEXT DEFAULT '',
  campus_id       UUID REFERENCES public.campuses(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_listings_campus_id ON public.listings(campus_id);
CREATE INDEX idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX idx_listings_created_at ON public.listings(created_at DESC);
```

#### Row Level Security (RLS) Policies

| Table | Policy | Effect |
|-------|--------|--------|
| `campuses` | Publicly readable | Anyone can browse campuses |
| `profiles` | Users can read own profile | `auth.uid() = id` |
| `profiles` | Users can insert own profile | `auth.uid() = id` |
| `profiles` | Users can update own profile | `auth.uid() = id` |
| `listings` | Publicly readable | `USING (true)` |
| `listings` | Insert own | `WITH CHECK (auth.uid() = seller_id)` |
| `listings` | Update own | `USING (auth.uid() = seller_id)` |
| `listings` | Delete own | `USING (auth.uid() = seller_id)` |
| Storage `listings` bucket | Public view | Anyone can view images |
| Storage `listings` bucket | Auth upload | Authenticated users can upload |
| Storage `listings` bucket | Own update/delete | `auth.uid() = owner` |

### 4.2 Data Flow

#### `src/services/campusFilter.js`
```js
export const withCampusScope = (query, campusId) => {
  if (!campusId) return query;
  return query.or(`campus_id.eq.${campusId},campus_id.is.null`);
};
```
This filters listings to show only those from the user's campus OR global listings (campus_id IS NULL). If no campusId is set, all listings are shown (global view).

#### `src/hooks/useListings.js`
```js
export const useListings = () => {
  // Fetches all listings scoped to user's campus
  // Subscribes to real-time changes via Supabase Realtime
  // Re-fetches entire dataset on every change
};

export const useUserListings = (userId) => {
  // Fetches a specific user's listings (scoped to campus)
  // Subscribes to real-time changes filtered by seller_id
};
```

#### `src/services/listings.js`
- `mapListing()` — Maps DB column names (snake_case) to JS camelCase
- `uploadListingImage(file)` — Uploads to Supabase Storage `listings` bucket, returns public URL
- `addListing(data)` — Inserts a new listing row
- `deleteListing(id)` — Deletes a listing by ID
- `subscribeToAllListings(campusId, callback)` — Fetches + real-time subscription for marketplace
- `subscribeToUserListings(userId, campusId, callback)` — Fetches + real-time subscription for user's own listings

### 4.3 Real-time Architecture

Both subscription functions follow the same pattern:

1. **Initial fetch** — Full `SELECT *` query with campus scope
2. **Subscribe** — Open a Supabase Realtime channel:
   - For all listings: `{ event: '*', schema: 'public', table: 'listings' }`
   - For user listings: `{ event: '*', schema: 'public', table: 'listings', filter: 'seller_id=eq.{userId}' }`
3. **On any change** — Re-run the FULL fetch query (not incremental updates)
4. **Unsubscribe** — Return cleanup function that calls `supabase.removeChannel(channel)`

### 4.4 Campus Search

`src/services/campuses.js` implements a **fallback architecture**:

```
searchCampuses(query)
  └─ Try: supabase.from('campuses').select('id, name, domain').ilike('name', `%${query}%`)
       └─ If fails → localSearch(query) — filters bundled campus data in src/data/campuses.js
```

---

## 5. Posting an Item Flow

### 5.1 Complete Step-by-Step

```
1. User navigates to /add-listing
   ├─ ProtectedRoute checks auth → redirects to /login if not authenticated
   └─ Navbar shows "Sell Item" link

2. AddListingPage renders with:
   ├─ Page header: "Back to Marketplace" button + "Create New Listing" title
   ├─ Left sidebar (desktop): Progress steps (1. Item Details, 2. Item Photos, 3. Review & Post)
   ├─ Main form card with fields:
   │   ├─ Row 1: Title (max 100 chars, showCount) | Price (₦, max 10M, formatted with commas)
   │   ├─ Description: TextArea (max 500 chars, showCount)
   │   ├─ Row 2: Category (Select from 10 categories) | Condition (New/Like New/Used) | WhatsApp Number
   │   └─ Image Upload Section:
   │       ├─ Upload.Dragger (click/drag-drop) → uploadListingImage(file):
   │       │   └─ Generates random filename: {random}_{timestamp}.{ext}
   │       │   └─ Uploads to Supabase Storage bucket 'listings'
   │       │   └─ Gets public URL → stored in state
   │       └─ OR "Paste Image URL" input → direct URL input
   └─ Right sidebar (desktop): Listing tips card + "Items with photos sell 3x faster" banner

3. User fills form and clicks "Publish Listing" button

4. onFinish() handler:
   ├─ addListing() called with:
   │   { title, price, description, category, imageURL, sellerId: currentUser.uid,
   │     sellerName: currentUser.displayName || 'Anonymous',
   │     sellerPhone, campusId: currentUser.campusId || null }
   │
   └─ supabase.from('listings').insert([{...}]).select().single()
        ├─ RLS check: auth.uid() = seller_id
        └─ Returns the created listing

5. Success:
   ├─ message.success('Listing created successfully! 🎉')
   ├─ form.resetFields()
   └─ navigate('/market')

6. Real-time effect:
   └─ All subscribed clients receive the change event → re-fetch → new listing appears
```

### 5.2 Image Upload Details

```js
export const uploadListingImage = async (file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2,15)}_${Date.now()}.${fileExt}`;
  const filePath = `listing-images/${fileName}`;

  const { data, error } = await supabase.storage
    .from('listings')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  // Error handling: if bucket not found, throw helpful error message

  const { data: { publicUrl } } = supabase.storage
    .from('listings')
    .getPublicUrl(filePath);

  return publicUrl;
};
```

**Important caveats:**
- The `condition` field is captured in the form but **not stored in the database** — the `listings` table has no `condition` column
- No server-side file type validation beyond HTML's `accept="image/*"`
- No file size limit enforced beyond what the Storage bucket accepts (defaults to Supabase's 50MB limit)
- The image URL can be bypassed entirely — it defaults to `''` in the insert
- If no image is provided, the `ListingCard` component generates a `placehold.co` fallback URL

---

## 6. Buying an Item Flow

### 6.1 Complete Step-by-Step

**CampusShop has NO in-app purchasing.** The entire "buying" flow is a classifieds model:

```
1. User browses the marketplace (/market)
   ├─ Listings are fetched via useListings() hook
   ├─ Filtered to show only the user's campus items (via withCampusScope)
   ├─ Plus global items where campus_id IS NULL
   └─ Supports client-side search and category filtering

2. User filters/search:
   ├─ Category sidebar (desktop) or pill tags (mobile)
   ├─ Search bar → case-insensitive includes() on title and description
   ├─ Filter dropdown select
   └─ Active filter tags shown with close buttons

3. User sees listing cards:
   ├─ Cover image (200px height, object-fit cover, hover zoom)
   ├─ Price badge (bottom-right of image, dark background, rounded)
   ├─ Category tag (color-coded per category)
   ├─ Title (ellipsis with tooltip on hover)
   ├─ Description (2-line ellipsis)
   ├─ Time ago (via timeAgo() helper)
   ├─ Seller name
   └─ WhatsApp button (footer action)

4. User wants to buy → clicks WhatsApp icon on a card:
   └─ getWhatsAppLink(sellerPhone, title) generates:
        https://wa.me/{cleanedPhone}?text=Hi!%20I'm%20interested%20in%20your%20listing%20"{title}"%20on%20CampusShop.%20Is%20it%20still%20available%3F
        ├─ Phone cleaning: removes all non-digit characters
        └─ Opens WhatsApp (web or app) with pre-filled message

5. Conversation continues entirely on WhatsApp:
   ├─ Buyer and seller negotiate price, arrange meetup
   ├─ Transaction happens offline (cash, transfer, etc.)
   └─ CampusShop is no longer involved

6. Post-sale:
   ├─ The listing remains active indefinitely
   ├─ Seller can manually delete from "My Listings" page
   └─ No "mark as sold" feature exists
```

### 6.2 My Listings Page

The seller manages their listings at `/my-listings`:

```
└─ useUserListings(currentUser.uid) fetches seller's listings
     └─ subscribeToUserListings(userId, campusId, callback)
          ├─ Initial query: SELECT * FROM listings WHERE seller_id = {userId} [with campus scope]
          └─ Realtime subscription filtered by seller_id

Each card shows:
  ├─ Card actions:
  │   ├─ WhatsApp icon (if sellerPhone exists)
  │   └─ Delete icon (trash) → confirmation modal → deleteListing(id)
  └─ Page has "New Listing" button
```

### 6.3 Helper Functions

**`formatPrice(price)`** — Uses `Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' })` for ₦ formatting with no decimal places.

**`timeAgo(timestamp)`** — Converts timestamps to human-readable relative time (e.g., "2 hours ago", "3 days ago"). Handles Firestore-style `.toDate()`, Date objects, and ISO strings.

**`getWhatsAppLink(phone, itemTitle)`** — Generates WhatsApp deep link with pre-filled message. Phone is stripped of all non-digit characters first.

---

## 7. File-by-File Breakdown

### 7.1 Source Files (`src/`)

| File | Purpose | Key Functions/Exports |
|------|---------|----------------------|
| `main.jsx` | Entry point | Renders `<App />` in StrictMode |
| `App.jsx` | Root component | ConfigProvider (Ant Design theme), BrowserRouter, AuthProvider, Routes |
| `index.css` | Global styles | Design tokens (CSS variables), layout, typography, responsive, landing page CSS |
| `context/AuthContext.jsx` | Auth state | `AuthProvider`, `useAuth()`, `formatUser()` |
| `services/supabase.js` | Supabase client | `supabase` (createClient with env vars + fallback placeholders) |
| `services/auth.js` | Auth functions | `registerUser`, `loginUser`, `logoutUser`, `resendVerification`, `resetPassword`, `updatePassword` |
| `services/listings.js` | Listings CRUD | `mapListing`, `uploadListingImage`, `addListing`, `deleteListing`, `subscribeToAllListings`, `subscribeToUserListings` |
| `services/campuses.js` | Campus search | `searchCampuses`, `getCampusById`, `getUserProfile` |
| `services/campusFilter.js` | Campus scoping | `withCampusScope(query, campusId)` |
| `hooks/useListings.js` | Listing hooks | `useListings()`, `useUserListings(userId)` |
| `utils/helpers.js` | Utilities | `formatPrice`, `getWhatsAppLink`, `timeAgo` |
| `utils/categories.js` | Enums | `CATEGORIES` (10 categories), `CATEGORY_COLORS` (hex colors per category) |
| `data/campuses.js` | Fallback data | `CAMPUSES` (array of 100+ Nigerian universities with name + web) |
| `components/Navbar.jsx` | App navbar | Links: Marketplace, Sell Item, My Listings. User dropdown with Sign Out |
| `components/ProtectedRoute.jsx` | Route guard | Redirects to `/login` if not authenticated |
| `components/ListingCard.jsx` | Listing card | Image, price badge, category tag, title, description, time, seller, WhatsApp action |
| `components/CampusSearch.jsx` | Campus autocomplete | Debounced search, dropdown results, selected state display |
| `components/Footer.jsx` | Landing page footer | CTA banner, link columns, stats, trust badges, social icons |
| `pages/LandingPage.jsx` | Public landing | Hero section, features grid, stats, how-it-works, testimonials, footer |
| `pages/LoginPage.jsx` | Login | Form with email/password, forgot password modal, resend verification |
| `pages/SignupPage.jsx` | Signup | Form with campus search, name, email, phone, password, confirm password |
| `pages/MarketplacePage.jsx` | Main marketplace | Listing grid, filters, search, category sidebar/pills, stats |
| `pages/AddListingPage.jsx` | New listing | Full form with image upload, progress steps, listing tips |
| `pages/MyListingsPage.jsx` | User's listings | Loading, empty state, listing cards with delete action |
| `pages/ResetPasswordPage.jsx` | Password reset | Form for new password after email link |
| `pages/FAQPage.jsx` | FAQ | Frequently asked questions |
| `pages/ContactPage.jsx` | Contact | Contact information |
| `pages/AboutPage.jsx` | About | About CampusShop |
| `pages/HelpCenterPage.jsx` | Help | Help resources |
| `pages/SafetyTipsPage.jsx` | Safety | Safety guidelines |
| `pages/TermsPage.jsx` | Terms | Terms of service |
| `pages/PrivacyPage.jsx` | Privacy | Privacy policy |
| `pages/CommunityGuidelinesPage.jsx` | Guidelines | Community guidelines |
| `pages/HowItWorksPage.jsx` | How it works | Platform explanation |

### 7.2 Configuration & SQL Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts (dev, build, lint, seed) |
| `vite.config.js` | Vite configuration |
| `vercel.json` | Vercel deployment config |
| `eslint.config.js` | ESLint configuration |
| `index.html` | SPA entry HTML |
| `supabase/create_listings_table.sql` | DDL for listings table + RLS policies |
| `supabase/fix_profiles_rls.sql` | Security fix: restrict profiles RLS + Storage RLS |
| `supabase/migration_campus_schema.sql` | Full schema: campuses, profiles, listings, trigger, RLS |
| `supabase/seed_campuses.json` | 100+ Nigerian universities for seeding |
| `scripts/seed-campuses.js` | Node.js script to seed campuses from JSON using service role key |
| `scripts/generate-favicon.js` | Favicon generation script |

### 7.3 App Routing

From `src/App.jsx`:

| Route | Component | Protected | Shows Navbar |
|-------|-----------|-----------|-------------|
| `/` | LandingPage | No | No |
| `/login` | LoginPage | No | No |
| `/signup` | SignupPage | No | No |
| `/reset-password` | ResetPasswordPage | No | No |
| `/faq` | FAQPage | No | No |
| `/contact` | ContactPage | No | No |
| `/about` | AboutPage | No | No |
| `/help` | HelpCenterPage | No | No |
| `/safety` | SafetyTipsPage | No | No |
| `/terms` | TermsPage | No | No |
| `/privacy` | PrivacyPage | No | No |
| `/community-guidelines` | CommunityGuidelinesPage | No | No |
| `/how-it-works` | HowItWorksPage | No | No |
| `/market` | MarketplacePage | **Yes** | Yes |
| `/add-listing` | AddListingPage | **Yes** | Yes |
| `/my-listings` | MyListingsPage | **Yes** | Yes |
| `*` (catch-all) | Redirect to `/` | No | No |

**Navbar logic:** `showNavbar = currentUser && !noNavbarRoutes.includes(location.pathname)` — Navbar only shows for authenticated users on app pages (market, add-listing, my-listings).

---

## 8. Security Assessment

### 8.1 Strengths ✅

| Feature | Details |
|---------|---------|
| **Supabase-managed Auth** | Passwords hashed by Supabase (bcrypt), no custom auth code |
| **Row Level Security (RLS)** | All tables have RLS enabled — users can only operate on their own data |
| **Profiles RLS tightened** | Policy was fixed to restrict profile reads to own user only |
| **Storage RLS** | Public read, authenticated upload, owner-only update/delete |
| **SECURITY DEFINER trigger** | Profile auto-creation trigger uses `SET search_path = ''` to prevent search-path injection |
| **WhatsApp-based contact** | No in-app messaging reduces attack surface and data exposure |
| **Environment variables** | Supabase URL and anon key loaded from `VITE_SUPABASE_*` env vars |
| **Placeholder fallbacks** | Client code has graceful fallback values if env vars are missing |
| **Campus validation** | Signup page enforces campus selection from autocomplete (not free text) |

### 8.2 Weaknesses ⚠️

| Issue | Severity | Details |
|-------|----------|---------|
| **Email confirmation optional** | Medium | The app works without email verification. In production, this should be enforced in Supabase Dashboard. |
| **No rate limiting** | Medium | No protection against brute-force login attempts (relies solely on Supabase's built-in rate limiting) |
| **No MFA/2FA** | Low-Medium | Not implemented at all |
| **No email domain verification** | Medium | Anyone with any email can claim any campus — there's no check that `alex@something.com` belongs to "University of Ibadan" |
| **User metadata is stale** | Low | `currentUser.campusId` comes from `user_metadata` set at signup. If a user changes campus in the profiles table, the in-memory object won't update until re-login. |
| **No input sanitization on listings** | Low | User-supplied title, description, and seller_name are inserted directly. Ant Design's escaping helps, but there's no server-side sanitization. |
| **No moderation** | Medium | Listings go live immediately with no approval step or automated content screening |
| **`resendVerification` unthrottled** | Low | No client-side or server-side throttling on resending verification emails (Supabase may have some internal limits) |
| **Placeholder keys in production** | High (if misconfigured) | If `VITE_SUPABASE_URL` is missing, uses `https://placeholder-prevent-crash.supabase.co` — no actual queries will work, but no data leaks. |

### 8.3 Security Recommendations

1. **Enable email confirmation** in Supabase Dashboard (Authentication > Settings)
2. **Add university email domain validation** — check the user's email domain against the selected campus's allowed domains
3. **Implement rate limiting** on auth endpoints (consider Supabase's built-in or a middleware)
4. **Add listing moderation** — even a simple flag/report system for inappropriate content
5. **Consider at-rest encryption** for phone numbers (they're stored in plaintext in the profiles table and in user_metadata)

---

## 9. Scalability Assessment

### 9.1 Strengths ✅

| Feature | Details |
|---------|---------|
| **Proper indexes** | campus_id, seller_id, created_at DESC on listings; trigram GIN index on campuses.name |
| **Multi-tenant design** | Campus-based data isolation naturally partitions data — each campus only sees its own subset |
| **PostgreSQL** | Mature, proven at massive scale (millions to billions of rows) |
| **Supabase managed** | Auto-scaling, connection pooling, read replicas available as needed |
| **Real-time via WAL** | Supabase Realtime uses Postgres WAL (Write-Ahead Log) — efficient change tracking |
| **Fallback data** | Campus search has a local JS fallback, reducing DB load for repeated searches |
| **Unused imports removed** | Clean import structure (per the eslint config) |

### 9.2 Weaknesses ⚠️

| Issue | Severity | Details |
|-------|----------|---------|
| **No pagination** | 🔴 **Critical** | `subscribeToAllListings` fetches ALL listings in one query with `SELECT *` and no LIMIT. With >1000 listings this becomes slow. |
| **Full re-fetch on every change** | 🔴 **Critical** | Real-time events trigger a complete re-query instead of incremental updates. High write volume = constant full re-fetches. |
| **Client-side search** | 🟡 High | The marketplace search uses `Array.filter()` with `String.includes()` — O(n) on every keystroke over ALL listings |
| **No composite indexes** | 🟡 Medium | No index on `(campus_id, created_at DESC)` which would accelerate the main marketplace query |
| **ILIKE with leading wildcard** | 🟡 Medium | Campus search uses `%{query}%` which can't use standard B-tree indexes. The trigram index helps but is slower than full-text search. |
| **No caching layer** | 🟡 Medium | Every page load hits Supabase directly — Redis or similar could cache popular queries |
| **No materialized views** | 🟢 Low | Aggregations (like category counts) are computed client-side from the full listing array |
| **Unbounded image uploads** | 🟡 Medium | No file size limit or image compression/resizing before upload |
| **`SELECT *`** | 🟢 Low | All queries select all columns (`*`) instead of listing specific columns needed |

### 9.3 Scaling Recommendations

| Priority | Change | Effort | Impact |
|----------|--------|--------|--------|
| 🔴 **P1** | Add cursor-based pagination to listing queries | Medium | Reduces payload per request, enables infinite scroll |
| 🔴 **P1** | Implement incremental real-time updates (insert/update/delete handlers instead of full re-fetch) | Medium | Drastically reduces bandwidth on change events |
| 🟡 **P2** | Add PostgreSQL full-text search (tsvector/tsquery) for marketplace search | Medium | Fast, indexed search instead of O(n) client-side filtering |
| 🟡 **P2** | Add composite index: `(campus_id, created_at DESC)` | Small | Optimizes the core marketplace query |
| 🟡 **P2** | Add image optimization (resize/compress on upload) | Small-medium | Reduces storage costs and page load times |
| 🟢 **P3** | Use `SELECT specific_columns` instead of `SELECT *` | Small | Reduces data transfer |
| 🟢 **P3** | Add database connection pooling settings | Small | Better connection management |
| 🟢 **P3** | Cache campus search results (localStorage or React Query) | Small | Reduces repeated DB queries |

---

## 10. Recommended Improvements

### 10.1 Feature Gaps

| Feature | Missing? | Notes |
|---------|----------|-------|
| **Condition field stored** | ❌ | Captured in form but not in DB schema |
| **Mark as sold** | ❌ | No way to deactivate a sold listing |
| **Listing detail page** | ❌ | Clicking a card only shows the card — no dedicated detail view |
| **User ratings/reviews** | ❌ | No reputation system |
| **Favorites/watchlist** | ❌ | No way to save listings |
| **Image galleries** | ❌ | Only one image per listing |
| **Multi-image upload** | ❌ | Only single image supported |
| **Report listing** | ❌ | No moderation/report flow |
| **Seller profile page** | ❌ | No public seller profile showing all their listings |
| **Push notifications** | ❌ | No notifications for new listings |
| **Payment processing** | ❌ | Intentional — classifieds model |
| **In-app messaging** | ❌ | Intentional — uses WhatsApp |

### 10.2 Technical Debt

| Item | Details |
|------|---------|
| **Duplicate campus data** | `src/data/campuses.js` and `supabase/seed_campuses.json` both have the same data — potential for drift |
| **No tests** | Zero test files in the project (no test runner configured) |
| **Ant Design version** | Using Ant Design v6 (latest) — stable but relatively new |
| **Warning: `useBreakpoint`** | Ant Design's `Grid.useBreakpoint` is being used but the hover CSS in `ListingCard` uses `screens.lg` check for conditional rendering of sidebars |
| **Missing PropTypes/TypeScript** | The project uses plain JSX — no TypeScript, no PropTypes validation |

### 10.3 Environmental Config

The app expects these environment variables:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Currently set via `import.meta.env.VITE_SUPABASE_*` — the client code has fallback placeholders that prevent a crash but won't actually work.

---

## 11. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (React SPA)                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              App.jsx (Root)                         │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │           AuthProvider (Context)               │  │   │
│  │  │  ┌─────────────────────────────────────────┐  │  │   │
│  │  │  │          BrowserRouter                  │  │  │   │
│  │  │  │  ┌──────┐ ┌──────┐ ┌──────────────┐  │  │  │   │
│  │  │  │  │Public│ │Protected│ │ 404 → /    │  │  │  │   │
│  │  │  │  │Routes│ │ Routes  │ │ Redirect    │  │  │  │   │
│  │  │  │  └──────┘ └──────┘ └──────────────┘  │  │  │   │
│  │  │  └─────────────────────────────────────────┘  │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │ AuthContext  │  │ Services     │  │ Hooks             │ │
│  │ (state)      │  │ Layer        │  │ (data fetching)   │ │
│  │ currentUser  │  │ auth.js      │  │ useListings()     │ │
│  │ loading      │  │ listings.js  │  │ useUserListings() │ │
│  │ formatUser() ├──▶ campuses.js  │  │                   │ │
│  │              │  │ campusFilter │  │                   │ │
│  └─────────────┘  │ supabase.js  │  └───────────────────┘ │
│                   └──────┬───────┘                        │
└──────────────────────────┼────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
     ┌─────┴─────┐  ┌──────┴──────┐  ┌────┴─────┐
     │ Supabase  │  │  Supabase   │  │ Supabase │
     │   Auth    │  │  Postgres   │  │ Storage  │
     │ (JWT)     │  │  + RLS      │  │ (images) │
     │           │  │  + Realtime │  │          │
     └───────────┘  └─────────────┘  └──────────┘
```

### Data Flow Summary

```
[User Action] → [React Component] → [Service Function] → [Supabase SDK] → [Supabase Backend]
                      │                                                      │
                      └── [AuthContext update] ← [onAuthStateChange] ←←←←←←←←┘
                      │                                                      │
                      └── [useListings hook] ← [Realtime subscription] ←←←←←←┘

Image Upload:
[File] → [Upload.Dragger] → [uploadListingImage()] → [Supabase Storage]
                                                        │
                                              [Public URL returned]
                                                        │
                                              [Stored in listing row]

Real-time:
[Another user posts] → [Postgres INSERT] → [WAL] → [Supabase Realtime]
                                                      │
                                              [All subscribed clients]
                                                      │
                                              [Full re-fetch query]
                                                      │
                                              [UI updates with new data]
```

---

*End of Architecture & Analysis Document.*
