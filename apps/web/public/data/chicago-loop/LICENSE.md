# Chicago Loop building data

© OpenStreetMap contributors. This database is available under the
[Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/).
See [OpenStreetMap copyright](https://www.openstreetmap.org/copyright).

`source.json` is the cached Overpass response. `acquisition.json` records its actual
retrieval time, source snapshot, query, endpoint, and SHA-256 checksum.
`buildings.geojson` is a derived pilot database produced by Arch It: complete
footprints within the pilot bounds are selected, geometry winding is normalized,
centroids and internal IDs are derived, and selected source tags are projected into
claims with separately normalized display values. Raw values and their source
references remain intact. The source snapshot is unchanged. See the GeoJSON
metadata for exclusions, tag coverage, and parsing diagnostics.

These data files retain their ODbL license independently of the application's
undecided code license. Preserve this notice and attribution when redistributing.
