(function () {
    // Check if browser respects prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    // Check if device supports hover (avoid touch/mobile devices)
    if (window.matchMedia('(hover: none)').matches) {
        return;
    }

    const canvas = document.getElementById('cursor-trail-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Device Pixel Ratio for sharp rendering
    let dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = window.innerHeight;

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Particle class for pooling
    class Particle {
        constructor() {
            this.active = false;
            this.x = 0;
            this.y = 0;
            this.vx = 0;
            this.vy = 0;
            this.radius = 0;
            this.maxLife = 0;
            this.life = 0;
            this.color = '';
        }

        init(x, y, vx, vy, radius, life, color) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.radius = radius;
            this.maxLife = life;
            this.life = life;
            this.color = color;
            this.active = true;
        }

        update(dt) {
            if (!this.active) return;
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.life -= dt;
            if (this.life <= 0) {
                this.active = false;
            }
        }

        draw(context) {
            if (!this.active) return;
            const progress = this.life / this.maxLife;
            const alpha = progress * 0.15; // Low opacity to keep it extremely subtle
            const currentRadius = this.radius * (0.4 + 0.6 * progress); // Shrink over time

            // Create radial gradient for a soft, blurred glow (glass-like)
            const grad = context.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, currentRadius
            );

            if (this.color === 'cyan') {
                grad.addColorStop(0, `rgba(0, 210, 255, ${alpha})`);
                grad.addColorStop(0.5, `rgba(0, 210, 255, ${alpha * 0.4})`);
                grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            } else {
                grad.addColorStop(0, `rgba(58, 123, 213, ${alpha})`);
                grad.addColorStop(0.5, `rgba(58, 123, 213, ${alpha * 0.4})`);
                grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            }

            context.beginPath();
            context.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
            context.fillStyle = grad;
            context.fill();
        }
    }

    // Particle Pool
    const MAX_PARTICLES = 150;
    const pool = [];
    for (let i = 0; i < MAX_PARTICLES; i++) {
        pool.push(new Particle());
    }

    function getFreeParticle() {
        for (let i = 0; i < MAX_PARTICLES; i++) {
            if (!pool[i].active) return pool[i];
        }
        return null;
    }

    // Eased Trail Head
    const mouse = { x: width / 2, y: height / 2 };
    const head = { x: width / 2, y: height / 2 };
    let hasMoved = false;

    // Performance tracking and spawn accumulation
    let lastTime = performance.now();
    let frameCount = 0;
    let fps = 60;
    let fpsIntervalStart = lastTime;
    let spawnFactor = 1.0; // Dynamic multiplier based on performance
    let spawnAccumulator = 0;

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        if (!hasMoved) {
            hasMoved = true;
            canvas.style.opacity = '1';
        }
    });

    function animate(now) {
        requestAnimationFrame(animate);

        let dt = (now - lastTime) / 1000;
        if (dt > 0.1) dt = 0.1; // Cap time step to avoid large jumps on background tab resume
        lastTime = now;

        // Monitor FPS
        frameCount++;
        if (now > fpsIntervalStart + 1000) {
            fps = (frameCount * 1000) / (now - fpsIntervalStart);
            frameCount = 0;
            fpsIntervalStart = now;

            // Dynamically scale spawns if frame rate drops
            if (fps < 55) {
                spawnFactor = Math.max(0.3, spawnFactor - 0.1);
            } else if (fps > 58) {
                spawnFactor = Math.min(1.0, spawnFactor + 0.05);
            }
        }

        ctx.clearRect(0, 0, width, height);

        if (!hasMoved) return;

        // Easing follow-effect (trail head lags behind mouse)
        const prevHeadX = head.x;
        const prevHeadY = head.y;
        head.x += (mouse.x - head.x) * 0.12; // Easing factor
        head.y += (mouse.y - head.y) * 0.12;

        const distance = Math.hypot(head.x - prevHeadX, head.y - prevHeadY);

        // Spawn particles based on distance moved (speed)
        if (distance > 0.1) {
            // Accumulate fractional spawns: 1 particle per 8px of movement
            spawnAccumulator += (distance / 8) * spawnFactor;
            
            // Limit spawning per frame to avoid bursts
            const numSpawns = Math.min(3, Math.floor(spawnAccumulator));
            spawnAccumulator = Math.min(spawnAccumulator - numSpawns, 5);

            for (let i = 0; i < numSpawns; i++) {
                const p = getFreeParticle();
                if (p) {
                    // Interpolate position along the path segment
                    const t = numSpawns > 1 ? i / (numSpawns - 1) : 0.5;
                    const spawnX = prevHeadX + (head.x - prevHeadX) * t;
                    const spawnY = prevHeadY + (head.y - prevHeadY) * t;

                    // Small random drift velocity
                    const vx = (Math.random() - 0.5) * 10;
                    const vy = (Math.random() - 0.5) * 10;

                    // Large, soft, semi-transparent glass particles
                    const radius = 25 + Math.random() * 20;
                    const life = 0.6 + Math.random() * 0.4; // Fade over 0.6 - 1s
                    const color = Math.random() > 0.5 ? 'cyan' : 'blue';

                    p.init(spawnX, spawnY, vx, vy, radius, life, color);
                }
            }
        }

        // Update and draw active particles
        for (let i = 0; i < MAX_PARTICLES; i++) {
            if (pool[i].active) {
                pool[i].update(dt);
                pool[i].draw(ctx);
            }
        }
    }

    requestAnimationFrame(animate);
})();
