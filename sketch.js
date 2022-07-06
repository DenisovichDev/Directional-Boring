// Horizontal Directional Drilling Simulation
// https://thecodingtrain.com/challenges/172-directional-boring
// from The Coding Train (https://thecodingtrain.com/)
// Inspired by Practical Engineering (https://practical.engineering/)
// CT video: https://youtu.be/FfCBNL6lWK0
// Practical Engineering Video: https://youtu.be/JAhdb7dKQpU

// Play the simulator: https://codingtrain.github.io/Directional-Boring/

// Vectors for current position and direction
let pos, dir;
// Bias of current drill (up or down, 1 or -1)
let bias;
// All the points along the drill path so far
let path;
// Current state of game
let state;
// The turning radius to be computed
let turnCircleRadius;

// Groundcolor is used to determine win or lose state
const groundColor = [11, 106, 136];
const groundLevel = 100;
// Position of the goal square box (relative to ground)
const goal = { x: 540, w: 20 };
const goalColor = [252, 238, 33];


// Pixel map for scene
let hddScene;

// Button to start
let startButton;

// Reset the initial state
function startDrill() {
  pos = createVector(10, 100);
  dir = p5.Vector.fromAngle(PI / 6);
  path = [];
  bias = 1;
  state = 'PAUSED';
  startButton.html('start');

  // Draw a new scene
  hddScene.background(45, 197, 244);
  hddScene.noStroke();
  hddScene.rectMode(CORNER);
  hddScene.fill(groundColor);
  hddScene.rect(0, groundLevel, width, height - groundLevel);
  hddScene.fill(248, 158, 79);
  hddScene.arc(width / 2, groundLevel, width / 2, width / 6, 0, PI);
  for (let i = 0; i < 10; i++) {
    let r = random(8, 36);
    let x = random(0, width);
    let y = random(groundLevel + 50, height - 50);
    hddScene.fill(240, 99, 164);
    hddScene.circle(x, y, r * 2);
  }
  hddScene.fill(45, 197, 244);
  hddScene.noStroke();
  hddScene.rect(0, 0, width, groundLevel);

  // Add the goal
  hddScene.fill(goalColor);
  hddScene.rect(goal.x, groundLevel - goal.w, goal.w + 4, goal.w + 4);
}

function setup() {
  // Let's begin!
  createCanvas(600, 400);

  // Handle the start and stop button
  startButton = createButton('start').mousePressed(function () {
    if (state == 'PAUSED') {
      state = 'DRILLING';
      this.html('pause');
    } else if (state == 'DRILLING') {
      state = 'PAUSED';
      this.html('start');
    } else if (state == 'WIN' || state == 'LOSE') {
      startDrill();
    }
  });

  // Handle the toggle bias button
  createButton('toggle bias').mousePressed(function () {
    bias *= -1;
  });

  // A slider for adding some randomness (in %)
  createSpan('randomness: ');
  randomSlider = createSlider(0, 100, 0, 0.5);

  // Draw the scene
  hddScene = createGraphics(width, height);
  startDrill();
}

// One drill step
function drill() {
  // Angle the drill turns per step
  const angle = 0.01;
  // Related circle size
  const turnCircleLen = PI * 2 / angle;
  turnCircleRadius = turnCircleLen / PI / 2;

  dir.rotate(angle * bias);

  // Add some randomness
  const randomFactor = randomSlider.value();
  const r = random(-randomFactor, 0) * angle * bias / 100;
  dir.rotate(r);

  // Save previous position
  path.push(pos.copy());
  pos.add(dir);

  // Get pixel color under drill
  const c = hddScene.get(pos.x, pos.y);

  // Green you win!
  if (c[0] == goalColor[0] && c[1] == goalColor[1] && c[2] == goalColor[2]) {
    state = 'WIN';
    startButton.html('try again');
    // Anything else not the ground color you lose!
  } else if (
    c[0] != groundColor[0] ||
    c[1] !== groundColor[1] ||
    c[2] !== groundColor[2]
  ) {
    state = 'LOSE';
    startButton.html('try again');
  }
}

// Draw loop
function draw() {
  // Dril!
  if (state == 'DRILLING') drill();

  // Draw the scene
  image(hddScene, 0, 0);

  // Draw the path
  beginShape();
  noFill();
  stroke(255);
  strokeWeight(4);
  for (let v of path) {
    vertex(v.x, v.y);
  }
  endShape();

  // Draw something where drill starts
  fill(255, 0, 0);
  stroke(0);
  strokeWeight(4);
  circle(10, groundLevel, 4);
  
  // Start of the aiming arcs 
  push();
  translate(pos.x, pos.y);
  rotate(dir.heading());

  // Draw the aiming lines
  stroke(125);
  strokeWeight(1);  
  noFill();
  const maxAimAngle = QUARTER_PI * 1.2;
  arc(0, -turnCircleRadius, turnCircleRadius * 2, turnCircleRadius * 2, HALF_PI - maxAimAngle, HALF_PI, OPEN);
  arc(0,  turnCircleRadius, turnCircleRadius * 2, turnCircleRadius * 2, -HALF_PI, -HALF_PI + maxAimAngle, OPEN);
  pop();

  // Draw the drill bit
  push();
  stroke(252, 238, 33);
  strokeWeight(8);
  translate(pos.x, pos.y);
  rotate(dir.heading() + (PI / 6) * bias);
  line(0, 0, 10, 0);
  pop();

  // If you've lost!
  if (state == 'LOSE') {
    background(255, 0, 0, 150);
    textAlign(CENTER, CENTER);
    noStroke();
    fill(255);
    textSize(96);
    textFont('courier-bold');
    text('YOU LOSE', width / 2, height / 2);
    // If you've won!
  } else if (state == 'WIN') {
    background(0, 255, 0, 150);
    textAlign(CENTER, CENTER);
    noStroke();
    fill(255);
    textSize(96);
    textFont('courier-bold');
    text('YOU WIN', width / 2, height / 2);
    textSize(24);
    // Starting idea for a score
    text(`pipe length: ${path.length}`, width / 2, height / 2 + 96);
  }
}
