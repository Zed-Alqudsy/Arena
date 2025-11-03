// core/sync_local.js  — localStorage-based bus for judge lock packets

(function () {
    const TOPIC = 'judge_status';

    // Emit a packet (fires storage events in other tabs)
    function send(type, payload) {
        if (type !== TOPIC) return;
        const packet = { type, ts: Date.now(), ...payload };
        try {
            localStorage.setItem(TOPIC, JSON.stringify(packet));
            // Nudge same-tab listeners if you decide to listen to this key too
            localStorage.setItem(TOPIC + '_tick', String(Math.random()));
        } catch (e) {
            console.warn('SyncLocal send failed', e);
        }
    }

    // Subscribe to packets
    function on(handler) {
        window.addEventListener('storage', (e) => {
            if (e.key !== TOPIC) return;
            try {
                const pkt = JSON.parse(e.newValue || 'null');
                if (pkt && pkt.type === TOPIC) handler(pkt);
            } catch { }
        });
    }

    function normalize(v) {
        const num = Number(v);
        return Number.isFinite(num) ? num : null;
    }

    function verifyPhaseConsistency(cid, eid) {
        const result = { ok: true, differences: [] };
        try {
            if (!cid || !eid || !window.State) {
                result.ok = false;
                result.differences.push({ metric: 'params', note: 'cid/eid missing or State unavailable' });
                console.warn('verifyPhaseConsistency prerequisites missing', { cid, eid });
                return result;
            }
            const setup = State.getSetupRecord ? State.getSetupRecord(cid) : null;
            const events = State.arr ? State.arr(State.keys.events(cid)) : [];
            const event = events.find(e => e && e.eid === eid) || {};
            const heatsObj = State.getJSON ? State.getJSON(State.keys.heats(cid, eid), { heats: [] }) : { heats: [] };
            const heat = (Array.isArray(heatsObj?.heats) && heatsObj.heats.length)
                ? heatsObj.heats[0]
                : {};
            const presetSnap = State.ensurePresetSnapshot ? State.ensurePresetSnapshot(cid) : null;
            const preset = event?.preset || presetSnap || {};
            const judgesStore = State.getJSON ? State.getJSON(State.keys.judges(cid), null) : null;

            const values = {
                judges: {
                    setup: normalize(setup?.judging?.panelSize),
                    event: normalize(judgesStore?.panelSize || (Array.isArray(judgesStore?.roles) ? judgesStore.roles.length : preset?.judges)),
                    run: normalize(Array.isArray(heat?.judgesPanel) ? heat.judgesPanel.length : null)
                },
                runsPerAthlete: {
                    setup: normalize(setup?.preset?.runsPerAthlete || setup?.p_runsPerAthlete),
                    event: normalize(preset?.runsPerAthlete || event?.runsPerAthlete),
                    run: normalize(heat?.runsPerAthlete)
                },
                slots: {
                    setup: normalize(setup?.heatsTemplate?.heatSize),
                    event: normalize(heatsObj?.defaultSize),
                    run: normalize(Array.isArray(heat?.slots) ? heat.slots.filter(Boolean).length : null)
                },
                advancementTopN: {
                    setup: normalize(setup?.preset?.advancementTopN || setup?.heatsTemplate?.advancement),
                    event: normalize(preset?.advancementTopN || event?.advancementTopN),
                    run: normalize(heat?.advancementTopN)
                }
            };

            Object.entries(values).forEach(([metric, readings]) => {
                const present = Object.entries(readings)
                    .filter(([, value]) => value !== null && value !== undefined);
                if (!present.length) return;
                const base = present[0][1];
                const mismatch = present.some(([, value]) => value !== base);
                if (mismatch) {
                    result.ok = false;
                    result.differences.push({ metric, ...readings });
                }
            });

            if (result.ok) {
                console.log('✅ Consistency OK', { cid, eid });
            } else {
                console.warn('⚠ Consistency diff', result);
            }
        } catch (err) {
            result.ok = false;
            result.error = err.message;
            console.warn('verifyPhaseConsistency failed', err);
        }
        return result;
    }

    // Public API
    window.SyncLocal = { send, on, TOPIC, verifyPhaseConsistency };
})();
