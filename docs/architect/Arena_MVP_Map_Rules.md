# Arena MVP — Mapping Rules & System Survey

**Repo:** Zed-Alqudsy/Arena
**Scan Date:** 2025-11-01 (MYT)
**Scope:** /core, /shared, /modules, /pages, /data (+ root docs/assets)

## Status Legend
- ✅ Active — used by current flows or imported/linked from active pages.
- ⚠️ Partial — referenced or WIP; incomplete feature or stale imports.
- 🚫 Legacy — not referenced by any active page/module; safe to archive.

## Classification Rules
1. Page linkage (HTML): Files referenced by entry pages (<script>/<link>) are Active.
2. Module imports (JS): Any JS imported by Active pages or another Active module is Active.
3. Data contracts (JSON/JS): Keys used by localStorage or State.* in Active flows are Active.
4. Docs/MD: Design/runbooks matching current feature surfaces are Partial unless superseded.
5. Unreferenced: Anything not reachable by (1)–(3) is Legacy.

## Known Root Items (initial tagging)
| Path | Type | Status | Notes |
|---|---|---|---|
| /core/ | dir | ⚠️ Partial | Needs import crawl |
| /shared/ | dir | ⚠️ Partial | CSS + helpers |
| /modules/ | dir | ⚠️ Partial | Feature modules |
| /pages/ | dir | ⚠️ Partial | Page shells |
| /data/ | dir | ⚠️ Partial | Presets/samples |
| /index.html | html | ✅ Active | Entry surface |
| /platform_index.html | html | ✅ Active | Platform hub |
| /arena-ui.css | css | ✅ Active | Global styles |
| /styles.css | css | ⚠️ Partial | Secondary styles |
| /FILETREE.txt | text | ⚠️ Partial | Tree snapshot |
| /full_tree.txt | text | ⚠️ Partial | Expanded tree |

## Next Actions
- Import crawl (HTML/JS) → update registries.
- Key extraction (localStorage/State) → storage_keys_map.json.
- Preset contract → preset_param_contract.json.
- Dep graph → dependency_graph.md (mermaid).
