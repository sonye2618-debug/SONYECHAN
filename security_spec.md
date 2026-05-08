# Security Specification - Access Logs

## Data Invariants
1. A visitor log must have a `companyName` string of reasonable length.
2. A visitor log must have a valid server timestamp.
3. Visitor logs are append-only for the public.
4. Only the site owner can read the collection of visitor logs.

## The "Dirty Dozen" Payloads (Deny Cases)
1. **Empty Payload**: `{}` (Missing required fields)
2. **Missing Timestamp**: `{"companyName": "Acme Corp"}`
3. **Invalid Timestamp Type**: `{"companyName": "Acme Corp", "timestamp": "2024-01-01"}` (Client string instead of server timestamp)
4. **Huge String**: `{"companyName": "A".repeat(2000), "timestamp": request.time}` (Resource exhaustion)
5. **Additional Field Injection**: `{"companyName": "Acme Corp", "timestamp": request.time, "isAdmin": true}` (Shadow update/creation)
6. **Malicious ID Tracking**: Attempting to create with a document ID that is junk characters.
7. **Public Read**: `getDocs(collection(db, 'visitors'))` as unauthenticated user.
8. **Malicious Update**: Attempting to change a `companyName` after entry.
9. **Malicious Delete**: Attempting to remove evidence of visit.
10. **Spoofed UserAgent**: `{"companyName": "X", "timestamp": request.time, "userAgent": 123}` (Type mismatch)
11. **Null Company**: `{"companyName": null, "timestamp": request.time}`
12. **Wrong Key Name**: `{"corpName": "X", "timestamp": request.time}`

## The Test Runner (Mock)
See `firestore.rules.test.ts` for implementation details.
