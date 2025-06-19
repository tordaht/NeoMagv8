let canvas, ctx;
let running = false;
let bacteria = [];
let fpsCounter = 0;
let lastFps = performance.now();

function init(state) {
  canvas = state.canvas;
  ctx = canvas.getContext('2d');
  const count = state.count || 10000;
  bacteria = [];
  for (let i = 0; i < count; i++) {
    bacteria.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
    });
  }
}

function update() {
  for (const b of bacteria) {
    b.x += b.vx;
    b.y += b.vy;
    if (b.x < 0 || b.x > canvas.width) b.vx *= -1;
    if (b.y < 0 || b.y > canvas.height) b.vy *= -1;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#4ade80';
  for (const b of bacteria) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function loop() {
  if (!running) return;
  update();
  draw();
  fpsCounter++;
  const now = performance.now();
  if (now - lastFps > 1000) {
    self.postMessage({ type: 'fps', fps: fpsCounter });
    fpsCounter = 0;
    lastFps = now;
  }
  requestAnimationFrame(loop);
}

self.onmessage = (e) => {
  const { type, canvas: offscreen, count } = e.data;
  if (type === 'init') {
    init({ canvas: offscreen, count });
  } else if (type === 'start') {
    if (!running) {
      running = true;
      requestAnimationFrame(loop);
    }
  } else if (type === 'stop') {
    running = false;
  }
};
