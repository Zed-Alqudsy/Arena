// /shared/preset_adapter.js
// Light adapter to read preset data and apply it to event objects

if (typeof PRESETS === "undefined") {
  console.error("PRESETS not loaded — ensure presets.js is included before preset_adapter.js");
}

const Preset = {
  // Return all available presets as an array
  list() {
    return Object.entries(PRESETS).map(([id, data]) => ({ id, ...data }));
  },

  // Get a single preset by ID
  get(id) {
    return PRESETS[id] || null;
  },

  // Apply preset values to a target event object
  applyTo(event, presetId) {
    const preset = PRESETS[presetId];
    if (!preset) return event;

    // Create a shallow clone with preset fields applied
    return Object.assign({}, event, {
      preset_id: presetId,
      preset_name: preset.name,
      discipline: preset.discipline,
      rounds: preset.rounds,
      runsPerAthlete: preset.runsPerAthlete,
      tricksPerRound: preset.tricksPerRound || 0,
      runTime: preset.runTime,
      judges: preset.judges,
      judgingScale: preset.judgingScale,
      dropHighLow: preset.dropHighLow,
      advancementTopN: preset.advancementTopN,
      scoringFormat: preset.scoringFormat,
    });
  }
};

if (typeof module !== "undefined") module.exports = Preset;
