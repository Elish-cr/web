// The treatment list works as tabs, and the caliper opens to the chosen one. Without this script every treatment is listed in order.
const choice = document.querySelector("[data-choice]");
if (choice) {
  const tabs = [...choice.querySelectorAll(".strip")];
  const panels = tabs.map((t) => document.querySelector(t.getAttribute("href")));
  const rail = choice.querySelector(".rail");
  rail.setAttribute("role", "tablist");
  rail.setAttribute("aria-orientation", "vertical");
  rail.querySelectorAll("li").forEach((li) => li.setAttribute("role", "presentation"));
  const gauge = makeGauge(choice.querySelector("[data-gauge]"));
  const show = (i, focus) => {
    tabs.forEach((t, k) => {
      const on = k === i;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      panels[k].hidden = !on;
    });
    gauge(i);
    if (focus) tabs[i].focus({ preventScroll: true });
  };
  tabs.forEach((t, i) => {
    t.setAttribute("role", "tab");
    t.setAttribute("aria-controls", panels[i].id);
    panels[i].setAttribute("role", "tabpanel");
    panels[i].setAttribute("aria-labelledby", t.id);
    t.addEventListener("click", (e) => {
      e.preventDefault();
      show(i);
      // On a narrow screen the photograph is below the list, so it is brought into view.
      if (matchMedia("(max-width: 60rem)").matches) panels[i].querySelector(".panel-photo").scrollIntoView({ block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
    t.addEventListener("keydown", (e) => {
      const n = tabs.length;
      // Right to left: the left arrow moves forward.
      const to = { ArrowDown: (i + 1) % n, ArrowUp: (i - 1 + n) % n, ArrowLeft: (i + 1) % n, ArrowRight: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
      if (e.key === " ") { e.preventDefault(); show(i); }
      if (to !== undefined) { e.preventDefault(); show(to, true); }
    });
  });
  const linked = panels.findIndex((p) => "#" + p.id === location.hash);
  // The caliper opens to the first treatment when the list comes into view, so the movement is seen.
  const first = linked < 0 ? 0 : linked;
  show(first);
  gauge.rest();
  whenSeen(choice.querySelector(".gauge"), () => gauge(panels.findIndex((p) => !p.hidden)));
}

// The air behind the hero: domain-warped noise that drifts for nine seconds, then rests.
// Reduced motion gets one still frame; without WebGL the paper and its grain remain.
const canvas = document.querySelector(".air");
const gl = canvas && canvas.getContext("webgl", { antialias: false, powerPreference: "low-power" });
if (gl) {
  const shader = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}"));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, `precision mediump float;uniform vec2 r;uniform float t;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
    float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*n(p);p=p*2.03+7.;a*=.5;}return s;}
    void main(){vec2 u=gl_FragCoord.xy/r.y;vec2 q=u*1.1+vec2(0.,-t*.07);
      vec2 w=vec2(fbm(q+vec2(0.,t*.05)),fbm(q+vec2(5.2,1.3)));
      float v=fbm(q*vec2(1.5,.7)+w*1.9);
      vec3 paper=vec3(.871,.843,.803),veil=vec3(.905,.768,.706),lit=vec3(.955,.940,.915);
      vec3 c=mix(paper,veil,smoothstep(.5,.85,v)*.55);c=mix(c,lit,smoothstep(.5,.2,v)*.8);
      gl_FragColor=vec4(pow(c,vec3(1./1.35)),1.);}`));
  gl.linkProgram(prog);
  if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(prog, "r"), uT = gl.getUniformLocation(prog, "t");
    const REST = 9;
    const draw = (s) => {
      canvas.width = Math.max(1, canvas.clientWidth >> 1);
      canvas.height = Math.max(1, canvas.clientHeight >> 1);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.uniform1f(uT, 4 + s);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    // Eases to a stop: fast at first, still at nine seconds.
    const eased = (x) => REST * (1 - Math.pow(1 - x, 2));
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let resting = still;
    draw(still ? REST : 0);
    canvas.classList.add("is-drawn");
    if (!still) {
      const start = performance.now();
      const tick = (now) => {
        const x = Math.min(1, (now - start) / (REST * 1000));
        draw(eased(x));
        if (x < 1) requestAnimationFrame(tick); else resting = true;
      };
      requestAnimationFrame(tick);
    }
    addEventListener("resize", () => { if (resting) draw(REST); });
  }
}

// Runs once, the first time the element is on screen.
function whenSeen(el, run) {
  if (!("IntersectionObserver" in window)) return run();
  const eye = new IntersectionObserver((found) => {
    if (!found.some((f) => f.isIntersecting)) return;
    eye.disconnect();
    run();
  }, { threshold: 0.35 });
  eye.observe(el);
}

// The gauge lies on its side: one tip at the top of the list, the other at the chosen row.
function makeGauge(svg) {
  if (!svg) return Object.assign(() => {}, { rest() {} });
  const G1 = 0.236, G2 = 0.382, X0 = 359, Y0 = 2;
  const bars = Object.fromEntries([...svg.querySelectorAll("[data-bar]")].map((g) => [g.dataset.bar, g]));
  const rows = [...document.querySelectorAll(".strip")];
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let now = 96.75, chosen = 0, frame = 0;
  const unit = () => svg.getBoundingClientRect().height / 452 || 1;
  // The span that brings the moving tip to the middle of a row, in drawing units.
  const reach = (i) => {
    const r = rows[i].getBoundingClientRect();
    return (r.top + r.height / 2 - svg.getBoundingClientRect().top) / unit() - Y0;
  };
  const pose = (span) => {
    // The legs shorten on a phone so the tool stays inside its column.
    const leg = Math.max(238, Math.min(330, svg.parentNode.clientWidth / unit() - 16));
    const half = span / 2, c = Math.sqrt(leg * leg - half * half), a = Math.asin(half / leg) * 180 / Math.PI;
    const put = (name, u, v, rot) => bars[name].setAttribute("transform", `translate(${(X0 - (1 - u - v) * c).toFixed(1)} ${(Y0 + (v - u + 1) * half).toFixed(1)}) rotate(${rot.toFixed(2)}) scale(${(leg / 880).toFixed(4)})`);
    put("right", 0, 0, a - 90);
    put("link", G2, 0, a - 90);
    put("needle", 0, G1, -90 - a);
    put("eye", 0, G2, -90 - a);
    put("left", 0, 0, -90 - a);
    now = span;
  };
  addEventListener("resize", () => pose(reach(chosen)));
  return Object.assign((i) => {
    chosen = i;
    const from = now, to = reach(i);
    cancelAnimationFrame(frame);
    if (calm) return pose(to);
    let begin = 0;
    const step = (time) => {
      begin = begin || time;
      const x = Math.min(1, (time - begin) / 720);
      pose(from + (to - from) * (1 - Math.pow(1 - x, 4)));
      if (x < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  }, { rest() { if (calm) return; cancelAnimationFrame(frame); pose(26); } });
}

// On the home page the caliper opens three times and stays open; elsewhere it opens once. Its bars are parallelograms, so the four tips stay in golden section as it moves.
const caliper = document.querySelector("[data-caliper]");
if (caliper && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const LEG = 880, G1 = 0.236, G2 = 0.382, FROM = 5, TO = 24.4, MS = 1500, HOLD = 700, SHUT = 1100, LOOP = MS + HOLD + SHUT;
  let left = caliper.closest(".hero") ? 3 : 1;
  const bars = Object.fromEntries([...caliper.querySelectorAll("[data-bar]")].map((g) => [g.dataset.bar, g]));
  const marks = caliper.querySelector("[data-marks]");
  const pose = (deg) => {
    const s = Math.sin(deg * Math.PI / 180) * LEG, c = Math.cos(deg * Math.PI / 180) * LEG;
    // u runs along the left leg, v along the right leg; the tips always rest on the line at 900.
    const at = (u, v) => [400 + (v - u) * s, 900 - c + (u + v) * c];
    const put = (name, p, rot) => bars[name].setAttribute("transform", `translate(${p[0].toFixed(1)} ${p[1].toFixed(1)}) rotate(${rot.toFixed(2)})`);
    put("right", at(0, 0), -deg);
    put("link", at(G2, 0), -deg);
    put("needle", at(0, G1), deg);
    put("eye", at(0, G2), deg);
    put("left", at(0, 0), deg);
    marks.setAttribute("d", [[1, 0], [1 - G1, G1], [1 - G2, G2], [0, 1]].map(([u, v]) => `M${at(u, v)[0].toFixed(1)} 900v18`).join(""));
  };
  pose(FROM);
  caliper.classList.add("is-ready");
  let begin = 0;
  const open = (now) => {
    begin = begin || now;
    const t = now - begin, x = Math.min(1, t / MS), back = Math.min(1, Math.max(0, (t - MS - HOLD) / SHUT));
    // Opens quickly and settles; closes slowly at both ends.
    pose(FROM + (TO - FROM) * (1 - Math.pow(1 - x, 4)) * (left > 1 ? 1 - back * back * (3 - 2 * back) : 1));
    if (left > 1 && t >= LOOP) { left--; begin = now; }
    else if (left < 2 && x === 1) return;
    requestAnimationFrame(open);
  };
  // Waits for the page's fonts so the opening is seen, but never longer than a second.
  Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1000))]).then(() => setTimeout(() => whenSeen(caliper, () => requestAnimationFrame(open)), 350));
}

// The browser shows no focus ring on an embedded map, so it is marked by hand while it has the focus.
const map = document.querySelector(".contact-map iframe");
if (map) {
  const mark = () => map.classList.toggle("is-focused", document.activeElement === map);
  addEventListener("blur", () => setTimeout(mark));
  addEventListener("focus", mark);
  document.addEventListener("focusin", mark);
}
