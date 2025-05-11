/**
 * Class representing the Gridworld in the quicksand environment.
 * @param {object} spec - The specification object that generates the GridWorld.
 * @property {number} width - The width of the grid.
 * @property {number} height - The height of the grid.
 * @property {number} cellSize - The size of the grid cell in pixels.
 * @property {Array} tiles - The tiles in the grid.
 * @property {object} canvas - The canvas element for the GridWorld.
 * @function initializeTiles - Initializes the tiles in the grid.
 * @function draw - Draws the grid on the canvas.
 * @function destroy - Draws the grid on the canvas.
 */

class GridWorld {
    constructor(spec, canvas) {
        this.width = spec.width;
        this.height = spec.height;
        this.canvas = canvas;
        this.cellSize = Math.min(this.canvas.width / this.width, this.canvas.height / this.height);

        this.tiles = [];
        this.initializeTiles(spec.layout);
    }

    initializeTiles(layout) {
        for (let y = 0; y < this.height; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.width; x++) {
                // console.log("y=" + y, ", x=" + x + " ; " + layout[y][x]);
                this.tiles[y][x] = new Tile(x, y, this.cellSize, layout[y][x]);
            }
        }
    }

    draw(ctx) {
        this.tiles.forEach((row) => row.forEach((tile) => tile.draw(ctx)));
    }

    destroy() {
        // nullify references to DOM elements or large objects
        this.tiles = null;
        this.canvas = null;
    }
}
