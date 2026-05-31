document.addEventListener('DOMContentLoaded', () => {
    
    const cursorGlow = document.getElementById('cursor-glow');
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.querySelector('.progress-container');
    const progressCount = document.getElementById('progress-count');
    const progressState = document.getElementById('progress-state');
    const liveStatus = document.getElementById('live-status');
    const ambientTitle = document.getElementById('ambient-title');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    
    let poppedCount = 0;
    const GOAL_COUNT = 10;
    const PETAL_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
    const progressStates = [
        "đang chờ ánh sáng đầu tiên",
        "một chút nắng đã ghé qua",
        "vườn hoa đang sáng dần",
        "lời chúc đang gần hơn"
    ];

    function updateProgressUI() {
        const pct = (poppedCount / GOAL_COUNT) * 100;
        const remaining = Math.max(GOAL_COUNT - poppedCount, 0);
        progressBar.style.width = `${pct}%`;
        progressContainer?.setAttribute('aria-valuenow', String(poppedCount));
        progressContainer?.classList.toggle('is-complete', poppedCount >= GOAL_COUNT);

        if (progressCount) {
            progressCount.textContent = `${poppedCount}/${GOAL_COUNT} bông hoa`;
        }

        if (progressState) {
            if (poppedCount >= GOAL_COUNT) {
                progressState.textContent = "lời chúc đã sẵn sàng";
            } else if (poppedCount === 0) {
                progressState.textContent = progressStates[0];
            } else {
                const stateIndex = Math.min(Math.ceil((poppedCount / GOAL_COUNT) * (progressStates.length - 1)), progressStates.length - 1);
                progressState.textContent = remaining === 1 ? "còn 1 bông nữa thôi" : progressStates[stateIndex];
            }
        }

        if (liveStatus) {
            liveStatus.textContent = poppedCount >= GOAL_COUNT
                ? "Đã thu thập đủ hoa. Lời chúc cuối cùng đang mở ra."
                : `Đã thu thập ${poppedCount} trên ${GOAL_COUNT} bông hoa.`;
        }
    }
    
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    
    function renderCursor() {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        if(cursorGlow) {
            cursorGlow.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
        }
        requestAnimationFrame(renderCursor);
    }
    if (prefersReducedMotion) {
        cursorGlow?.remove();
    } else {
        renderCursor();
    }

    
    const canvas = document.getElementById('main-canvas');
    const ctx = canvas.getContext('2d');
    
    let stars = [];
    let shootingStars = [];
    let nebulas = [];
    let particles = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        buildStars();
        buildNebulas();
    }
    window.addEventListener('resize', resizeCanvas);

    function buildNebulas() {
        nebulas = [
            { 
                x: canvas.width * 0.15, 
                y: canvas.height * 0.25, 
                r: Math.max(canvas.width, canvas.height) * 0.38, 
                color: 'rgba(109, 191, 103, 0.05)' 
            }, 
            { 
                x: canvas.width * 0.85, 
                y: canvas.height * 0.2, 
                r: Math.max(canvas.width, canvas.height) * 0.45, 
                color: 'rgba(253, 216, 53, 0.04)'  
            },  
            { 
                x: canvas.width * 0.5, 
                y: canvas.height * 0.75, 
                r: Math.max(canvas.width, canvas.height) * 0.32, 
                color: 'rgba(46, 125, 50, 0.03)'   
            }
        ];
    }

    function buildStars() {
        stars = [];
        const count = Math.floor((canvas.width * canvas.height) / 1800);
        for (let i = 0; i < count; i++) {
            const randColor = Math.random();
            let baseColor;
            if (randColor < 0.5) {
                baseColor = '253, 216, 53'; 
            } else if (randColor < 0.85) {
                baseColor = '184, 221, 176'; 
            } else {
                baseColor = '255, 255, 255'; 
            }
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.5 + 0.3,
                speed: Math.random() * 0.004 + 0.001,
                phase: Math.random() * Math.PI * 2,
                isTwinkle: Math.random() < 0.22,
                color: baseColor
            });
        }
    }

    function triggerShootingStar() {
        if (shootingStars.length >= 3) return;
        shootingStars.push({
            x: Math.random() * canvas.width * 0.6 + canvas.width * 0.3,
            y: Math.random() * canvas.height * 0.2,
            len: Math.random() * 90 + 40,
            speedX: -(Math.random() * 4 + 3),
            speedY: Math.random() * 2.5 + 2,
            opacity: 1.0,
            fadeSpeed: Math.random() * 0.012 + 0.006,
            width: Math.random() * 1.5 + 0.9
        });
    }

    
    if (!prefersReducedMotion) {
        setInterval(() => {
            if (Math.random() < 0.55) {
                triggerShootingStar();
            }
        }, 2800);
    }

    
    function createExplosion(x, y) {
        if (prefersReducedMotion) return;
        const particleCount = 8 + Math.floor(Math.random() * 6);
        const colors = ['253, 216, 53', '109, 191, 103', '245, 255, 245', '255, 255, 255'];
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3.4 + 1.4;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1, 
                r: Math.random() * 2.2 + 0.8,
                alpha: 1,
                decay: Math.random() * 0.035 + 0.025,
                color: colors[Math.floor(Math.random() * colors.length)],
                isSparkle: Math.random() < 0.25 
            });
        }

        if (particles.length > 90) {
            particles.splice(0, particles.length - 90);
        }
    }

    
    function animateCanvas(timestamp) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        
        for (const neb of nebulas) {
            const grad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.r);
            grad.addColorStop(0, neb.color);
            grad.addColorStop(0.5, neb.color.replace(/[\d.]+\)$/, '0.02)'));
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(neb.x, neb.y, neb.r, 0, Math.PI * 2);
            ctx.fill();
        }

        
        for (const s of stars) {
            const a = 0.15 + 0.85 * Math.abs(Math.sin(s.phase + timestamp * s.speed));
            if (s.isTwinkle && a > 0.78) {
                
                ctx.strokeStyle = `rgba(${s.color}, ${a * 0.4})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(s.x - s.r * 4.5, s.y);
                ctx.lineTo(s.x + s.r * 4.5, s.y);
                ctx.moveTo(s.x, s.y - s.r * 4.5);
                ctx.lineTo(s.x, s.y + s.r * 4.5);
                ctx.stroke();
            }
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${s.color}, ${a})`;
            ctx.fill();
        }

        
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const ss = shootingStars[i];
            const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.speedX * 3.5, ss.y - ss.speedY * 3.5);
            grad.addColorStop(0, `rgba(253, 216, 53, ${ss.opacity})`);
            grad.addColorStop(0.5, `rgba(184, 221, 176, ${ss.opacity * 0.6})`);
            grad.addColorStop(1, `rgba(184, 221, 176, 0)`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = ss.width;
            ctx.beginPath();
            ctx.moveTo(ss.x, ss.y);
            ctx.lineTo(ss.x + ss.speedX * 3.5, ss.y + ss.speedY * 3.5);
            ctx.stroke();

            ss.x += ss.speedX;
            ss.y += ss.speedY;
            ss.opacity -= ss.fadeSpeed;
            if (ss.opacity <= 0 || ss.x < -100 || ss.y > canvas.height + 100) {
                shootingStars.splice(i, 1);
            }
        }

        
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.08; 
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.beginPath();
            if (p.isSparkle) {
                
                const r = p.r;
                ctx.moveTo(p.x, p.y - r * 2.2);
                ctx.quadraticCurveTo(p.x, p.y, p.x + r * 2.2, p.y);
                ctx.quadraticCurveTo(p.x, p.y, p.x, p.y + r * 2.2);
                ctx.quadraticCurveTo(p.x, p.y, p.x - r * 2.2, p.y);
                ctx.quadraticCurveTo(p.x, p.y, p.x, p.y - r * 2.2);
            } else {
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            }
            ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
            
            
            ctx.shadowBlur = p.isSparkle ? 3 : 0;
            ctx.shadowColor = `rgba(${p.color}, ${p.alpha})`;
            ctx.fill();
            ctx.shadowBlur = 0; 
        }

        requestAnimationFrame(animateCanvas);
    }

    
    resizeCanvas();
    requestAnimationFrame(animateCanvas);

    
    const bubblesContainer = document.getElementById('bubbles-container');
    const floatTextsContainer = document.getElementById('floating-texts-container');
    const wishes = [
        "Chúc cậu ngày 1/6 vui vẻ",
        "Hãy luôn nở nụ cười trên môi",
        "Công việc và học tập sẽ phát triển tốt",
        "Có mệt thì nghỉ một chút",
        "May mắn sẽ luôn ở bên cậu",
        "Luôn tràn ngập năng lượng tích cực",
        "Hãy cứ tuyệt vời như vậy nhé",
        "Bình yên sẽ tìm đến cậu",
        "Luôn luôn tự tin và rạng ngời nhé",
        "Hãy luôn là chính mình"
    ];
    let bubbles = [];
    let wishIndex = 0; 

    
    function spawnBubble(startNearTop = false) {
        if (bubbles.length > 18) return; 
        
        const size = 55 + Math.random() * 45;
        const x = Math.random() * (window.innerWidth - size);
        const y = startNearTop
            ? window.innerHeight * (0.42 + Math.random() * 0.42)
            : window.innerHeight + size + 24; 
        
        const bubbleEl = document.createElement('div');
        const isSunflower = true; 
        bubbleEl.setAttribute('role', 'button');
        bubbleEl.setAttribute('tabindex', '0');
        bubbleEl.setAttribute('aria-label', 'Thu thập một bông hướng dương');
        
        
        const innerEl = document.createElement('div');
        
        if (isSunflower) {
            bubbleEl.className = 'bubble type-sunflower';
            innerEl.className = 'bubble-inner bubble-sunflower';
            const hue = 42 + Math.floor(Math.random() * 16);
            const petalColor = `hsl(${hue}, 92%, 60%)`;
            PETAL_ANGLES.forEach(angle => {
                const petal = document.createElement('div');
                petal.classList.add('fp');
                petal.style.background = `linear-gradient(180deg, hsl(${hue+10}, 98%, 80%), ${petalColor})`;
                petal.style.transform = `rotate(${angle}deg)`;
                innerEl.appendChild(petal);
            });
            const center = document.createElement('div');
            center.classList.add('fc');
            innerEl.appendChild(center);
        } else {
            bubbleEl.className = 'bubble type-matcha';
            innerEl.className = 'bubble-inner bubble-matcha';
            const straw = document.createElement('div');
            straw.classList.add('mc-straw');
            innerEl.appendChild(straw);
            const lid = document.createElement('div');
            lid.classList.add('mc-lid');
            innerEl.appendChild(lid);
            
            const body = document.createElement('div');
            body.className = 'mc-body';
            
            
            const strawInside = document.createElement('div');
            strawInside.className = 'mc-straw-inside';
            body.appendChild(strawInside);
            
            const glare = document.createElement('div');
            glare.className = 'mc-glare';
            body.appendChild(glare);
            
            const matcha = document.createElement('div');
            matcha.className = 'mc-matcha';
            
            for (let i = 0; i < 3; i++) {
                const ice = document.createElement('div');
                ice.className = 'mc-ice';
                matcha.appendChild(ice);
            }
            body.appendChild(matcha);

            const milk = document.createElement('div');
            milk.className = 'mc-milk';
            body.appendChild(milk);
            
            const logo = document.createElement('div');
            logo.className = 'mc-logo';
            body.appendChild(logo);
            
            innerEl.appendChild(body);
        }

        bubbleEl.appendChild(innerEl);
        
        
        const baseWidth = isSunflower ? 60 : 50;
        const scale = size / baseWidth;
        
        bubbleEl.style.left = '0px';
        bubbleEl.style.top = '0px';
        
        bubblesContainer.appendChild(bubbleEl);
        
        const bubbleObj = {
            el: bubbleEl,
            x: x,
            y: y,
            size: size,
            scale: scale,
            vy: -(Math.random() * 1.65 + 1.15), 
            vx: (Math.random() - 0.5) * 0.3,
            baseX: x,
            angle: Math.random() * 360, 
            spinSpeed: (Math.random() - 0.5) * 0.3, 
            popped: false
        };
        
        bubbles.push(bubbleObj);
        
        
        
        const popHandler = (e) => {
            e.stopPropagation();
            e.preventDefault();
            popBubble(bubbleObj);
        };
        
        bubbleEl.addEventListener('pointerdown', popHandler);
        bubbleEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                popHandler(e);
            }
        });
    }

    
    function popBubble(bObj) {
        if (bObj.popped) return;
        bObj.popped = true;

        const index = bubbles.indexOf(bObj);
        if (index > -1) {
            bubbles.splice(index, 1);
        }
        bObj.el.style.pointerEvents = 'none';
        bObj.el.setAttribute('aria-hidden', 'true');
        bObj.el.classList.add('is-collected');
        setTimeout(() => bObj.el.remove(), prefersReducedMotion ? 0 : 140);
        
        
        const centerX = bObj.x + bObj.size / 2;
        const centerY = bObj.y + bObj.size / 2;
        createExplosion(centerX, centerY);

        
        const wish = wishes[wishIndex % wishes.length];
        wishIndex++;
        const textEl = document.createElement('div');
        textEl.className = 'float-text';
        textEl.textContent = wish;
        textEl.style.left = `${centerX}px`;
        textEl.style.top = `${centerY}px`;
        textEl.style.transform = `translate(-50%, -50%)`;
        floatTextsContainer.appendChild(textEl);
        
        setTimeout(() => textEl.remove(), prefersReducedMotion ? 400 : 1600);

        
        if (poppedCount < GOAL_COUNT) {
            poppedCount++;
            updateProgressUI();
            
            
            if (poppedCount >= GOAL_COUNT) {
                ambientTitle.textContent = "Lời chúc cuối cùng đang mở ra";
                setTimeout(openModal, prefersReducedMotion ? 80 : 800);
            }
        }
    }

    
    function updateBubbles() {
        for (let i = bubbles.length - 1; i >= 0; i--) {
            let b = bubbles[i];
            b.y += b.vy;
            
            
            b.x = b.baseX + Math.sin(b.y * 0.008) * 35;
            
            
            b.angle += b.spinSpeed;

            
            b.el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) scale(${b.scale}) rotate(${b.angle}deg)`;

            
            if (b.y < -b.size - 60 || b.x < -b.size - 120 || b.x > window.innerWidth + 120) {
                b.el.remove();
                bubbles.splice(i, 1);
            }
        }
        requestAnimationFrame(updateBubbles);
    }
    updateBubbles();
    
    
    setInterval(() => spawnBubble(false), prefersReducedMotion ? 950 : 560);

    
    const flowersContainer = document.getElementById('flowers-container');
    let isCelebrationActive = false;
    let celebrationIntervals = [];

    function spawnCelebrationFlower() {
        if (!flowersContainer || !isCelebrationActive) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'fall-flower';
        wrapper.style.left = `${Math.random() * 100}vw`;
        
        const scale = 0.45 + Math.random() * 0.8;
        wrapper.style.transform = `scale(${scale})`;
        
        const duration = 4.5 + Math.random() * 6;
        wrapper.style.animationDuration = `${duration}s`;
        
        const drift = (Math.random() - 0.5) * 180;
        wrapper.style.setProperty('--drift', `${drift}px`);
        
        const hue = 42 + Math.floor(Math.random() * 16);
        const petalColor = `hsl(${hue}, 92%, 60%)`;
        
        PETAL_ANGLES.forEach(angle => {
            const petal = document.createElement('div');
            petal.className = 'fp';
            petal.style.background = `linear-gradient(180deg, hsl(${hue+10}, 98%, 80%), ${petalColor})`;
            petal.style.transform = `rotate(${angle}deg)`;
            wrapper.appendChild(petal);
        });
        const center = document.createElement('div');
        center.className = 'fc';
        wrapper.appendChild(center);
        
        flowersContainer.appendChild(wrapper);
        wrapper.addEventListener('animationend', () => wrapper.remove());
    }

    
    function spawnCelebrationCup() {
        if (!flowersContainer || !isCelebrationActive) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'fall-cup';
        wrapper.style.left = `${Math.random() * 100}vw`;
        
        const scale = 0.35 + Math.random() * 0.55;
        wrapper.style.transform = `scale(${scale})`;
        
        const duration = 5.5 + Math.random() * 7;
        wrapper.style.animationDuration = `${duration}s`;
        
        const drift = (Math.random() - 0.5) * 150;
        wrapper.style.setProperty('--drift', `${drift}px`);
        
        const straw = document.createElement('div');
        straw.className = 'mc-straw';
        wrapper.appendChild(straw);
        
        const lid = document.createElement('div');
        lid.className = 'mc-lid';
        wrapper.appendChild(lid);
        
        const body = document.createElement('div');
        body.className = 'mc-body';
        
        
        const strawInside = document.createElement('div');
        strawInside.className = 'mc-straw-inside';
        body.appendChild(strawInside);
        
        const glare = document.createElement('div');
        glare.className = 'mc-glare';
        body.appendChild(glare);
        
        const matcha = document.createElement('div');
        matcha.className = 'mc-matcha';
        for (let i = 0; i < 3; i++) {
            const ice = document.createElement('div');
            ice.className = 'mc-ice';
            matcha.appendChild(ice);
        }
        body.appendChild(matcha);
        
        const milk = document.createElement('div');
        milk.className = 'mc-milk';
        body.appendChild(milk);
        
        const logo = document.createElement('div');
        logo.className = 'mc-logo';
        body.appendChild(logo);
        
        wrapper.appendChild(body);
        
        flowersContainer.appendChild(wrapper);
        wrapper.addEventListener('animationend', () => wrapper.remove());
    }

    function startCelebration() {
        isCelebrationActive = true;
        
        
        for (let i = 0; i < 18; i++) {
            setTimeout(spawnCelebrationFlower, i * 70);
            setTimeout(spawnCelebrationCup, i * 110);
        }
        
        
        const fInterval = setInterval(spawnCelebrationFlower, 280);
        const cInterval = setInterval(spawnCelebrationCup, 480);
        celebrationIntervals.push(fInterval, cInterval);
    }

    function stopCelebration() {
        isCelebrationActive = false;
        celebrationIntervals.forEach(clearInterval);
        celebrationIntervals = [];
        if (flowersContainer) {
            flowersContainer.innerHTML = '';
        }
    }

    
    const modalOverlay = document.getElementById('modal-overlay');
    const modalX = document.getElementById('modal-x');
    const closeBtn = document.getElementById('modal-close-btn');
    const canUsePointerTilt = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let lastFocusedElement = null;

    function openModal() {
        lastFocusedElement = document.activeElement;
        modalOverlay.classList.add('open');
        modalOverlay.setAttribute('aria-hidden', 'false');
        if (!canUsePointerTilt) {
            const card = document.getElementById('modal-card');
            if (card) {
                card.style.transform = '';
            }
        }
        startCelebration();
        closeBtn.focus();
        
        for(let i = 0; i < 10; i++){
            setTimeout(spawnBubble, i * 120);
        }
    }

    function closeModal() {
        modalOverlay.classList.remove('open');
        modalOverlay.setAttribute('aria-hidden', 'true');
        stopCelebration();
        
        
        poppedCount = 0;
        wishIndex = 0; 
        updateProgressUI();
        ambientTitle.textContent = "Thu thập những bông hướng dương nhé";
        lastFocusedElement?.focus?.();
    }

    modalX.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal();
    });

    
    document.addEventListener('mousemove', (e) => {
        if (!canUsePointerTilt) return;
        if (!modalOverlay.classList.contains('open')) return;
        const card = document.getElementById('modal-card');
        const rect = card.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            const cardCenterX = rect.left + rect.width / 2;
            const cardCenterY = rect.top + rect.height / 2;
            
            const percentX = (mouseX - cardCenterX) / (window.innerWidth / 2);
            const percentY = -(mouseY - cardCenterY) / (window.innerHeight / 2);
            
            const maxTilt = 8; 
            const tiltX = maxTilt * percentY;
            const tiltY = maxTilt * percentX;
            
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.01, 1.01, 1.01)`;
        }
    });

    
    document.addEventListener('mouseleave', () => {
        if (!canUsePointerTilt) return;
        const card = document.getElementById('modal-card');
        if (card) {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        }
    });

    
    updateProgressUI();
    for(let i = 0; i < 8; i++){
        setTimeout(() => spawnBubble(true), i * 120);
    }
});
