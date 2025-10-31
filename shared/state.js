/* eslint-env browser */
window.State = (() => {
  // ---------- existing helpers (unchanged) ----------
  const getJSON = (k, d) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? d; }
    catch (e) { return d; }
  };
  const setJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const arr = (k) => {
    const v = getJSON(k, []);
    return Array.isArray(v) ? v : [];
  };
  const push = (k, obj) => {
    const a = arr(k);
    a.push(obj);
    setJSON(k, a);
    return a;
  };

  // ---------- NEW helpers (non-breaking) ----------
  // push only if uniqFn(existingItem, newItem) is true for a match
  const pushUnique = (k, obj, uniqFn) => {
    const a = arr(k);
    const exists = a.some((it) => uniqFn(it, obj));
    if (!exists) {
      a.push(obj);
      setJSON(k, a);
    }
    return a;
  };

  // write a millisecond timestamp (for polling UI refresh)
  const bumpTick = (tickKey) => {
    const ts = Date.now();
    localStorage.setItem(tickKey, String(ts));
    return ts;
  };

  // dobISO: "YYYY-MM-DD" (or Date-parsable) -> integer age
  const computeAge = (dobISO) => {
    const d = new Date(dobISO);
    if (Number.isNaN(d.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age;
  };

  // ---------- keys (original + federation/entries additions) ----------
  const keys = {
    // existing
    comps: 'competitions',
    events: (cid) => `events_${cid}`,
    athletes: (cid) => `athletes_${cid}`,              // RUN/TV consumer
    judges: (cid) => `judges_${cid}`,
    heats: (cid, eid) => `heats_${cid}_${eid}`,
    rules: 'rules',
    reveal: 'reveal',
    leaderboard: 'leaderboard',
    eventLog: 'eventLog',

    // NEW: federation-ready pipeline (adds only, no renames)
    federationsMaster: 'federations_master',
    athletesStaging: 'athletes_staging',
    athletesMaster: 'athletes_master',
    entriesStaging: (cid) => `entries_staging_${cid}`,
    athletesAidCursor: (cid) => `athletes_aid_cursor_${cid}`,

    // ticks (UI refresh hints)
    tickAthletesMaster: 'athletes_master_tick',
    tickAthletesCID: (cid) => `athletes_tick_${cid}`,
  };

  return {
    // existing
    getJSON, setJSON, arr, push, keys,
    // new
    pushUnique, bumpTick, computeAge,
  };
})();
