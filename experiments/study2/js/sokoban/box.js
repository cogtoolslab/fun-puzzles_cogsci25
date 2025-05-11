/**
 * Class representing a single box in the sokoban environment.
 * @param {number} x - The x-coordinate of the box's current tile on the grid.
 * @param {number} y - The y-coordinate of the box's current tile on the grid.
 * @param {number} cellSize - The size of the grid cell in pixels.
 * @param {string} onGoal - Whether the box is on a goal (on goal [*], off goal [$]).
 * @function draw - Draws the box on the canvas.
 * @function setPosition - Sets the box's position to the given coordinates.
 * @function destroy - Destroys the box.
 */

class Box {
    constructor(x, y, cellSize, state) {
        this.x = x;
        this.y = y;
        this.cellSize = cellSize;
        this.onGoal = this.initializeState(state);
    }

    initializeState(state) {
        return state == "*" // $ for off goal, * for on goal
    }

    draw(ctx) {
        const boxSize = gs.box.size.base;
        const fillStyle = this.onGoal ? gs.box.colors.success : gs.box.colors.default;
        const borderStyle = this.onGoal ? gs.box.colors.success_border : gs.box.colors.border
        drawDiamond(
            ctx,
            (this.x + (1 - boxSize) / 2) * this.cellSize,
            (this.y + (1 - boxSize) / 2) * this.cellSize,
            boxSize * this.cellSize,
            this.cellSize * gs.tile.corner_radius,
            convertToHSL(fillStyle),
            convertToHSL(borderStyle),
            this.cellSize * 0.07,//gs.box.size.borderWidth,
            this.onGoal
        );
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    destroy() {
        this.ctx = null;
    }
}
