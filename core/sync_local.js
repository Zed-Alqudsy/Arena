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

    // Public API
    window.SyncLocal = { send, on, TOPIC };
})();
