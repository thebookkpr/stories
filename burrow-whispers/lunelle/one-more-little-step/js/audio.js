/* One More Little Step — audio.js V1.2
   V1.2: crickets slowed down further
   V1.1
   V1.1: crickets made much softer, lower and rarer (the old ones sounded like beeps)
   Part 1 of 1 (JavaScript Part 5)
   Gentle night sounds made live with the Web Audio API (no sound files):
   wind, water, crickets and soft chimes, mixed differently per scene,
   plus small chime sounds for discoveries and petals.
   Browsers only allow sound after a tap, so the first tap anywhere starts it.
   Load before game.js. Sound.toggle() turns sound on/off (remembered). */

const Sound = (() => {
  const KEY = "omls-sound-v1";
  const MASTER = 0.55;
  const SCALE = [587.33, 659.25, 739.99, 880, 987.77, 1174.66, 1318.51]; /* D pentatonic-ish, soft */
  const rand = (a, b) => a + Math.random() * (b - a);

  /* Layer levels per scene (0 to 1). "title" is the menu. */
  const MIX = {
    title:          { wind: 0.2,  water: 0.3, crickets: 0.15, chimes: 0.35 },
    pond:           { wind: 0.25, water: 0.6, crickets: 0.25, chimes: 0.5 },
    "silver-light": { wind: 0.45, water: 0,   crickets: 0.3,  chimes: 0.5 },
    clearing:       { wind: 0.3,  water: 0,   crickets: 0.35, chimes: 0.6 },
    moth:           { wind: 0.3,  water: 0,   crickets: 0.25, chimes: 0.7 },
    hilltop:        { wind: 0.7,  water: 0,   crickets: 0.2,  chimes: 0.5 }
  };

  let on = true;
  try { on = localStorage.getItem(KEY) !== "off"; } catch (e) {}

  let ctx = null, master, echo, sfx, noiseBuf;
  const layers = {};
  const level = { wind: 0, water: 0, crickets: 0, chimes: 0 };
  let wanted = "title";

  const running = () => ctx && ctx.state === "running" && on;

  /* ---------- Build the sound world (once, after the first tap) ---------- */
  function build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    /* soft echo, gives chimes a gentle shimmer */
    echo = ctx.createGain();
    const dl = ctx.createDelay(1), fb = ctx.createGain(), lp = ctx.createBiquadFilter();
    dl.delayTime.value = 0.37; fb.gain.value = 0.38;
    lp.type = "lowpass"; lp.frequency.value = 2600;
    echo.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(master);

    sfx = ctx.createGain();                      /* discovery sounds, not part of the scene mix */
    sfx.connect(master);

    Object.keys(level).forEach(n => {
      layers[n] = ctx.createGain();
      layers[n].gain.value = 0;
      layers[n].connect(master);
    });

    /* brown noise: the base for wind and water */
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      d[i] = last * 3.5;
    }

    /* wind: filtered noise that slowly swells */
    const wind = noise(), wf = ctx.createBiquadFilter(), wg = ctx.createGain();
    wf.type = "bandpass"; wf.frequency.value = 350; wf.Q.value = 0.7; wg.gain.value = 0.5;
    wind.connect(wf); wf.connect(wg); wg.connect(layers.wind);
    lfo(0.07, 0.35, wg.gain);
    lfo(0.05, 150, wf.frequency);

    /* water: soft babble that breathes */
    const water = noise(), wbp = ctx.createBiquadFilter(), wag = ctx.createGain();
    wbp.type = "bandpass"; wbp.frequency.value = 700; wbp.Q.value = 0.5; wag.gain.value = 0.5;
    water.connect(wbp); wbp.connect(wag); wag.connect(layers.water);
    lfo(0.3, 0.15, wag.gain);

    /* little living sounds, each on its own relaxed timer */
    [2700, 3000].forEach((f, i) => setTimeout(() => cricketLoop(f), i * 1800));
    plinkLoop();
    chimeLoop();
    return true;
  }

  function noise() {
    const s = ctx.createBufferSource();
    s.buffer = noiseBuf; s.loop = true;
    s.start(0, Math.random() * 3);
    return s;
  }

  function lfo(hz, depth, param) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = hz; g.gain.value = depth;
    o.connect(g); g.connect(param); o.start();
  }

  /* ---------- Ambient voices ---------- */
  function cricketLoop(f) {
    if (running() && level.crickets > 0.02) {
      const t0 = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = f * rand(0.98, 1.02);
      g.gain.value = 0;
      o.connect(g); g.connect(layers.crickets);
      for (let k = 0; k < 4; k++) {                 /* soft, rounded pulses */
        const t = t0 + k * 0.1;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.025, t + 0.03);
        g.gain.linearRampToValueAtTime(0, t + 0.09);
      }
      o.start(t0); o.stop(t0 + 0.5);
    }
    setTimeout(() => cricketLoop(f), rand(6000, 12000));
  }

  function plinkLoop() {
    if (running() && level.water > 0.02) {
      const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(rand(500, 1100), t);
      o.frequency.exponentialRampToValueAtTime(rand(250, 450), t + 0.25);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.07, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      o.connect(g); g.connect(layers.water); g.connect(echo);
      o.start(t); o.stop(t + 0.35);
    }
    setTimeout(plinkLoop, rand(2500, 7000));
  }

  function chimeLoop() {
    if (running() && level.chimes > 0.02) {
      bell(SCALE[Math.floor(Math.random() * SCALE.length)], 0.07, 0, layers.chimes);
      if (Math.random() < 0.3)
        bell(SCALE[Math.floor(Math.random() * SCALE.length)], 0.05, 0.4, layers.chimes);
    }
    setTimeout(chimeLoop, rand(8000, 18000));
  }

  /* One soft bell note: sine plus a faint overtone, long gentle decay */
  function bell(freq, vol, delay, out) {
    const t = ctx.currentTime + delay, g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);
    [[freq, 1], [freq * 2.01, 0.25]].forEach(([f, a]) => {
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.frequency.value = f; og.gain.value = a;
      o.connect(og); og.connect(g);
      o.start(t); o.stop(t + 3);
    });
    g.connect(out || sfx);
    const send = ctx.createGain();
    send.gain.value = 0.5;
    g.connect(send); send.connect(echo);
  }

  /* ---------- Mix control ---------- */
  function apply() {
    if (!ctx) return;
    const mix = MIX[wanted] || MIX.title, now = ctx.currentTime;
    Object.keys(level).forEach(n => {
      level[n] = mix[n] || 0;
      layers[n].gain.cancelScheduledValues(now);
      layers[n].gain.setTargetAtTime(level[n], now, 0.8);   /* about a 2-second crossfade */
    });
    master.gain.cancelScheduledValues(now);
    master.gain.setTargetAtTime(on ? MASTER : 0, now, on ? 1.2 : 0.3);
  }

  function unlock() {
    if (!ctx && !build()) return;
    if (ctx.state !== "running" && on) ctx.resume();
    apply();
  }
  ["pointerdown", "touchend", "keydown"].forEach(ev =>
    document.addEventListener(ev, () => { if (!ctx || ctx.state !== "running") unlock(); }, { passive: true }));

  /* Save battery: pause when the app is hidden */
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else if (on) ctx.resume();
  });

  /* ---------- Public ---------- */
  function scene(key) { wanted = key; apply(); }

  function discover(kind) {
    if (!running()) return;
    const n = kind === "wonder" ? [1174.66, 1567.98] : kind === "listen" ? [739.99, 987.77] : [880, 1174.66];
    bell(n[0] * rand(0.99, 1.01), 0.16, 0);
    bell(n[1] * rand(0.99, 1.01), 0.1, 0.14);
  }

  function petal() {
    if (!running()) return;
    [587.33, 739.99, 880, 1174.66, 1480].forEach((f, i) => bell(f, 0.13, i * 0.12));
  }

  function ready() {                              /* courage meter just filled */
    if (!running()) return;
    [587.33, 739.99, 880].forEach(f => bell(f, 0.1, 0));
  }

  function toggle() {
    on = !on;
    try { localStorage.setItem(KEY, on ? "on" : "off"); } catch (e) {}
    if (on) unlock(); else apply();
    return on;
  }

  return { scene, discover, petal, ready, toggle, isOn: () => on, unlock };
})();
                                   
