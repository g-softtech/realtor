# 🚀 SYSTEM MIGRATION GUIDE (MIGRATION.md)

---

## 1. Overview
During Phase 8 (Advanced Image System), we introduced **strict agent ownership validation**. New properties automatically record the ID of the agent who created them in the `agent` field. 

Agents are now blocked from deleting images on properties they do not own. Because properties created prior to Phase 8 lack this `agent` field entirely, agents cannot manage images for these legacy properties (yielding a `403 Forbidden` error).

---

## 2. Legacy Property Ownership Migration
To restore full management rights for agents on older properties, we must run a one-time database migration script.

**Script Location:** `backend/scripts/migrate_legacy_properties.js`

### Step-by-Step Procedure
1. **Identify the Target User:** 
   Locate the MongoDB `_id` of the primary Admin or Agent who should take ownership of all legacy properties. (You can find this in your MongoDB Atlas dashboard under the `users` collection).
2. **Configure the Script:** 
   Open `backend/scripts/migrate_legacy_properties.js` and replace `'INSERT_PRIMARY_ADMIN_OR_AGENT_ID_HERE'` with the actual `_id` string.
3. **Execute the Script:**
   Run the script from your terminal:
   ```bash
   cd backend
   node scripts/migrate_legacy_properties.js
   ```
4. **Verify Output:**
   The script will output the number of records it updated (e.g., `Assigned ownership to 4 legacy properties.`).

Once completed, the assigned user will have full ownership rights to manage and delete images on those legacy properties!
