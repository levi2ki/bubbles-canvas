import { v4 } from "uuid";

function pseudoRHEX() {
  return `#${Math.ceil(255 * Math.random()).toString(16)}${Math.ceil(
    255 * Math.random()
  ).toString(16)}${Math.ceil(255 * Math.random()).toString(16)}`;
}

/**
 * @abstract
 */
class AbstractDrawer {
  constructor(ctx) {
    this.ctx = ctx;
    this.$$e = new Error("ENOTIMPLEMENTED");
  }

  draw() {
    throw this.$$e;
  }
}

/**
 * @typedef {Object} contextConfig
 * @prop {HTMLCanvasElement} canvasElement cavnas ref.
 * @prop {CanvasRenderingContext2D} ctx canvas rendering context.
 * @prop {number} [width=300] canvas width.
 * @prop {number} [height=300] canvas height.
 */

/**
 * Function calculates context config for canvas elements.
 * @function getContextConfig
 * @arg {string} elementId id attribute of HTMLCanvasElement.
 * @arg {number} [width=300] canvas width.
 * @arg {number} [height=300] canvas height.
 * @returns {contextConfig}
 */
function getContextConfig(elementId, width = 300, height = 300) {
  const canvasElement = document.getElementById(elementId);
  if (!canvasElement) throw new Error("no proper canvas element");
  const ctx = canvasElement.getContext("2d");

  return {
    canvasElement,
    ctx,
    width,
    height
  };
}

/**
 * @class Canvas
 */
class Canvas extends AbstractDrawer {
  /**
   * @constructor
   * @arg {contextConfig} contextConfig
   */
  constructor(contextConfig) {
    super(contextConfig.ctx);
    this.canvasElement = contextConfig.canvasElement;
    this.heap = {};
    this.queue = [];
    this.canvasElement.width = contextConfig.width;
    this.canvasElement.height = contextConfig.height;

    this.$$remove = this.$$remove.bind(this);
    this.draw = this.draw.bind(this);
    this.loop = this.loop.bind(this);
  }

  add(instance) {
    const id = v4();
    this.heap[id] = instance;
    this.queue.push(id);
    return () => this.$$remove(id);
  }
  $$remove(id) {
    delete this.heap[id];
    this.queue = this.queue.filter(idx => idx !== id);
  }

  draw() {
    this.queue.forEach(id => {
      this.heap[id].draw();
    });
  }

  loop() {
    requestAnimationFrame(() => {
      this.ctx.clearRect(
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      );
      this.draw();
      requestAnimationFrame(this.loop);
    });
  }
}

/**
 * @class Practicle
 */
class Practicle extends AbstractDrawer {
  /**
   * @constructor
   * @arg {contextConfig} contextConfig
   */
  constructor(contextConfig) {
    super(contextConfig.ctx);
    this.canvasElement = contextConfig.canvasElement;
    this.$$establish();

    this.draw.bind(this);
  }

  $$establish() {
    this.x = this.canvasElement.width * Math.random();
    this.y = 0; //ctx.height * Math.random();
    this.radius = Math.max(40 * Math.random(), 11);
    this.frequency = Math.max(12 * Math.random(), 2);
    this.speed = this.frequency * 0.1;
    this.fallSpeed = Math.max(8 * Math.random(), 2);
    this.amplitude = "positive";
    this.median = this.x;
    this.fillStyle = pseudoRHEX();
  }

  draw() {
    const { ctx } = this;
    ctx.beginPath();
    ctx.fillStyle = this.fillStyle;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = "#ffffff6f";
    ctx.arc(
      this.x - this.radius * 0.42,
      this.y - this.radius * 0.35,
      this.radius * 0.15,
      0,
      Math.PI * 2
    );
    ctx.closePath();
    ctx.fill("evenodd");
    if (this.x > this.median + this.frequency) {
      this.x -= this.speed;
      this.amplitude = "positive";
    } else if (this.x < this.median - this.frequency) {
      this.x += this.speed;
      this.amplitude = "negative";
    } else {
      this.x =
        this.amplitude === "positive"
          ? this.x - this.speed
          : this.x + this.speed;
    }
    this.y += this.fallSpeed;
    if (this.y >= this.canvasElement.height) {
      this.$$establish();
    }
  }
}

const contextConfig = getContextConfig(
  "app",
  window.innerWidth,
  window.innerHeight
);

const cnv = new Canvas(contextConfig);
for (let i = 0; i < 100; i++) {
  cnv.add(new Practicle(contextConfig));
}
cnv.loop();
