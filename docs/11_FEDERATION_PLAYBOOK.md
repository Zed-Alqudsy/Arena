🏛️ FEDERATION PLAYBOOK
Pages

/modules/federation/approve_athletes.html

/modules/federation/approve_entries.html

Tasks

Review athletes_pending → approve → athletes_master OR reject → athletes_rejected.

Review competition_entries_{cid} → approve → add to athletes_{cid} OR reject → remove.

Rules

No duplicate AIDs in athletes_master.

Entry approval only if AID exists in athletes_master.