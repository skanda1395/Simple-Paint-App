const mouse = {
  x: 0,
  y: 0,
};
let firstX;
let firstY;

let selected = false;
let isDrawing = false;
let isMouseDown = false;

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
let width = 800,
  height = 500;

canvas.width = width;
canvas.height = height;
canvas.style.backgroundColor = "lightcyan";
ctx.lineWidth = 2;

function randomColour(instance) {
  let rVal = () => Math.ceil(Math.random() * 255);
  if (gradient.checked) {
    let width = instance.lastX - instance.firstX;
    let height = instance.lastY - instance.firstY;

    let lingrad = ctx.createLinearGradient(
      instance.firstX,
      instance.firstY,
      instance.firstX + width,
      instance.firstY + height
    );
    lingrad.addColorStop(0, colourStop1.value);
    lingrad.addColorStop(1, colourStop2.value);
    return lingrad;
  }

  // return `rgb(${rVal()}, ${rVal()}, ${rVal()})`;
  return mainColour.value;
}

class Triangle {
  constructor(x1, y1, x2, y2, colour) {
    this.firstX = x1;
    this.firstY = y1;
    this.lastX = x2;
    this.lastY = y2;
    this.colour = colour || null;
  }
  draw() {
    let midX = (this.firstX + this.lastX) / 2;

    ctx.beginPath();
    ctx.moveTo(this.firstX, this.lastY);
    ctx.lineTo(midX, this.firstY);
    ctx.lineTo(this.lastX, this.lastY);
    ctx.fillStyle = this.colour;
    ctx.fill();
  }
  getVertices() {
    let midX = (this.firstX + this.lastX) / 2;
    let vertices = {
      p1: [this.firstX, this.lastY],
      p2: [midX, this.firstY],
      p3: [this.lastX, this.lastY],
    };
    return vertices;
  }
  highlight() {
    let midX = (this.firstX + this.lastX) / 2;

    ctx.beginPath();
    ctx.moveTo(this.firstX, this.lastY);
    ctx.lineTo(midX, this.firstY);
    ctx.lineTo(this.lastX, this.lastY);
    ctx.closePath();
    ctx.stroke();
  }
}

function isCursorInTriangle(triangle) {
  let area = (x1, y1, x2, y2, x3, y3) =>
    Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2);
  let vertices = triangle.getVertices();

  let A = area(...vertices.p1, ...vertices.p2, ...vertices.p3);
  let A1 = area(mouse.x, mouse.y, ...vertices.p2, ...vertices.p3);
  let A2 = area(...vertices.p1, mouse.x, mouse.y, ...vertices.p3);
  let A3 = area(...vertices.p1, ...vertices.p2, mouse.x, mouse.y);

  return A == A1 + A2 + A3;
}

let triangles = [];

setInterval(function () {
  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < triangles.length; i++) {
    triangles[i].draw();

    if (isCursorInTriangle(triangles[i])) {
      triangles[i].highlight();
    }
  }

  if (selected) {
    // move the triangle
    let width = selected.lastX - selected.firstX;
    let height = selected.lastY - selected.firstY;

    selected.firstX = mouse.x - width / 2;
    selected.firstY = mouse.y - height / 2;
    selected.lastX = selected.firstX + width;
    selected.lastY = selected.firstY + height;
    selected.colour =
      typeof selected.colour == "string"
        ? selected.colour
        : randomColour(selected);
  }
}, 50);

let count = 0;
let colour;

canvas.onmousemove = function (event) {
  mouse.x = event.pageX;
  mouse.y = event.pageY;

  if (isDrawing && isMouseDown) {
    triangles.splice(count, 1);
    let newTri = new Triangle(firstX, firstY, mouse.x, mouse.y, colour);
    colour = typeof colour == "string" ? colour : randomColour(newTri);
    newTri.colour = colour;
    triangles.push(newTri);
  }
};

canvas.onmousedown = function (event) {
  isMouseDown = true;
  if (!selected) {
    for (let i = 0; i < triangles.length; i++) {
      if (isCursorInTriangle(triangles[i])) {
        selected = triangles[i];
      }
    }
  }
  if (!selected) {
    isDrawing = true;
  }
  firstX = event.offsetX;
  firstY = event.offsetY;
};

canvas.onmouseup = function (event) {
  let width = mouse.x - firstX;
  let height = mouse.y - firstY;

  if (!selected && isDrawing && width * height > 100) {
    console.log("drawing over");
    count++;
    console.log("no of triangles: ", count);
  }
  selected = false;
  isDrawing = false;
  isMouseDown = false;
  colour = null;
};

canvas.addEventListener("mouseout", () => {
  isDrawing = false;
  selected = false;
  isMouseDown = false;
});

canvas.addEventListener("dblclick", (event) => {
  for (let i = 0; i < triangles.length; i++) {
    if (isCursorInTriangle(triangles[i])) {
      triangles.splice(i, 1);
    }
  }
});

// clear the canvas
const clearBtn = document.querySelector("#clear");
clearBtn.addEventListener("click", () => {
  clearBtn.disabled = true;
  count = 0;
  let brk = 150;
  let intervalID = setInterval(() => triangles.pop(), brk);
  setTimeout(() => {
    clearBtn.disabled = false;
    clearInterval(intervalID);
  }, triangles.length * brk);
});

// Gradient Check
const gradient = document.querySelector("#gradient");
gradient.addEventListener("change", () => {
  colourStop1.style.display = gradient.checked ? "inline-block" : "none";
  colourStop2.style.display = gradient.checked ? "inline-block" : "none";
  mainColour.style.display = !gradient.checked ? "inline-block" : "none";
});

// Gradient Colour Stops
const colourStop1 = document.querySelector("#colourStop1");
const colourStop2 = document.querySelector("#colourStop2");

// Main Colour
const mainColour = document.querySelector("#colour");
