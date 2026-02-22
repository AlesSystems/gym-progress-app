# Feature 8: Privacy & Sharing

## Overview
Everything in the app is private by default. This feature gives users a single, low-friction way to share a workout template with friends — defined as users connected through the existing invite graph (anyone who invited them or was invited by them). No public marketplace, no external links in MVP.

---

## Feature Breakdown

### 8.1 Private by Default
**User Stories:**
- As a user, I want my workout templates and session history to be private by default so nobody can see my data without my explicit action.

**Technical Requirements:**
- All `workout_templates` are created with `visibility = 'private'`.
- All `workout_sessions`, `workout_sets`, `scheduled_workouts`, and custom `exercises` are user-scoped with no sharing capability in MVP.
- API enforces that any read request for a resource checks `user_id = authenticated_user_id` before returning data.
- No route exists that allows unauthenticated access to user-owned resources.

### 8.2 Share a Template with Friends
**User Stories:**
- As a user, I want to change the visibility of a template to "friends" so my invite-connected friends can see and clone it.
- As a user, I want to revert a shared template back to private at any time.
- As a friend, I want to browse templates shared with me so I can clone them into my own account.
- As a friend, I want to clone a shared template so I can use it as a starting point for my own plan.

**Technical Requirements:**
- Template visibility is a two-state toggle on `workout_templates.visibility`: `'private'` | `'friends'`.
- "Friends" is defined as: users reachable via the invite graph — specifically, the user's own `invitedBy` user (the person who invited them) plus all users who have `invitedBy = currentUser.id` (users they invited directly). This is a one-degree relationship (no recursive traversal needed in MVP).
- A shared template is **readable** and **cloneable** by friends, but never editable or deletable by them.
- Shared templates appear in a "Friends' Templates" tab in the template list.
- The template owner's display name is shown on shared templates.
- Reverting to private immediately removes it from friends' views (no caching delay).
- Sessions logged from a friend's shared template are fully private to the user who logged them.

### 8.3 Friends List (Read-Only)
**User Stories:**
- As a user, I want to see who I am connected with (my inviter + my invitees) so I know whose templates I can see.

**Technical Requirements:**
- Read-only list derived from the existing `users` table via `invitedBy` relationships — no new friends table.
- Returns: display name, invite relationship direction (`invited_you` | `you_invited`).
- Does not expose email addresses.

---

## Data Models

### Changes to WorkoutTemplate
Add a single column to the existing `workout_templates` table:

```sql
ALTER TABLE workout_templates
  ADD COLUMN visibility VARCHAR(20) NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'friends'));

CREATE INDEX idx_templates_visibility ON workout_templates(visibility);
```

### ImportJob Table (from Feature 7, optional)
No additional tables required for privacy/sharing in MVP.

---

## Friend Resolution Query

"Friends" of `currentUserId`:

```sql
-- Users who invited currentUser (max 1 in current model)
SELECT id, display_name, 'invited_you' AS relationship
FROM users
WHERE id = (SELECT invited_by FROM users WHERE id = $currentUserId)
  AND id IS NOT NULL

UNION ALL

-- Users that currentUser invited
SELECT id, display_name, 'you_invited' AS relationship
FROM users
WHERE invited_by = $currentUserId;
```

This runs in O(1) with the existing `idx_users_invited_by` index.

---

## Shared Templates Visibility Query

Templates visible to `currentUserId` from friends:

```sql
-- Fetch all friend IDs first (see above query)
-- Then:
SELECT wt.*, u.display_name AS owner_name
FROM workout_templates wt
JOIN users u ON u.id = wt.user_id
WHERE wt.user_id IN ($friendIds)
  AND wt.visibility = 'friends'
  AND wt.is_archived = false
ORDER BY wt.updated_at DESC;
```

---

## API Endpoints

### Template Visibility
| Method | Path | Auth | Description |
|---|---|---|---|
| `PATCH` | `/api/templates/:id/visibility` | Required | Set visibility (`private` or `friends`) |

**Request body:**
```json
{ "visibility": "friends" }
```

### Friends
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/friends` | Required | Get connected friends (from invite graph) |

**Response:**
```json
{
  "friends": [
    { "userId": "uuid", "displayName": "Jordan", "relationship": "invited_you" },
    { "userId": "uuid", "displayName": "Sam", "relationship": "you_invited" }
  ]
}
```

### Shared Templates (Friends' Templates)
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/templates/shared` | Required | Templates shared with current user by friends |
| `POST` | `/api/templates/shared/:id/clone` | Required | Clone a friend's shared template |

**`GET /api/templates/shared` response:**
```json
{
  "templates": [
    {
      "id": "uuid",
      "name": "Jordan's Pull Day",
      "ownerName": "Jordan",
      "exerciseCount": 6,
      "updatedAt": "2026-02-20T10:00:00Z"
    }
  ]
}
```

**Clone behavior:**
- Identical to the self-clone endpoint (Feature 3): deep copy of template + exercises.
- `cloned_from` FK set to the original template's ID.
- New template is created with `visibility = 'private'` (the clone is always private to the cloner).
- If the original template is later set back to private by the owner, the clone is unaffected.

---

## Authorization Matrix

| Resource | Owner | Friend (if shared) | Other user |
|---|---|---|---|
| Read own template | ✅ | — | ❌ |
| Read friend's `friends` template | — | ✅ | ❌ |
| Edit template | ✅ | ❌ | ❌ |
| Delete / archive template | ✅ | ❌ | ❌ |
| Clone shared template | — | ✅ | ❌ |
| Set visibility | ✅ | ❌ | ❌ |
| Read workout sessions | ✅ | ❌ | ❌ |
| Read custom exercises | ✅ | ❌ | ❌ |
| Read scheduled workouts | ✅ | ❌ | ❌ |

All enforcement is server-side. The client UI hides unavailable actions but the API always re-checks.

---

## Validation Rules (Zod)

```typescript
const SetVisibilitySchema = z.object({
  visibility: z.enum(['private', 'friends']),
});
```

---

## Frontend Pages / Components

### Pages
1. **Template List** (`/templates`) — extended from Feature 3
   - Add a second tab: "Friends" alongside "My Templates"
   - "Friends" tab calls `GET /api/templates/shared`
   - Each card shows owner name + "Clone" button (no Edit / Archive)

2. **Template Editor** — extended from Feature 3
   - Visibility toggle at the top of the editor: 🔒 Private / 👥 Friends
   - Changing visibility makes an immediate `PATCH` request (no save required for this field alone)
   - Tooltip: "Friends who are connected via your invite link will be able to see and clone this template."

3. **Friends** (`/friends`) — simple read-only page
   - List of connected users with relationship label
   - "You have N friends connected via invites"
   - Link to invite page for users with no connections

### Components
- `VisibilityToggle` — two-state pill toggle (Private / Friends) with icon
- `FriendTemplateCard` — template card variant showing owner name + Clone button only (no Edit/Delete)
- `FriendsList` — list of connected users with relationship badge
- `SharedBadge` — small "Shared" chip on templates in owner's list that are set to `friends`

---

## Edge Cases

| Scenario | Handling |
|---|---|
| Template owner reverts to private mid-browse | Friend's next request returns 403; client shows "Template no longer available" |
| Friend relationship removed (user's invite deleted) | No effect: `invitedBy` link on users table is permanent once set |
| Clone of a template that the owner has since archived | Allowed — clone is independent, unaffected by owner's archive state |
| User shares template then deletes account | `user_id` on template set to NULL via `ON DELETE SET NULL`; template removed from shared list (owner_name shown as "Deleted User") |
| Friend has no shared templates | `GET /api/templates/shared` returns empty array, not 404 |

---

## Security Considerations

| Concern | Mitigation |
|---|---|
| Enumerate other users' private templates | API only returns templates where `user_id IN (friendIds) AND visibility = 'friends'`; friend list derived from DB, not user input |
| IDOR on template ID | Every read/write checks ownership or friend visibility server-side |
| Cloning a private template | Clone endpoint verifies the source template is `visibility = 'friends'` before proceeding; returns 403 otherwise |
| Exposing friend email | Friends endpoint returns only `displayName` and `userId`, never `email` |

---

## Testing Strategy

### Unit Tests
- Friend resolution query: user with inviter, user with invitees, user with both, user with neither
- Authorization helper: `canRead(requesterId, template)` — own private, own shared, friend shared, stranger private

### Integration Tests
- `PATCH /api/templates/:id/visibility` → `{ visibility: 'friends' }` — updates column, returns 200
- `GET /api/templates/shared` — returns only `friends`-visibility templates from connected users, not private ones
- `POST /api/templates/shared/:id/clone` — creates copy with `cloned_from`, sets new visibility to `private`
- `POST /api/templates/shared/:id/clone` on a private template → 403
- Non-friend attempts to access shared template → 403

### E2E Tests
- User A shares a template → User B (invitee of A) sees it in "Friends" tab → clones it → template appears in B's "My Templates" as private
- User A reverts template to private → B's "Friends" tab no longer shows it
- User with no invite connections sees empty "Friends" tab with invite prompt

---

## Implementation Phases

### Phase 1: Private by Default Audit (Week 8)
- Review all existing endpoints for `user_id` ownership checks
- Add integration tests to confirm no cross-user data leakage
- Document authorization matrix for all existing routes

### Phase 2: Visibility Toggle (Week 8)
- DB migration: add `visibility` column to `workout_templates`
- `PATCH /api/templates/:id/visibility` endpoint
- Visibility toggle in template editor UI

### Phase 3: Friends & Shared Templates (Week 8–9)
- `GET /api/friends` endpoint
- `GET /api/templates/shared` endpoint
- "Friends" tab in template list
- `POST /api/templates/shared/:id/clone` endpoint
- Friends page (read-only)

---

## Success Metrics
- 0 instances of unauthorized template access in security audit
- Visibility change reflects in friend's view within 1 API call (no cache delay)
- `GET /api/templates/shared` response < 300 ms for users with up to 50 friends
- Clone of shared template < 500 ms

---

## Future Enhancements (Post-MVP)
- Shareable public link for a template (anyone with the link can view + clone)
- Granular permissions: share with a specific user by email/name (not just all friends)
- Shared session summaries ("Jordan just PRed on Squat" — opt-in activity feed)
- Team / group workspace where all members can see and contribute templates
- Template comments / reactions from friends
- Privacy settings per session (currently always private; future: share individual sessions)
