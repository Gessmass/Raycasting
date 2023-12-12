import map from "./map.js";

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;
const RENDER_DELAY = 30;
const FOV = 60;
let PLAYER_X = 2;
let PLAYER_Y = 2;
let PLAYER_VIEW_DIRECTION = 60;
const RAYCASTING_PRECISION = 64;

const KEY_FORWARD = "z";
const KEY_BACKWARD = "s";
const PLAYER_MOVEMENT_SPEED = 0.5;
const PLAYER_ROTATION_SPEED = 5.0;

const MINIMAP_SCALE = 0.25; // Taille de la minimap par rapport à l'écran
const MINIMAP_CELL_SIZE = MINIMAP_SCALE * RAYCASTING_PRECISION;

const minimapWidth = map.length * MINIMAP_CELL_SIZE;
const minimapHeight = map.length * MINIMAP_CELL_SIZE;
const minimapPosX = SCREEN_WIDTH - minimapWidth;
const minimapPosY = SCREEN_HEIGHT - minimapHeight;

const halfScreenHeight = SCREEN_HEIGHT / 2;
const halfFov = FOV / 2;
let incrementAngle = null;
incrementAngle = FOV / SCREEN_WIDTH;

const screen = document.createElement("canvas");
screen.width = SCREEN_WIDTH;
screen.height = SCREEN_HEIGHT;
screen.style.border = "1px solid black";
document.body.appendChild(screen);

const screenContext = screen.getContext("2d");

const degreeToRadians = (degree) => {
  const pi = Math.PI;
  return (degree * pi) / 180;
};

const drawLines = (x1, y1, x2, y2, color) => {
  screenContext.strokeStyle = color;
  screenContext.beginPath();
  screenContext.moveTo(x1, y1);
  screenContext.lineTo(x2, y2);
  screenContext.stroke();
};

const rayCasting = () => {
  let rayAngle = PLAYER_VIEW_DIRECTION - halfFov; // Pour que la fov de 60 part de -30deg à 30deg

  for (let rayCount = 0; rayCount < SCREEN_WIDTH; rayCount++) {
    let ray = {
      x: PLAYER_X,
      y: PLAYER_Y,
    };
    let rayCos = Math.cos(degreeToRadians(rayAngle)) / RAYCASTING_PRECISION;
    let raySin = Math.sin(degreeToRadians(rayAngle)) / RAYCASTING_PRECISION;

    let wall = 0;

    while (!wall) {
      ray.x += rayCos;
      ray.y += raySin;
      wall = map[Math.floor(ray.y)][Math.floor(ray.x)];
    }

    let distance = Math.sqrt(
      Math.pow(PLAYER_X - ray.x, 2) + Math.pow(PLAYER_Y - ray.y, 2)
    );

    //FishEye fix
    distance =
      distance * Math.cos(degreeToRadians(rayAngle - PLAYER_VIEW_DIRECTION));

    let wallHeight = Math.floor(halfScreenHeight / distance);

    drawLines(rayCount, 0, rayCount, halfScreenHeight - wallHeight, "cyan");
    drawLines(
      rayCount,
      halfScreenHeight - wallHeight,
      rayCount,
      halfScreenHeight + wallHeight,
      "grey"
    );
    drawLines(
      rayCount,
      halfScreenHeight + wallHeight,
      rayCount,
      SCREEN_HEIGHT,
      "green"
    );

    rayAngle += incrementAngle;
  }
};

const clearScreen = () => {
  screenContext.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
};

const renderMinimap = () => {
  map.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        screenContext.fillStyle = "grey";
        screenContext.fillRect(
          minimapPosX + x * MINIMAP_CELL_SIZE,
          minimapPosY + y * MINIMAP_CELL_SIZE,
          MINIMAP_CELL_SIZE,
          MINIMAP_CELL_SIZE
        );
      }
    });
  });

  screenContext.fillStyle = "red";
  screenContext.fillRect(
    minimapPosX + PLAYER_X * MINIMAP_SCALE - 2,
    minimapPosY + PLAYER_Y * MINIMAP_SCALE - 2,
    4,
    4
  );
};

const main = () => {
  setInterval(() => {
    clearScreen();
    rayCasting();
    renderMinimap();
  }, RENDER_DELAY);
};

//Movements//
document.addEventListener("keydown", (e) => {
  if (e.key === KEY_FORWARD) {
    let playerCos =
      Math.cos(degreeToRadians(PLAYER_VIEW_DIRECTION)) * PLAYER_MOVEMENT_SPEED;
    let playerSin =
      Math.sin(degreeToRadians(PLAYER_VIEW_DIRECTION)) * PLAYER_MOVEMENT_SPEED;
    let newX = PLAYER_X + playerCos;
    let newY = PLAYER_Y + playerSin;

    if (map[Math.floor(newY)][Math.floor(newX)] == 0) {
      PLAYER_X = newX;
      PLAYER_Y = newY;
    }
  } else if (e.key === KEY_BACKWARD) {
    let playerCos =
      Math.cos(degreeToRadians(PLAYER_VIEW_DIRECTION)) * PLAYER_MOVEMENT_SPEED;
    let playerSin =
      Math.sin(degreeToRadians(PLAYER_VIEW_DIRECTION)) * PLAYER_MOVEMENT_SPEED;
    let newX = PLAYER_X - playerCos;
    let newY = PLAYER_Y - playerSin;

    if (map[Math.floor(newY)][Math.floor(newX)] == 0) {
      PLAYER_X = newX;
      PLAYER_Y = newY;
    }
  }
});

let isDragging = false;

document.addEventListener("mousedown", () => {
  isDragging = true;
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    PLAYER_VIEW_DIRECTION -= degreeToRadians(e.movementX * 3);
  }
});

main();
