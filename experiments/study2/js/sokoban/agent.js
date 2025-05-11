/**
 * Class representing an Agent in the Gridworld.
 * @param {number} x - The x-coordinate of the agent on the grid.
 * @param {number} y - The y-coordinate of the agent on the grid.
 * @param {number} cellSize - number of pixels in a grid cell.
 * @property {number} travelFrame - The current frame of the agent's travel animation.
 * @function draw - Draws the agent on the canvas.
 * @function setPosition - Sets the agent's position to the given coordinates.
 * @function look - Sets the agent's orientation to the given direction.
 * @function bump - Moves the agent across the a tile in a supplied direction.
 * @function destroy - Destroys the agent.
 */

class Agent {
    constructor(x, y, cellSize, color) {
        this.x = x;
        this.y = y;
        this.cellSize = cellSize;
        this.color = color;

        // Position offsets for gaze and bump animation
        this.orientation = "U"
        this.orientationShift = gs.direction_to_vec[this.orientation];
        this.offset = { x: 0, y: 0 };
    }


    draw(ctx) {
        // compute locations
        const centerX = (this.x + 0.5) * this.cellSize + this.offset.x;
        const centerY = (this.y + 0.5) * this.cellSize + this.offset.y;
        const radius = this.cellSize * gs.agent.size.radius;
        const [bodyRadiusX, bodyRadiusY] = compute_ellipse_radius(this.cellSize, radius, this.orientation, .05)
        const bodyCenterX = centerX - this.orientationShift.x * radius / 3;
        const bodyCenterY = centerY - this.orientationShift.y * radius / 3;

        /** HEAD */
        ctx.fillStyle = convertToHSL(gs.agent.colors.limbs);
        const headRadius = this.cellSize * gs.agent.size.head_radius;
        ctx.beginPath();
        ctx.arc(centerX + this.orientationShift.x * radius,
            centerY + this.orientationShift.y * radius,
            headRadius, 0, Math.PI * 2)
        ctx.fill();

        /** FLIPPERS */
        const flipperRadius = this.cellSize * gs.agent.size.flipper_radius;
        const flipperArc = 1.1; // arc angle in radians
        const flipperTilt = .3; // arc angle in radians
        const angleOffset = { 'L': 1, 'U': -.5, 'R': 0, 'D': +.5 }[this.orientation]

        // FRONT LEFT FLIPPER
        ctx.beginPath();
        ctx.arc(bodyCenterX - 0.2 * bodyRadiusX * this.orientationShift.x + compute_limb_offset(radius, this.orientation, 'front_left', .5).x,
            bodyCenterY - 0.2 * bodyRadiusX * this.orientationShift.y + compute_limb_offset(radius, this.orientation, 'front_left', .5).y,
            flipperRadius,
            Math.PI * (flipperTilt + flipperArc + angleOffset),
            Math.PI * (flipperTilt + angleOffset));
        ctx.fill();

        // FRONT RIGHT FLIPPER
        ctx.beginPath();
        ctx.arc(bodyCenterX - 0.2 * bodyRadiusX * this.orientationShift.x + compute_limb_offset(radius, this.orientation, 'front_right', .5).x,
            bodyCenterY - 0.2 * bodyRadiusX * this.orientationShift.y + compute_limb_offset(radius, this.orientation, 'front_right', .5).y,
            flipperRadius,
            Math.PI * (-flipperTilt + angleOffset),
            Math.PI * (-flipperTilt - flipperArc + angleOffset));
        ctx.fill();

        // BACK LEFT FLIPPER
        ctx.beginPath();
        ctx.arc(bodyCenterX - 0.2 * bodyRadiusX * this.orientationShift.x + compute_limb_offset(radius * .8, this.orientation, 'back_left', .7).x,
            bodyCenterY - 0.2 * bodyRadiusX * this.orientationShift.y + compute_limb_offset(radius * .8, this.orientation, 'back_left', .7).y,
            flipperRadius * .8,
            Math.PI * (flipperTilt + flipperArc + angleOffset),
            Math.PI * (flipperTilt + angleOffset));
        ctx.fill();

        // BACK RIGHT FLIPPER
        ctx.beginPath();
        ctx.arc(bodyCenterX - 0.2 * bodyRadiusX * this.orientationShift.x + compute_limb_offset(radius * .8, this.orientation, 'back_right', .7).x,
            bodyCenterY - 0.2 * bodyRadiusX * this.orientationShift.y + compute_limb_offset(radius * .8, this.orientation, 'back_right', .7).y,
            flipperRadius * .8,
            Math.PI * (-flipperTilt + angleOffset),
            Math.PI * (-flipperTilt - flipperArc + angleOffset));
        ctx.fill();

        /** Body */
        ctx.fillStyle = convertToHSL(this.color);
        ctx.beginPath();
        ctx.ellipse(bodyCenterX, bodyCenterY,
            bodyRadiusX, bodyRadiusY, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    look(direction) {
        this.orientation = direction;
        this.orientationShift = gs.direction_to_vec[this.orientation];
    }

    // TODO: animate movement
    bump(direction) {
        const startTime = performance.now();
        const bumpDuration = gs.agent.animations.bump.duration;
        const bumpAmplitude = gs.agent.animations.bump.amplitude * this.cellSize;
        const bumpSpeed = gs.agent.animations.bump.speed;

        const bump = () => {
            const elapsedTime = performance.now() - startTime;
            const progress = elapsedTime / bumpDuration;

            if (progress < 1) {
                this.offset.x = gs.direction_to_vec[direction].x * bumpAmplitude * Math.sin(progress * bumpSpeed * Math.PI / 2);
                this.offset.y = gs.direction_to_vec[direction].y * bumpAmplitude * Math.sin(progress * bumpSpeed * Math.PI / 2);
                requestAnimationFrame(bump)
            } else {
                this.offset = { x: 0, y: 0 };
            }
        }
        requestAnimationFrame(bump)
    }
    destroy() {
        this.ctx = null;
    }
}
