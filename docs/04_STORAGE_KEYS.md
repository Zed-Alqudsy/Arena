04_STORAGE_KEYS.md — localStorage map

🗂️ STORAGE KEYS (localStorage)

xg_competitions_v2 → Array<Competition>

events_{cid} → Array<Event>

athletes_master → Array<Athlete> (approved)

athletes_pending → Array<Athlete> (pending)

athletes_rejected → Array<Athlete>

competition_entries_{cid} → Array<{ aid, status: "pending|approved|rejected" }>

athletes_{cid} → Array<Athlete> (approved for this comp)

judges_{cid} → Array<Judge>

heats_{cid}_{eid} → Heat[]

scores_{cid}_{eid}_{heat} → Map<aid, ScoreAggregate>

display_control_live1 / display_control_live2 → commands for displays