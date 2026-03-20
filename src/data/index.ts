/**
 * @file src/data/index.ts
 *
 * Barrel export — single entry point for all product catalogue data.
 *
 * Import from this file rather than reaching into tiling-products.ts directly.
 */

export {
    ADHESIVE_PRODUCTS,
    GROUT_PRODUCTS,
    SPACER_PRODUCTS,
    BACKER_BOARD_PRODUCTS,
    TANKING_PRODUCTS,
    SLC_PRODUCTS,
    PRIMER_PRODUCTS,
} from './tiling-products';

export {
    BRICK_PRODUCTS,
    BLOCK_PRODUCTS,
    SAND_PRODUCTS,
    CEMENT_PRODUCTS,
    WALL_TIE_PRODUCTS,
    DPC_PRODUCTS,
    CONCRETE_LINTEL_PRODUCTS,
    STEEL_LINTEL_PRODUCTS,
    PADSTONE_PRODUCTS,
    CAVITY_CLOSER_PRODUCTS,
    CAVITY_TRAY_PRODUCTS,
} from './masonry-products';

export { projects, standaloneTools } from './projects';
