# Data sources and licensing

## Used now

**OpenFreeMap** supplies the Positron style and basemap resources directly to the browser. Its map data comes from OpenStreetMap and its tile schema/styles draw on OpenMapTiles. Preserve the attribution provided by the style and tile sources through MapLibre's attribution control.

- [OpenFreeMap service, attribution, and availability](https://openfreemap.org/)
- [Official MapLibre integration](https://openfreemap.org/quick_start/)
- [OpenStreetMap copyright and license](https://www.openstreetmap.org/copyright)
- [OpenMapTiles licensing](https://openmaptiles.org/docs/)
- [MapLibre GL JS source and license](https://github.com/maplibre/maplibre-gl-js)
- [Lucide license](https://lucide.dev/license)

The browser fetches styles, tile data, fonts, and sprites from the map provider and related resource endpoints. There is no analytics service or application-owned location storage. The provider receives ordinary requests (including the areas whose tiles are requested). Geolocation runs only when the user presses its control, and a resulting map movement requests tiles for that area.

City labels and camera positions are navigation presets. Phase 02 also ships a bounded OSM building dataset: 345 complete footprints, 161 sourced names, original raw tags, and per-record source references. Raw data and derived GeoJSON retain ODbL attribution and a separate data license notice. See [phase 02](PHASE_02.md) and [the import procedure](../pipelines/openstreetmap/README.md). No architecture descriptions or external photographs are copied into this prototype.

## Future data

A bounded OSM adapter exists. Overture was sampled for comparison; Wikidata, Commons, and regional registers remain candidates, not installed integrations. Before importing a dataset, verify its exact release, geography, fields, identifiers, license, attribution, update cadence, and permitted redistribution. Record a source URL and actual acquisition time. Keep source-specific requirements separate rather than treating all open data as one license.

For OSM, retain object type and identifier; names are not identity. Use cached, bounded development queries or reproducible extracts. A public Overpass instance is not the production query backend. For Wikidata, retain relevant claim identifiers, references, ranks, and qualifiers. A Wikidata identifier is not permission to copy related Wikipedia text or website content.

Commons images require per-file source, creator, license/version, attribution, and any modification notices. Never assume all files share one license. Firm or architecture-magazine websites may be outbound references; do not scrape/rehost their text or images without an applicable license.

## Application license

The source-code license is **pending owner selection**. The repository's open-source intent does not itself grant a license. `package.json` says `UNLICENSED` until that decision. Neither a future code license nor private hosting changes external dataset or image obligations.
