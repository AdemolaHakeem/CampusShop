# CampusShop — Known Issues & Improvements Tracker

> **Last updated:** July 27, 2026  
> **Status legend:** ✅ Fixed | 🔧 In Progress | 🎯 Planned | ❌ Won't Fix

---

## 🔴 Critical

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 1 | **No pagination** — `subscribeToAllListings()` does `SELECT *` with no LIMIT. As listings grow, this gets slower. | 🎯 Planned | Need cursor-based pagination when scale demands it |
| 2 | **Full re-fetch on every change** — Real-time events trigger a complete re-query of ALL listings instead of incremental updates. | 🎯 Planned | Optimize when high write volume is reached |
| ~~3~~ | ~~**No email domain verification** — Anyone with any email can claim any university~~ | ❌ Won't Fix | Many Nigerian schools don't offer dedicated email domains |
| ~~4~~ | ~~**Condition field captured but not stored** — The form has a condition field but it's silently dropped~~ | ✅ Fixed | Now stored in `listings.condition` column |

---

## 🟡 Medium

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 5 | **No "mark as sold"** — Once sold, the listing stays live forever | ✅ Fixed | Added `status` column (`active` / `sold`), `markListingAsSold()`/`markListingAsActive()` functions, toggle from MyListingsPage |
| 6 | **No listing detail page** — Clicking a card only shows a preview | ✅ Fixed | Created `ListingDetailPage` at `/listing/:id` with full details, reviews, WhatsApp contact |
| 7 | **Client-side search (String.includes)** — Filtering downloads all listings and filters in JS | ✅ Fixed | Added PostgreSQL full-text search via `search_vector` + GIN index + `searchListings()` function, debounced and wired into MarketplacePage |
| 8 | **No composite indexes on (campus_id, created_at)** — Main marketplace query lacks optimized index | ✅ Fixed | Added `add_composite_indexes.sql` with `idx_listings_campus_created`, `idx_listings_seller_created`, `idx_listings_active` |
| 9 | **User metadata can go stale** — `campusId` from signup metadata doesn't update until re-login | ✅ Fixed | `AuthContext` now enriches user data from `profiles` table on every auth state change |

---

## 🟢 Low

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 10 | **No image validation server-side** — Only HTML `accept="image/*"` enforced | ✅ Fixed | Added file type check (JPEG, PNG, WebP, GIF) and size limit (5 MB) in `uploadListingImage()` |
| 11 | **No rate limiting on resendVerification** — Could be abused to spam | ✅ Fixed | Added in-memory 60-second throttle on both `resendVerification` and `resetPassword` |
| ~~12~~ | ~~**No moderation/report flow** — Inappropriate listings stay up~~ | ❌ Won't Fix | Out of scope for current phase |
| 13 | **No user ratings or reviews** — No reputation system | ✅ Fixed | Added `reviews` table (RLS protected), review form on listing detail page, average rating display |
| ~~14~~ | ~~**No MFA/2FA** — But overkill for student marketplace~~ | ❌ Won't Fix | Overkill at current scale |
| 15 | **`SELECT *` instead of specific columns** — Minor bandwidth waste | ✅ Fixed | All listing queries now use `LISTING_COLUMNS` constant listing specific fields |

---

## 💾 SQL Migrations (Must Run!)

These SQL files need to be executed in Supabase SQL Editor for the new features to work:

| File | What it adds |
|------|-------------|
| `supabase/migration_campus_schema.sql` | Main schema (run first — already set up) |
| `supabase/create_listings_table.sql` | Listings table (already set up) |
| `supabase/add_status_condition.sql` | **NEW** — Adds `status` and `condition` columns to listings, `search_vector` for full-text search, `reviews` table with RLS |
| `supabase/add_composite_indexes.sql` | **NEW** — Adds composite indexes for performance |

To apply: open your Supabase Dashboard → SQL Editor → paste + run each file in order.
