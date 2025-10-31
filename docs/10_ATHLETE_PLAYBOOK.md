🏃 ATHLETE PLAYBOOK
Pages

/modules/athlete/home.html

/modules/athlete/register.html

/modules/athlete/join.html

Flow

Register → write to athletes_pending.

Federation approves → move to athletes_master.

Join competition → append to competition_entries_{cid} with status:"pending".

Federation approves entry → add athlete into athletes_{cid}.

Keys Touched

athletes_pending, athletes_master, competition_entries_{cid}, athletes_{cid}

Tests

Registration creates pending record.

Approved record appears in competition setup athlete list.

Joining a comp adds entry to that comp.

Approval moves to athletes_{cid}.