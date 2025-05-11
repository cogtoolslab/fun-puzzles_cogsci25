function UUID() {
  const baseName =
    Math.floor(Math.random() * 10) +
    "" +
    Math.floor(Math.random() * 10) +
    "" +
    Math.floor(Math.random() * 10) +
    "" +
    Math.floor(Math.random() * 10);
  const template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
  const id =
    baseName +
    "-" +
    template.replace(/[xy]/g, function (c) {
      let r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  return id;
}

function randSign() {
  return Math.random() < 0.5 ? -1 : 1
}
function convertToHSL(color) {
  return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
}

// draws a rounded rectangle on the canvas
function drawRoundedRect(ctx, x, y, width, height, radius, fillStyle) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();

  // Set the fill style if provided and fill the rectangle
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
}

function drawBox(ctx, x, y, size, cornerRadius, fillStyle, light_radius, light_borderStyle) {
  // draw rounded square
  ctx.lineWidth = 5;//gs.box.size.lightRadius * gs.box.size.lightBorderWidth * 2;
  ctx.strokeStyle = convertToHSL(gs.box.colors.border);
  drawRoundedRect(
    ctx, x, y,
    size, size, cornerRadius, fillStyle
  )
  ctx.stroke()

  // Draw the light ring
  // ctx.lineWidth = 5;//gs.box.size.lightRadius * gs.box.size.lightBorderWidth;
  // ctx.strokeStyle = light_borderStyle;
  // ctx.beginPath();
  // ctx.arc(x + size / 2, y + size / 2, light_radius, 0, 2 * Math.PI);
  // ctx.stroke()
}

function drawDiamond(ctx, x, y, size, cornerRadius, fillStyle, borderStyle, borderWidth, onGoal) {
  // Save the current context state
  ctx.save();

  // Translate to the center of where we want to draw
  const centerX = x + size / 2;
  const centerY = y + size / 2;

  // Move to center, rotate 45 degrees, move back
  ctx.translate(centerX, centerY);
  ctx.rotate(Math.PI / 4);
  ctx.translate(-centerX, -centerY);

  // Draw the rounded square
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = borderStyle;
  drawRoundedRect(
    ctx, x, y,
    size, size, cornerRadius, fillStyle
  );
  ctx.stroke();

  if (onGoal) {
    // pillbox
    drawRoundedRect(ctx, x + size / 6, y + size / 6,
      size * 0.4, borderWidth,
      cornerRadius / 4, convertToHSL(gs.box.colors.success_shiny))
    // dot
    ctx.fillStyle = convertToHSL(gs.box.colors.success_shiny);
    ctx.fillRect(centerX + size / 6, y + size / 6, size * 0.15, size * 0.15)
  }

  // Restore the context to its original state
  ctx.restore();
}

function compute_ellipse_radius(cellSize, radius, orientation, narrowerPerc) {
  const radiusLong = (orientation === "R" | orientation === "L") ? radius : radius - cellSize * narrowerPerc;
  const radiusShort = (orientation === "U" | orientation === "D") ? radius : radius - cellSize * narrowerPerc;
  return [radiusLong, radiusShort]
}


function compute_limb_offset(radius, orientation, limb, ratio_narrow) {
  const width = (orientation === "U" | orientation === "D") ? radius : radius * ratio_narrow;
  const height = (orientation === "U" | orientation === "D") ? radius * ratio_narrow : radius;

  const orientationVec = gs.direction_to_vec[orientation]

  if (limb == "front_left") {
    return { 'x': width * (orientationVec.x + orientationVec.y), 'y': height * (orientationVec.y - orientationVec.x) }
  } else if (limb == "front_right") {
    return { 'x': width * (orientationVec.x - orientationVec.y), 'y': height * (orientationVec.x + orientationVec.y) }
  } else if (limb == "back_left") {
    return { 'x': width * (orientationVec.y - orientationVec.x), 'y': -height * (orientationVec.x + orientationVec.y) }
  } else if (limb == "back_right") {
    return { 'x': -width * (orientationVec.x + orientationVec.y), 'y': height * (orientationVec.x - orientationVec.y) }
  }
}

// draws a round goal on the canvas
function drawRoundGoal(ctx, x, y, radius, fillStyle, strokeStyle) {
  ctx.lineWidth = radius * gs.goal.size.borderWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fill();
}

// returns a range of values evenly spaced between a start and end value
function makeRangeArr(startValue, stopValue, cardinality) {
  let arr = [];
  const step = (stopValue - startValue) / (cardinality - 1);
  for (let i = 0; i < cardinality; i++) {
    arr.push(startValue + step * i);
  }
  return arr;
}

function findCommonElements(coordsA, coordsB) {
  let commonElements = [];
  coordsA.forEach(function (elem1) {
    coordsB.forEach(function (elem2) {
      if (elem1[0] === elem2[0] && elem1[1] === elem2[1]) {
        commonElements.push(elem1);
      }
    });
  });
  return commonElements;
}

function findStartPosition(states) {
  for (let key in states) {
    if (states[key] === "start") {
      const coords = key.match(/\d+/g); // Extract digits from the key
      return { x: parseInt(coords[0]), y: parseInt(coords[1]) };
    }
  }
  return { x: 0, y: 0 };
}

function forceFullscreen() {
  if (document.fullscreenElement == null) {
    const fullScreen_div = document.createElement("div");
    const fullScreen_text = document.createElement("P");
    const fullScreen_button = document.createElement("button");
    fullScreen_div.id = "fullScreenPrompt";
    fullScreen_text.id = "fullScreenText";
    fullScreen_button.id = "fullScreenButton";
    fullScreen_text.textContent =
      "Please click the button to enter fullscreen.";
    fullScreen_button.textContent = "Enter fullscreen";

    fullScreen_button.onclick = function () {
      fullScreen_div.remove();
      document.documentElement.requestFullscreen();
    };

    $("body").append(fullScreen_div);
    fullScreen_div.appendChild(fullScreen_button);
    fullScreen_div.appendChild(fullScreen_text);
  }
}

function isValidMove(x, y, gridWidth, gridHeight, walls, visited) {
  return (
    x >= 0 &&
    x < gridWidth &&
    y >= 0 &&
    y < gridHeight &&
    !walls.some((wall) => wall.x === x && wall.y === y) &&
    !visited[y][x]
  );
}
