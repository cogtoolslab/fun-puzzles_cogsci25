/**
 * Class representing a single grid cell in the sokoban environment.
 * @param {number} x - The x-coordinate of the tile on the grid.
 * @param {number} y - The y-coordinate of the tile on the grid.
 * @param {number} cellSize - The size of the grid cell in pixels.
 * @param {string} state - The state of the tile (floor [ ], wall [#], goal empty [.], goal filled [*]).
 * @property {bool} isWall - Whether the tile is a wall.
 * @property {bool} isGoal - Whether the tile is the goal tile.
 * @property {number} transitionFrame - The current frame of the transition animation.
 * @property {number} lastTransitionFrame - The last frame of the transition animation.
 * @function initializeState - Initializes tile properties based on the input state.
 * @function draw - Draws the tile on the canvas.
 * @function getTileProperties - Determines the fillStyle and size of the tile.
 * @function determineFillStyle - Gets default fillStyle of the tile.
 */
class Tile {
    constructor(x, y, cellSize, state) {
        this.x = x;
        this.y = y;
        this.cellSize = cellSize;
        this.initializeState(state);
    }

    initializeState(state) {
        this.isWall = state === "#";
        this.isGoal = state === "." || state === "*" || state === "+";
        this.isFilledGoal = state === "*";
    }

    draw(ctx) {
        const [fillStyle, tileSize] = this.getTileProperties();
        drawRoundedRect(
            ctx,
            this.x * this.cellSize + (this.cellSize * (1 - tileSize)) / 2,
            this.y * this.cellSize + (this.cellSize * (1 - tileSize)) / 2,
            this.cellSize * tileSize,
            this.cellSize * tileSize,
            this.cellSize * gs.tile.corner_radius,
            convertToHSL(fillStyle)
        );
        if (this.isGoal) {
            // drawGoal(ctx,
            //     (this.x + 0.5) * this.cellSize,
            //     (this.y + 0.5) * this.cellSize,
            //     this.cellSize * gs.goal.size.radius,
            //     convertToHSL(gs.goal.colors.default),
            //     convertToHSL(gs.goal.colors.border)
            // )
        }
    }

    getTileProperties() {
        return [this.determineFillStyle(), gs.tile.size.base];
    }

    determineFillStyle() {
        if (this.isWall) return gs.tile.colors.wall;
        if (this.isGoal) return gs.tile.colors.goal;
        if (this.fillStyle) return this.fillStyle;
        return gs.tile.colors.default;
    }

}
