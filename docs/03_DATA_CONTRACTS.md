
# 📐 DATA CONTRACTS (Truth)

## Athlete
```json
{ "aid": "A2025-001", "name": "Ali Hassan", "gender": "M", "country": "MAS", "approved": true, "federation": "MSA" }
Judge
json
Copy code
{ "jid": "J1", "name": "Judge One", "role": "panel" }
Competition
json
Copy code
{ "cid": "CID_2025_KL_OPEN", "name": "KL Open 2025", "date": "2025-10-20", "venue": "Bukit Jalil", "status": "setup|running|finished", "progress": 0 }
Event
json
Copy code
{ "eid": "EID_STREET", "name": "Street", "category": "street" }
Heat
json
Copy code
{ "heatId": "Heat_A", "eventId": "EID_STREET", "athletes": ["A2025-001","A2025-002"] }
JudgeScore (per judge)
json
Copy code
{ "jid": "J1", "difficulty": 0, "execution": 0, "flow": 0, "total": 0, "locked": true }
ScoreAggregate (final per athlete)
json
Copy code
{ "aid": "A2025-001", "judgeTotals": [92.3, 89.1, 90.5], "dropHighLow": true, "final": 90.3 }
LeaderboardEntry
json
Copy code
{ "rank": 1, "aid": "A2025-001", "name": "Ali Hassan", "final": 90.3 }