/**
 * Class handling interactions between Agent, Gridworld, and participant UI.
 * @param {object} spec - The specification object that generates a GridWorld.
 * @property {object} canvas - The canvas element for the GridWorld.
 * @property {object} ctx - The 2D context of the canvas.
 * @property {object} submitBtn - The button that submits the path.
 * @property {object} gridWorld - The GridWorld object.
 * @property {object} agent - The Agent object.
 * @property {Array} boxes - Array of boxes.
 * @property {function} handleCanvasKeydown - The bound handleCanvasClick function.
 * @function addEventListeners - Adds event listeners to the grid canvas.
 * @function removeEventListeners - Removes event listeners from the grid canvas.
 * @function initGameElements - Initializes the game elements.
 * @function loop - The main animation loop.
 * @function updateEnvironment - Updates the environment.
 * @function updateUI - Updates the UI - particularly the submit button. // TODO?
 * @function undo - Undos the previous move // TODO
 * @function move - Moves the agent in the specified direction
 * @function getNextCoord - Gets the next coordinate based on the current object and move vector
 * @function getTileAtCoord - Gets the tile at the specified coordinates
 * @function getBoxesAtTile - Gets the boxes at the specified tile
 */
class Environment {
    constructor(spec, canvas, isInteractive = true) {
        this.canvas = canvas;
        this.solved = false;
        this.initGameElements(spec, canvas);
        this.animationFrameId = requestAnimationFrame(this.loop.bind(this)); // start game loop

        // testing out keydown events - bound to canvas! works!
        if (isInteractive) {
            this.handleCanvasKeyBound = this.handleCanvasKeydown.bind(this);
            this.addEventListeners();
            this.inputEvents = [];
            this.steps = [];
        }

        // testing out click events - works!
        // this.handleCanvasClick = this.handleCanvasClick.bind(this); // allows handler to access environment as this
        // this.canvas.addEventListener("click", this.handleCanvasClick);
    }

    addEventListeners() {
        this.canvas.addEventListener("keydown", this.handleCanvasKeyBound);
        // console.log("added event listeners");
    }

    removeEventListeners() {
        this.canvas.removeEventListener("keydown", this.handleCanvasKeyBound);
        // console.log("removed event listeners");
    }

    initGameElements(spec, canvas) {
        this.spec = spec;
        this.canvas = canvas;
        this.frameDuration = 1000 / gs.game_info.fps;
        this.lastFrameTime = window.performance.now();
        // OBTAIN POINTERS TO DOM OBJECTS
        this.ctx = this.canvas.getContext("2d");
        try {
            this.undoBtn = document.getElementById("undoBtn");
            this.resetBtn = document.getElementById("resetBtn");
            this.submitBtn = document.getElementById("submitBtn");
            this.solvedModal = document.getElementById("puzzle-solved-modal")
        } catch (e) {
            console.error("UI buttons not found");
        }
        if (document.getElementById("stepsTaken")) {
            gs.game_info.count_moves = true;
            this.stepsTakenText = document.getElementById("stepsTaken");
        } else {
            gs.game_info.count_moves = false;
        }
        this.instructionsText = document.getElementById("instructionText");
        // INITIALIZE GRID OF TILES, AGENT, and BOXES
        this.gridWorld = new GridWorld(this.spec, this.canvas);
        this.setupAgent(this.spec.start_position);
        this.setupBoxes(this.spec.boxes);

    }

    setupAgent(start_position) {
        this.agent = new Agent(
            start_position.x,
            start_position.y,
            this.gridWorld.cellSize,
            gs.agent.colors.default
        );
    }

    setupBoxes(all_boxes) {
        this.boxes = [];
        for (let i = 0; i < all_boxes.length; i++) {
            this.boxes.push(new Box(
                all_boxes[i].x,
                all_boxes[i].y,
                this.gridWorld.cellSize,
                all_boxes[i].state));
        }
    }


    loop() {
        if (document.hasFocus() || gs.study_metadata.dev_mode) {
            const now = window.performance.now();
            const timeElapsed = now - this.lastFrameTime;
            if (timeElapsed > this.frameDuration) {
                this.lastFrameTime = now - (timeElapsed % this.frameDuration);
                this.updateEnvironment();
                this.updateUI();
            }
        }
        // this.animationFrameId = requestAnimationFrame(() => this.loop());
        this.animationFrameId = requestAnimationFrame(this.loop.bind(this));

    }

    updateEnvironment() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.gridWorld.draw(this.ctx);
        this.agent.draw(this.ctx); // draws agent
        this.boxes.forEach((box) => box.draw(this.ctx));        // draws boxes
        if (this.solved) {
            cancelAnimationFrame(animationFrameId);
        }
    }

    checkSolved() {
        return this.boxes.filter((b) => !b.onGoal).length == 0
    }

    updateUI() {
        this.boxes_left = this.boxes.filter((b) => !b.onGoal).length;
        // update trackers
        if (gs.game_info.count_boxes_left) {
            this.submitBtn.textContent = this.boxes_left > 0 ? "Boxes Left: " + this.boxes_left : "Submit";
        }
        if (gs.game_info.count_moves) {
            this.stepsTakenText.textContent = this.steps.length
        }
        if (this.checkSolved()) {
            this.solved = true;
            this.isInteractive = false;
            setTimeout(() => {
                window.confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.7 },
                    // origin: { y: 0.7, x: 0.4 },
                    ticks: 300
                })
            }, 300);
            if (this.submitBtn) {
                this.submitBtn.disabled = false;
            }
            if (this.resetBtn) {
                this.resetBtn.disabled = true;
            }
            if (this.undoBtn) {
                this.undoBtn.disabled = true;
            }
            if (this.solvedModal) {
                setTimeout(() => { this.solvedModal.style.display = "block" }, 1800)
            }
        }

    }

    handleCanvasClick(event) {
        // get grid coordinates of clicked tile
        const rect = event.target.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / this.gridWorld.cellSize);
        const y = Math.floor((event.clientY - rect.top) / this.gridWorld.cellSize);
        // get tile object at clicked coordinates
        const clickedTile = this.gridWorld.tiles[y][x];
        // convert to direction
        const move_x = clickedTile.x - this.agent.x
        const move_y = clickedTile.y - this.agent.y
        var direction = ""
        if (Math.abs(move_x) + Math.abs(move_y) === 1) {
            if (move_x === 0 && move_y === -1) {
                direction = "U";
            } else if (move_x === 0 && move_y === 1) {
                direction = "D";
            } else if (move_x === -1 && move_y === 0) {
                direction = "L";
            } else if (move_x === 1 && move_y === 0) {
                direction = "R";
            }
            this.move(direction);
        }
    }

    // How to process key presses
    handleCanvasKeydown(e) {
        const ts = performance.now()

        if (this.checkSolved()) return;

        if (e.keyCode in gs.keycodes) {
            // convert key press to LEFT RIGHT UP DOWN
            const direction = gs.keycodes[e.keyCode];
            // implement moving logic
            const event = this.move(direction);
            // log event
            this.log_event(direction, ts, event);
        }
    }

    log_event(inputEvent, ts, event = undefined) {
        const msg = {
            timestamp: ts,
            action: inputEvent,
            event: event,
            boxes: this.boxes.map((box) => ({
                x: box.x,
                y: box.y,
                onGoal: box.onGoal
            })),
            agent: {
                x: this.agent.x,
                y: this.agent.y,
                orientation: this.agent.orientation
            },
        }
        this.inputEvents.push(msg);
        // console.log(msg);
    }

    restart() {
        const ts = performance.now()
        this.agent = null;
        this.boxes.forEach(box => box.destroy());
        this.boxes = null;
        this.setupAgent(this.spec.start_position);
        this.setupBoxes(this.spec.boxes);
        // log undo event
        this.log_event("restart", ts)
    }

    undo() {
        const ts = performance.now()

        if (this.steps.length === 0) {
            this.log_event("undo", ts)
            return
        };

        const lastMove = this.steps.pop();
        const isUpperCase = lastMove === lastMove.toUpperCase();
        const direction = gs.direction_to_vec[lastMove.toUpperCase()];

        // Reverse direction vector
        const reverseVec = { x: -direction.x, y: -direction.y };

        if (isUpperCase) {
            // Was a box push - need to move both box and agent back
            const boxTile = this.getTileAtCoord(this.getNextCoord(this.agent, direction));
            const box = this.getBoxesAtTile(boxTile)[0];

            // Move box back
            box.setPosition(this.agent.x, this.agent.y);

            // Update box goal state
            const newTile = this.getTileAtCoord([this.agent.x, this.agent.y]);
            box.onGoal = newTile.isGoal;
        }

        // Move agent back
        this.agent.setPosition(
            this.agent.x + reverseVec.x,
            this.agent.y + reverseVec.y
        );
        // make agent look in the opposite direction
        this.agent.look(lastMove.toUpperCase());

        // log undo event
        this.log_event("undo", ts)
    }

    move(direction) { // one move at a time
        // convert to x, y vector
        // remember: x = col, y = rows
        const move_vec = gs.direction_to_vec[direction];
        // Grab coordinates and tile object at next location
        var agent_next_tile = this.getTileAtCoord(this.getNextCoord(this.agent, move_vec)); // y, x
        // // Find all boxes at next coordinate (there should be 0 or 1)
        var boxes_at_coord1 = this.getBoxesAtTile(agent_next_tile);
        // // Now we define positive cases where movement should occur

        this.agent.look(direction);

        if (agent_next_tile.isWall) {
            // Case 0: Blocked by wall! Don't move agent.
            this.agent.bump(direction);
            return ('cannot_step');
        } else if (boxes_at_coord1.length === 1) {
            // There is a box, check if pushable 
            // get tile object where box would be moved to.
            var box_next_tile = this.getTileAtCoord(this.getNextCoord(agent_next_tile, move_vec));
            // Get any boxes on that following coordinate
            var boxes_at_coord2 = this.getBoxesAtTile(box_next_tile);

            // Case 1: Box is blocked by wall or another box! Don't move agent or box.
            if (box_next_tile.isWall || boxes_at_coord2.length === 1) {
                this.agent.bump(direction);
                return ('cannot_push');
            }

            // Case 2: Box is pushable! Move box and agent.
            boxes_at_coord1[0].setPosition(box_next_tile.x, box_next_tile.y);
            this.agent.setPosition(agent_next_tile.x, agent_next_tile.y);
            // also track move as a push
            this.steps.push(direction.toUpperCase());
            // also update box state
            if (box_next_tile.isGoal) {
                boxes_at_coord1[0].onGoal = true;
            } else {
                boxes_at_coord1[0].onGoal = false;
            }
            return ('push_' + direction);
        } else {
            // Case 3: No wall, No box. Move agent.
            this.agent.setPosition(agent_next_tile.x, agent_next_tile.y);
            this.steps.push(direction.toLowerCase());
            return ('step_' + direction);
        }
    }

    getNextCoord(currentObject, move_vec) {
        const next_x = currentObject.x + move_vec.x
        const next_y = currentObject.y + move_vec.y
        return [next_x, next_y];
    }

    getTileAtCoord(coord) {
        return this.gridWorld.tiles[coord[1]][coord[0]];
    }

    getBoxesAtTile(tile) {
        return this.boxes.filter((b) => b.x === tile.x && b.y === tile.y);
    }

    destroy() {
        cancelAnimationFrame(this.animationFrameId);
        this.removeEventListeners();
        // nullify references to DOM elements or large objects
        this.gridWorld = null;
        this.agent = null;
        this.boxes.forEach(box => box.destroy());
        this.boxes = null;
        this.canvas = null;
        this.ctx = null;
        this.submitBtn = null;
        this.undoBtn = null;
        this.resetBtn = null;
        this.steps = null;
        this.stepsTakenText = null;
    }
}  