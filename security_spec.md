# Security Specification for Chithighor (চিঠিঘর)

## 1. Data Invariants
1. **Letter Ownership & Identity Integrity**: A user can only create letters where `authorId == request.auth.uid`. Anonymous letters still maintain `authorId == request.auth.uid` internally for moderation and ownership check, but the public authorName shows "অচেনা প্রেরক / Anonymous".
2. **Immutability of Author & CreatedAt**: `authorId` and `createdAt` cannot be changed after creation.
3. **PII Protection & Isolation**: User private info (`/users/{userId}/private/info`) and Physical Order details (`/orders/{orderId}`) contain sensitive physical addresses and phone numbers. They must NEVER be publicly readable. Only the owner (`request.auth.uid == userId`) or an admin (`isAdmin()`) can read or write them.
4. **Visibility & Unlisted/Private Guards**: Letters with `visibility == 'private'` can only be read by the author or intended recipient. Unlisted and public letters can be fetched by ID. Only public and non-moderated non-draft letters can be queried via list.
5. **Admin Authority**: Only verified admin (e.g. `manikmia2049@gmail.com` or registered in `/admins/{uid}`) can moderate letters, resolve reports, or alter order status to dispatched/delivered.
6. **Report Protection**: Users can only create reports with `reportedBy == request.auth.uid`. Only admins can read or update reports.
7. **Reaction & Bookmark Integrity**: A user can only react to a letter under `/letters/{letterId}/reactions/{request.auth.uid}` where `userId == request.auth.uid`. A user can only bookmark letters under `/users/{request.auth.uid}/bookmarks/{letterId}`.

---

## 2. The "Dirty Dozen" Malicious Payloads

1. **Payload 1: Identity Spoofing on Letter Create**
   - Attacker attempts to forge another user's UID as author: `{ "authorId": "victim_uid", "title": "Spoofed Letter", "content": "Fake" }`
   - Expected Result: `PERMISSION_DENIED`
2. **Payload 2: Modifying Locked Author ID on Letter Update**
   - Attacker attempts to change `authorId`: `{ "authorId": "new_uid" }`
   - Expected Result: `PERMISSION_DENIED`
3. **Payload 3: Exposing Private Delivery Addresses (PII Leak)**
   - Unauthenticated or unauthorized user requests `get(/orders/{otherUserOrderId})`
   - Expected Result: `PERMISSION_DENIED`
4. **Payload 4: User Self-Assigning Admin Role**
   - Regular user attempts to write to `/admins/{uid}` or set `role: "admin"` in `/users/{uid}/private/info`
   - Expected Result: `PERMISSION_DENIED`
5. **Payload 5: Bypassing Moderation Flag on Letter Update**
   - Author attempts to flip `isModerated: false` on an admin-moderated letter
   - Expected Result: `PERMISSION_DENIED`
6. **Payload 6: Injecting Oversized Content (Denial of Wallet Attack)**
   - Attacker sends `title` with 10,000 characters or `content` with 500,000 characters
   - Expected Result: `PERMISSION_DENIED`
7. **Payload 7: Forging Another User's Reaction**
   - User `attacker_uid` writes to `/letters/{letterId}/reactions/victim_uid`
   - Expected Result: `PERMISSION_DENIED`
8. **Payload 8: Unauthorized Report Inspection**
   - Regular user attempts to `get` or `list` `/reports`
   - Expected Result: `PERMISSION_DENIED`
9. **Payload 9: Illegitimate Physical Order Status Tampering**
   - Customer changes order `status: "delivered"` or `paymentStatus: "paid"` on client-side
   - Expected Result: `PERMISSION_DENIED`
10. **Payload 10: Private Letter Snooping via List Query**
    - Unauthenticated attacker attempts blanket `list(/letters)` to extract private letters
    - Expected Result: `PERMISSION_DENIED`
11. **Payload 11: Ghost Field Injection (Shadow Update)**
    - Attacker submits an undocumented field `isSuperVip: true` or `bypassFilter: true` during update
    - Expected Result: `PERMISSION_DENIED`
12. **Payload 12: Fake Timestamp Injection**
    - Attacker provides fabricated past or future timestamps for `createdAt` instead of server `request.time`
    - Expected Result: `PERMISSION_DENIED`
