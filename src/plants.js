// Plants requested by builders that work with a Batch. They used to be a few stacked cylinders merged into the batch;
// now the batch only remembers where they stand, and Batch.build() adds leaf-card trees and palms from flora.js there
// (same coordinates as the rest of the batch).
/** Palm of height h standing at (x, z), foot at y0. */
export function palm(batch, x, z, h = 6, y0 = 0) {
  (batch.plants ||= { trees: [], palms: [] }).palms.push([x, z, h, y0]);
  batch.frame(0, 0, 0);
}
/** Broadleaf tree of height h standing at (x, z), foot at y0. */
export function tree(batch, x, z, h = 8, y0 = 0) {
  (batch.plants ||= { trees: [], palms: [] }).trees.push([x, z, h, y0]);
  batch.frame(0, 0, 0);
}
