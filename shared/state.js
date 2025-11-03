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
    roles: (cid) => `roles_${cid}`,
    eventLock: (cid) => `event_lock_${cid}`,
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

  const SETUP_KEY = 'arena_competitions_setup';
  function getSetupRecord(cid) {
    if (!cid) return null;
    try {
      const raw = JSON.parse(localStorage.getItem(SETUP_KEY) || '[]');
      const list = Array.isArray(raw) ? raw : (raw ? Object.values(raw) : []);
      return list.find(r => r && r.cid === cid) || null;
    } catch (_) {
      return null;
    }
  }

  const defaultRoles = [
    { id: 'head_judge', role: 'Head Judge', name: '', contact: '' },
    { id: 'mc', role: 'MC', name: '', contact: '' },
    { id: 'timekeeper', role: 'Timekeeper', name: '', contact: '' },
    { id: 'scorer', role: 'Scorer', name: '', contact: '' }
  ];

  function ensureRolesRegistry(cid) {
    if (!cid) return defaultRoles.map(r => ({ ...r }));
    const key = keys.roles(cid);
    const existing = getJSON(key, null);
    if (existing && Array.isArray(existing.roles)) return existing.roles;
    const seeded = defaultRoles.map(r => ({ ...r }));
    setJSON(key, { roles: seeded, updatedAt: Date.now() });
    return seeded;
  }

  function getRolesRegistry(cid) {
    if (!cid) return defaultRoles.map(r => ({ ...r }));
    const data = getJSON(keys.roles(cid), null);
    if (data && Array.isArray(data.roles)) return data.roles;
    return ensureRolesRegistry(cid);
  }

  function writeRolesRegistry(cid, roles) {
    if (!cid) return;
    const safe = Array.isArray(roles) ? roles.map(r => ({ ...r })) : defaultRoles.map(r => ({ ...r }));
    setJSON(keys.roles(cid), { roles: safe, updatedAt: Date.now() });
  }

  function ensurePresetSnapshot(cid) {
    if (!cid) return null;
    const key = `preset_snapshot_${cid}`;
    const existing = getJSON(key, null);
    if (existing) return existing;
    const events = arr(keys.events(cid));
    const fromEvent = events.find(ev => ev && typeof ev.preset === 'object');
    if (fromEvent && fromEvent.preset) {
      setJSON(key, fromEvent.preset);
      return fromEvent.preset;
    }
    return null;
  }

  function auditPresetCompleteness(cid) {
    if (!cid) return { ok: false, missing: ['cid missing'], snapshot: null };
    const snap = getJSON(`preset_snapshot_${cid}`, null);
    const missing = [];
    if (!snap || typeof snap !== 'object') {
      missing.push('snapshot missing');
    } else {
      if (!(Number(snap.runsPerAthlete) > 0)) missing.push('runsPerAthlete');
      if (!Array.isArray(snap.rounds) || snap.rounds.length === 0) missing.push('rounds');
      if (!(Number(snap.judges) > 0)) missing.push('judges');
      if (typeof snap.dropHighLow !== 'boolean') missing.push('dropHighLow');
      if (!(Number(snap.advancementTopN) > 0)) missing.push('advancementTopN');
    }
    return { ok: missing.length === 0, missing, snapshot: snap };
  }

  function validateHeatTemplate(heat = {}, preset = {}) {
    const details = {
      actual: {
        judges: Array.isArray(heat?.judgesPanel) ? heat.judgesPanel.length
          : (Array.isArray(heat?.judges) ? heat.judges.length : Number(heat?.judgesCount || heat?.judges || 0)),
        slots: Array.isArray(heat?.slots) ? heat.slots.filter(Boolean).length
          : Number(heat?.slotCount || heat?.slots || 0),
        advancementTopN: Number(heat?.advancementTopN || heat?.advancement || 0)
      },
      expected: {
        judges: Number(preset?.judges
          ?? (Array.isArray(preset?.judgesPanel) ? preset.judgesPanel.length : 0)
          ?? 0),
        slots: Number(heat?.expectedSlots
          ?? heat?.slotCount
          ?? heat?.defaultSize
          ?? preset?.heatSize
          ?? 0),
        advancementTopN: Number(preset?.advancementTopN || 0)
      }
    };

    if (!details.expected.slots && Number(heat?.defaultSize)) {
      details.expected.slots = Number(heat.defaultSize);
    }
    if (!details.expected.slots && Number(preset?.advancementTopN)) {
      details.expected.slots = Number(preset.advancementTopN);
    }
    if (!details.expected.advancementTopN && Number(heat?.advancementTopN)) {
      details.expected.advancementTopN = Number(heat.advancementTopN);
    }

    const issues = [];
    if (details.expected.judges > 0) {
      const actual = Number(details.actual.judges || 0);
      if (actual !== details.expected.judges) {
        issues.push(`judges=${actual} expected=${details.expected.judges}`);
      }
    }
    if (details.expected.slots > 0) {
      const actualSlots = Number(details.actual.slots || 0);
      if (actualSlots !== details.expected.slots) {
        issues.push(`slots=${actualSlots} expected=${details.expected.slots}`);
      }
    }
    if (details.expected.advancementTopN > 0) {
      const actualAdv = Number(details.actual.advancementTopN || 0);
      if (actualAdv !== details.expected.advancementTopN) {
        issues.push(`advancementTopN=${actualAdv} expected=${details.expected.advancementTopN}`);
      }
    }

    return {
      ok: issues.length === 0,
      issues,
      details
    };
  }

  function auditRosterLinkage(cid, eid) {
    if (!cid || !eid) return null;
    const athletesRaw = getJSON(keys.athletes(cid), []);
    const heatsRaw = getJSON(keys.heats(cid, eid), { heats: [] });
    const athleteIds = new Set();
    (Array.isArray(athletesRaw) ? athletesRaw : []).forEach(a => {
      const id = String(a?.aid || a?.id || a?.code || '').trim();
      if (id) athleteIds.add(id);
    });
    const assigned = new Map();
    const emptySlots = [];
    (Array.isArray(heatsRaw?.heats) ? heatsRaw.heats : []).forEach((heat, hi) => {
      const slots = Array.isArray(heat?.slots) ? heat.slots : [];
      slots.forEach((slot, si) => {
        const aid = String(slot?.aid ?? slot ?? '').trim();
        if (!aid) {
          emptySlots.push({ heatIndex: hi, heatName: heat?.name || `Heat ${hi + 1}`, position: si + 1 });
          return;
        }
        const info = assigned.get(aid) || { count: 0, heats: [] };
        info.count += 1;
        info.heats.push({ heatIndex: hi, heatName: heat?.name || `Heat ${hi + 1}` });
        assigned.set(aid, info);
      });
    });

    const duplicates = [];
    assigned.forEach((info, aid) => {
      if (info.count > 1) duplicates.push({ aid, count: info.count, heats: info.heats });
    });
    const unassigned = [...athleteIds].filter(aid => !assigned.has(aid));

    return {
      totalAthletes: athleteIds.size,
      assignedCount: assigned.size,
      duplicates,
      unassigned,
      emptySlots
    };
  }

  function lockEvent(cid) {
    if (!cid) return;
    localStorage.setItem(keys.eventLock(cid), 'true');
  }

  function isEventLocked(cid) {
    if (!cid) return false;
    return localStorage.getItem(keys.eventLock(cid)) === 'true';
  }

  return {
    // existing
    getJSON, setJSON, arr, push, keys,
    // new
    pushUnique, bumpTick, computeAge, validateHeatTemplate,
    ensureRolesRegistry, getRolesRegistry, writeRolesRegistry,
    ensurePresetSnapshot, auditPresetCompleteness, getSetupRecord,
    auditRosterLinkage,
    lockEvent, isEventLocked,
  };
})();
