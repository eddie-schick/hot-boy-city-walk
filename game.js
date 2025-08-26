// Hot Boy City Walks - Game Engine
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game state
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameState = 'loading'; // loading, playing, gameOver, levelComplete
        
        // Physics
        this.gravity = 0.5;
        this.friction = 0.8;
        
        // Input handling
        this.keys = {};
        this.setupInput();
        
        // Detect touch-capable device
        this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        
        // Game objects
        this.player = new Player(100, 300, this);
        this.platforms = [];
        this.collectibles = [];
        this.enemies = [];
        
        // Load images first, then start game
        this.images = {};
        this.loadImages();
        
        // Start loading screen loop
        this.loadingLoop();
    }
    
    setupInput() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Touch controls
        this.setupTouchControls();

        // Tap/click to restart on game over or victory
        if (this.canvas) {
            this.canvas.addEventListener('pointerdown', (e) => {
                if (this.gameState === 'gameOver' || this.gameState === 'victory') {
                    e.preventDefault();
                    this.restart();
                }
            });
            this.canvas.addEventListener('click', (e) => {
                if (this.gameState === 'gameOver' || this.gameState === 'victory') {
                    e.preventDefault();
                    this.restart();
                }
            });
        }
    }
    
    setupTouchControls() {
        const leftButton = document.getElementById('leftButton');
        const rightButton = document.getElementById('rightButton');
        const jumpButton = document.getElementById('jumpButton');
        const controlsToggle = document.getElementById('controlsToggle');
        const touchControlsWrapper = document.getElementById('touchControls');

        // Prevent default touch behaviors ONLY on the game canvas and control wrapper,
        // so we don't block touches on other UI like the desktop toggle button.
        const preventTouchDefault = (el) => {
            if (!el) return;
            el.addEventListener('touchstart', (e) => { e.preventDefault(); }, { passive: false });
            el.addEventListener('touchmove', (e) => { e.preventDefault(); }, { passive: false });
        };
        preventTouchDefault(this.canvas);
        preventTouchDefault(touchControlsWrapper);
        
        // Left button
        if (leftButton) {
            leftButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys['ArrowLeft'] = true;
                leftButton.classList.add('pressed');
            });
            
            leftButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys['ArrowLeft'] = false;
                leftButton.classList.remove('pressed');
            });
            
            leftButton.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.keys['ArrowLeft'] = false;
                leftButton.classList.remove('pressed');
            });

            // Desktop pointer/mouse
            leftButton.addEventListener('pointerdown', () => {
                if (window.innerWidth >= 769) {
                    this.keys['ArrowLeft'] = true;
                    leftButton.classList.add('pressed');
                }
            });
            leftButton.addEventListener('pointerup', () => {
                if (window.innerWidth >= 769) {
                    this.keys['ArrowLeft'] = false;
                    leftButton.classList.remove('pressed');
                }
            });
            leftButton.addEventListener('pointerleave', () => {
                if (window.innerWidth >= 769) {
                    this.keys['ArrowLeft'] = false;
                    leftButton.classList.remove('pressed');
                }
            });
        }
        
        // Right button
        if (rightButton) {
            rightButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys['ArrowRight'] = true;
                rightButton.classList.add('pressed');
            });
            
            rightButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys['ArrowRight'] = false;
                rightButton.classList.remove('pressed');
            });
            
            rightButton.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.keys['ArrowRight'] = false;
                rightButton.classList.remove('pressed');
            });

            // Desktop pointer/mouse
            rightButton.addEventListener('pointerdown', () => {
                if (window.innerWidth >= 769) {
                    this.keys['ArrowRight'] = true;
                    rightButton.classList.add('pressed');
                }
            });
            rightButton.addEventListener('pointerup', () => {
                if (window.innerWidth >= 769) {
                    this.keys['ArrowRight'] = false;
                    rightButton.classList.remove('pressed');
                }
            });
            rightButton.addEventListener('pointerleave', () => {
                if (window.innerWidth >= 769) {
                    this.keys['ArrowRight'] = false;
                    rightButton.classList.remove('pressed');
                }
            });
        }
        
        // Jump button
        if (jumpButton) {
            jumpButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys['Space'] = true;
                jumpButton.classList.add('pressed');
            });
            
            jumpButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys['Space'] = false;
                jumpButton.classList.remove('pressed');
            });
            
            jumpButton.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.keys['Space'] = false;
                jumpButton.classList.remove('pressed');
            });

            // Desktop pointer/mouse
            jumpButton.addEventListener('pointerdown', () => {
                if (window.innerWidth >= 769) {
                    this.keys['Space'] = true;
                    jumpButton.classList.add('pressed');
                }
            });
            jumpButton.addEventListener('pointerup', () => {
                if (window.innerWidth >= 769) {
                    this.keys['Space'] = false;
                    jumpButton.classList.remove('pressed');
                }
            });
            jumpButton.addEventListener('pointerleave', () => {
                if (window.innerWidth >= 769) {
                    this.keys['Space'] = false;
                    jumpButton.classList.remove('pressed');
                }
            });
        }
        
        // Desktop toggle logic for on-screen controls
        if (controlsToggle && touchControlsWrapper) {
            const applyDesktopVisibility = () => {
                const isDesktop = window.innerWidth >= 769;
                if (!isDesktop) {
                    // Mobile: controls always visible, toggle hidden
                    touchControlsWrapper.classList.remove('desktop-visible');
                    controlsToggle.setAttribute('aria-pressed', 'false');
                    controlsToggle.textContent = 'Show Controls';
                }
            };
            applyDesktopVisibility();

            const toggleControls = () => {
                if (window.innerWidth < 769) return; // No-op on mobile layout
                const visible = touchControlsWrapper.classList.toggle('desktop-visible');
                controlsToggle.setAttribute('aria-pressed', visible ? 'true' : 'false');
                controlsToggle.textContent = visible ? 'Hide Controls' : 'Show Controls';
            };

            // Unified interaction handler to avoid duplicate toggles on mobile (touch + click)
            let toggleLock = false;
            const onTogglePress = (e) => {
                e.preventDefault();
                if (typeof e.stopPropagation === 'function') e.stopPropagation();
                if (toggleLock) return;
                toggleLock = true;
                toggleControls();
                // Release lock on next tick
                setTimeout(() => { toggleLock = false; }, 0);
            };
            if (window.PointerEvent) {
                controlsToggle.addEventListener('pointerup', onTogglePress, { passive: false });
            } else {
                controlsToggle.addEventListener('touchstart', onTogglePress, { passive: false });
                controlsToggle.addEventListener('click', onTogglePress);
            }

            window.addEventListener('resize', applyDesktopVisibility);
            window.addEventListener('orientationchange', applyDesktopVisibility);
        }

        // Canvas scaling for mobile
        this.setupCanvasScaling();
    }
    
    setupCanvasScaling() {
        const resizeCanvas = () => {
            const canvas = this.canvas;
            const touchControlsWrapper = document.getElementById('touchControls');
            
            const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
            const isMobile = (window.innerWidth <= 768) || isCoarse;
            const isLandscape = (window.matchMedia && window.matchMedia('(orientation: landscape)').matches);
            const availableWidth = window.innerWidth;
            let availableHeight = window.innerHeight;
            
            if (isMobile && isLandscape) {
                // Reserve space for controls area below the canvas only in landscape
                const controlsStyles = getComputedStyle(document.documentElement);
                const controlsHeightVar = controlsStyles.getPropertyValue('--controls-height').trim();
                // Parse e.g., "140px"
                const controlsHeight = controlsHeightVar.endsWith('px') ? parseFloat(controlsHeightVar) : 140;
                // If controls are displayed below, reduce available canvas height
                availableHeight = Math.max(200, availableHeight - controlsHeight);
            }
            
            const scaleX = availableWidth / 800;
            const scaleY = availableHeight / 400;
            const scale = Math.min(scaleX, scaleY);
            
            canvas.style.width = (800 * scale) + 'px';
            canvas.style.height = (400 * scale) + 'px';
        };
        
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('orientationchange', () => {
            setTimeout(resizeCanvas, 100);
        });
        
        // Initial resize
        resizeCanvas();
    }
    
    loadImages() {
        this.images = {
            kodaIdle: new Image(),
            kodaRunning: new Image(),
            kodaJumping: new Image(),
            spoonbridgeBg: new Image(),
            firstAvenueBg: new Image(),
            stoneArchBg: new Image(),
            millCityBg: new Image(),
            foshayTowerBg: new Image(),
            stAnthonyFallsBg: new Image(),
            guthrieTheaterBg: new Image(),
            maryTylerMooreBg: new Image(),
            chainOfLakesBg: new Image(),
            skywaySystemBg: new Image(),
            loaded: false
        };
        
        // Add cache busting to ensure latest images are loaded
        const timestamp = Date.now();
        this.images.kodaIdle.src = 'koda_transparent_idle.png?' + timestamp;
        this.images.kodaRunning.src = 'koda_transparent_running.png?' + timestamp;
        this.images.kodaJumping.src = 'koda_transparent_jumping.png?' + timestamp;
        this.images.spoonbridgeBg.src = 'spoonbridge_level_bg.png?' + timestamp;
        this.images.firstAvenueBg.src = 'first_avenue_level_bg.png?' + timestamp;
        this.images.stoneArchBg.src = 'stone_arch_bridge_bg.png?' + timestamp;
        this.images.millCityBg.src = 'mill_city_ruins_bg.png?' + timestamp;
        this.images.foshayTowerBg.src = 'foshay_tower_bg.png?' + timestamp;
        this.images.stAnthonyFallsBg.src = 'st_anthony_falls_bg.png?' + timestamp;
        this.images.guthrieTheaterBg.src = 'guthrie_theater_bg.png?' + timestamp;
        this.images.maryTylerMooreBg.src = 'mary_tyler_moore_bg.png?' + timestamp;
        this.images.chainOfLakesBg.src = 'chain_of_lakes_bg.png?' + timestamp;
        this.images.skywaySystemBg.src = 'skyway_system_bg.png?' + timestamp;
        
        let loadedCount = 0;
        const totalImages = 13;
        
        const onImageLoad = () => {
            loadedCount++;
            if (loadedCount === totalImages) {
                this.images.loaded = true;
                this.gameState = 'playing';
                this.initLevel();
                this.gameLoop();
            }
        };
        
        const onImageError = (e) => {
            console.warn('Failed to load image:', e.target.src);
            onImageLoad(); // Continue anyway
        };
        
        this.images.kodaIdle.onload = onImageLoad;
        this.images.kodaRunning.onload = onImageLoad;
        this.images.kodaJumping.onload = onImageLoad;
        this.images.spoonbridgeBg.onload = onImageLoad;
        this.images.firstAvenueBg.onload = onImageLoad;
        this.images.stoneArchBg.onload = onImageLoad;
        this.images.millCityBg.onload = onImageLoad;
        this.images.foshayTowerBg.onload = onImageLoad;
        this.images.stAnthonyFallsBg.onload = onImageLoad;
        this.images.guthrieTheaterBg.onload = onImageLoad;
        this.images.maryTylerMooreBg.onload = onImageLoad;
        this.images.chainOfLakesBg.onload = onImageLoad;
        this.images.skywaySystemBg.onload = onImageLoad;
        
        // Add error handlers
        this.images.kodaIdle.onerror = onImageError;
        this.images.kodaRunning.onerror = onImageError;
        this.images.kodaJumping.onerror = onImageError;
        this.images.spoonbridgeBg.onerror = onImageError;
        this.images.firstAvenueBg.onerror = onImageError;
        this.images.stoneArchBg.onerror = onImageError;
        this.images.millCityBg.onerror = onImageError;
        this.images.foshayTowerBg.onerror = onImageError;
        this.images.stAnthonyFallsBg.onerror = onImageError;
        this.images.guthrieTheaterBg.onerror = onImageError;
        this.images.maryTylerMooreBg.onerror = onImageError;
        this.images.chainOfLakesBg.onerror = onImageError;
        this.images.skywaySystemBg.onerror = onImageError;
    }
    
    initLevel() {
        // Clear existing objects
        this.platforms = [];
        this.collectibles = [];
        this.enemies = [];
        
        // Create platforms and objects based on level
        if (this.level === 1) {
            // Level 1: Spoonbridge and Cherry (Minneapolis Sculpture Garden)
            this.currentBackground = 'spoonbridgeBg';
            this.platforms = [
                new Platform(0, 350, 200, 50, '#8B4513'), // Ground
                new Platform(250, 300, 100, 20, '#8B4513'), // Platform
                new Platform(400, 250, 100, 20, '#8B4513'), // Platform
                new Platform(550, 200, 100, 20, '#8B4513'), // Platform
                new Platform(700, 350, 100, 50, '#8B4513'), // End platform
            ];
            
            this.collectibles = [
                new Collectible(300, 270, 'coin'),
                new Collectible(450, 220, 'coin'),
                new Collectible(600, 170, 'coin'),
                new Collectible(750, 320, 'coin'),
            ];
            
            this.enemies = [
                new Enemy(300, 280, 'goomba'),
                new Enemy(500, 180, 'goomba'),
            ];
        } else if (this.level === 2) {
            // Level 2: First Avenue & 7th Street Entry (Music venue)
            this.currentBackground = 'firstAvenueBg';
            this.platforms = [
                new Platform(0, 350, 150, 50, '#333'), // Ground
                new Platform(200, 320, 80, 20, '#333'), // Stage platform
                new Platform(350, 280, 80, 20, '#333'), // Speaker platform
                new Platform(500, 240, 80, 20, '#333'), // Light rig platform
                new Platform(650, 200, 80, 20, '#333'), // Upper stage
                new Platform(750, 350, 50, 50, '#333'), // End platform
            ];
            
            this.collectibles = [
                new Collectible(240, 290, 'coin'),
                new Collectible(390, 250, 'coin'),
                new Collectible(540, 210, 'coin'),
                new Collectible(690, 170, 'coin'),
                new Collectible(770, 320, 'coin'),
            ];
            
            this.enemies = [
                new Enemy(250, 300, 'goomba'),
                new Enemy(450, 220, 'goomba'),
                new Enemy(600, 180, 'goomba'),
            ];
        } else if (this.level === 3) {
            // Level 3: Stone Arch Bridge (FIXED - proper platform spacing)
            this.currentBackground = 'stoneArchBg';
            this.platforms = [
                new Platform(0, 350, 120, 50, '#888'), // Starting ground
                new Platform(150, 320, 80, 20, '#888'), // Arch 1
                new Platform(280, 300, 80, 20, '#888'), // Arch 2
                new Platform(410, 280, 80, 20, '#888'), // Arch 3
                new Platform(540, 300, 80, 20, '#888'), // Arch 4
                new Platform(670, 320, 80, 20, '#888'), // Arch 5
                new Platform(750, 350, 50, 50, '#888'), // End platform
            ];
            
            this.collectibles = [
                new Collectible(190, 290, 'coin'),
                new Collectible(320, 270, 'coin'),
                new Collectible(450, 250, 'coin'),
                new Collectible(580, 270, 'coin'),
                new Collectible(710, 290, 'coin'),
                new Collectible(770, 320, 'coin'),
            ];
            
            this.enemies = [
                new Enemy(200, 300, 'goomba'),
                new Enemy(450, 260, 'goomba'),
                new Enemy(650, 300, 'goomba'),
            ];
        } else if (this.level === 4) {
            // Level 4: Mill City Ruins and Park (Industrial heritage) - FIXED PLATFORMS
            this.currentBackground = 'millCityBg';
            this.platforms = [
                new Platform(0, 350, 120, 50, '#654321'), // Extended starting ground
                new Platform(150, 320, 80, 20, '#654321'), // Mill ruins
                new Platform(280, 280, 80, 20, '#654321'), // Conveyor belt
                new Platform(410, 240, 80, 20, '#654321'), // Upper ruins
                new Platform(540, 300, 80, 20, '#654321'), // Mill wheel platform
                new Platform(670, 330, 80, 20, '#654321'), // Debris platform
                new Platform(750, 350, 50, 50, '#654321'), // End platform
            ];
            
            this.collectibles = [
                new Collectible(190, 290, 'coin'),
                new Collectible(320, 250, 'coin'),
                new Collectible(450, 210, 'coin'),
                new Collectible(580, 270, 'coin'),
                new Collectible(710, 300, 'coin'),
                new Collectible(770, 320, 'coin'),
            ];
            
            this.enemies = [
                new Enemy(200, 300, 'goomba'),
                new Enemy(350, 260, 'goomba'),
                new Enemy(590, 280, 'goomba'),
                new Enemy(720, 310, 'goomba'),
            ];
        } else if (this.level === 5) {
            // Level 5: Foshay Tower (Vertical climbing level) - FIXED STARTING PLATFORM
            this.currentBackground = 'foshayTowerBg';
            this.platforms = [
                new Platform(0, 350, 150, 50, '#C0C0C0'), // Extended ground platform
                new Platform(180, 320, 80, 20, '#C0C0C0'), // Floor 1
                new Platform(320, 290, 80, 20, '#C0C0C0'), // Floor 2
                new Platform(180, 260, 80, 20, '#C0C0C0'), // Floor 3
                new Platform(320, 230, 80, 20, '#C0C0C0'), // Floor 4
                new Platform(180, 200, 80, 20, '#C0C0C0'), // Floor 5
                new Platform(450, 180, 120, 20, '#C0C0C0'), // Observation deck
                new Platform(720, 350, 80, 50, '#C0C0C0'), // End platform
            ];
            
            this.collectibles = [
                new Collectible(220, 290, 'coin'),
                new Collectible(360, 260, 'coin'),
                new Collectible(220, 230, 'coin'),
                new Collectible(360, 200, 'coin'),
                new Collectible(220, 170, 'coin'),
                new Collectible(510, 150, 'coin'),
                new Collectible(760, 320, 'coin'),
            ];
            
            this.enemies = [
                new Enemy(230, 300, 'goomba'),
                new Enemy(370, 270, 'goomba'),
                new Enemy(230, 240, 'goomba'),
                new Enemy(520, 160, 'goomba'),
            ];
        } else if (this.level === 6) {
            // Level 6: St. Anthony Falls (Waterfall theme) - FIXED STARTING PLATFORM
            this.currentBackground = 'stAnthonyFallsBg';
            this.platforms = [
                new Platform(0, 350, 150, 50, '#4682B4'), // Extended ground platform
                new Platform(200, 320, 80, 20, '#4682B4'), // Rock ledge 1
                new Platform(350, 280, 80, 20, '#4682B4'), // Rock ledge 2
                new Platform(200, 240, 80, 20, '#4682B4'), // Rock ledge 3
                new Platform(480, 200, 100, 20, '#4682B4'), // Falls platform
                new Platform(620, 260, 80, 20, '#4682B4'), // Rock ledge 4
                new Platform(720, 350, 80, 50, '#4682B4'), // End platform
            ];
            
            this.collectibles = [
                new Collectible(240, 290, 'coin'),
                new Collectible(390, 250, 'coin'),
                new Collectible(240, 210, 'coin'),
                new Collectible(530, 170, 'coin'),
                new Collectible(660, 230, 'coin'),
                new Collectible(760, 320, 'coin'),
            ];
            
            this.enemies = [
                new Enemy(250, 300, 'goomba'),
                new Enemy(400, 260, 'goomba'),
                new Enemy(540, 180, 'goomba'),
                new Enemy(670, 240, 'goomba'),
            ];
        } else if (this.level === 7) {
            // Level 7: Guthrie Theater (Theater theme) - FIXED STARTING PLATFORM
            this.currentBackground = 'guthrieTheaterBg';
            this.platforms = [
                new Platform(0, 350, 120, 50, '#800080'), // Extended ground platform
                new Platform(170, 320, 100, 20, '#800080'), // Stage left
                new Platform(320, 300, 120, 20, '#800080'), // Main stage
                new Platform(480, 280, 100, 20, '#800080'), // Stage right
                new Platform(620, 240, 80, 20, '#800080'), // Upper balcony
                new Platform(720, 350, 80, 50, '#800080'), // End platform
            ];
            
            this.collectibles = [
                new Collectible(220, 290, 'coin'),
                new Collectible(380, 270, 'coin'),
                new Collectible(530, 250, 'coin'),
                new Collectible(660, 210, 'coin'),
                new Collectible(760, 320, 'coin'),
            ];
            
            this.enemies = [
                new Enemy(230, 300, 'goomba'),
                new Enemy(390, 280, 'goomba'),
                new Enemy(540, 260, 'goomba'),
                new Enemy(670, 220, 'goomba'),
            ];
        } else if (this.level === 8) {
            // Level 8: Mary Tyler Moore Statue Area (Downtown) - FIXED STARTING PLATFORM
            this.currentBackground = 'maryTylerMooreBg';
            this.platforms = [
                new Platform(0, 350, 140, 50, '#696969'), // Extended sidewalk
                new Platform(190, 320, 100, 20, '#696969'), // Building step
                new Platform(340, 290, 100, 20, '#696969'), // Storefront
                new Platform(490, 260, 100, 20, '#696969'), // Upper building
                new Platform(640, 300, 80, 20, '#696969'), // Street level
                new Platform(720, 350, 80, 50, '#696969'), // End platform
            ];
            
            this.collectibles = [
                new Collectible(240, 290, 'coin'),
                new Collectible(390, 260, 'coin'),
                new Collectible(540, 230, 'coin'),
                new Collectible(680, 270, 'coin'),
                new Collectible(760, 320, 'coin'),
            ];
            
            this.enemies = [
                new Enemy(250, 300, 'goomba'),
                new Enemy(400, 270, 'goomba'),
                new Enemy(550, 240, 'goomba'),
                new Enemy(690, 280, 'goomba'),
            ];
        } else if (this.level === 9) {
            // Level 9: Chain of Lakes (Nature theme) - FIXED STARTING PLATFORM
            this.currentBackground = 'chainOfLakesBg';
            this.platforms = [
                new Platform(0, 350, 120, 50, '#228B22'), // Extended shore
                new Platform(170, 330, 80, 20, '#228B22'), // Small island
                new Platform(300, 310, 100, 20, '#228B22'), // Dock
                new Platform(450, 290, 80, 20, '#228B22'), // Island 2
                new Platform(580, 270, 100, 20, '#228B22'), // Bridge
                new Platform(720, 350, 80, 50, '#228B22'), // End platform
            ];
            
            this.collectibles = [
                new Collectible(210, 300, 'coin'),
                new Collectible(350, 280, 'coin'),
                new Collectible(490, 260, 'coin'),
                new Collectible(630, 240, 'coin'),
                new Collectible(760, 320, 'coin'),
            ];
            
            this.enemies = [
                new Enemy(220, 310, 'goomba'),
                new Enemy(360, 290, 'goomba'),
                new Enemy(500, 270, 'goomba'),
                new Enemy(640, 250, 'goomba'),
            ];
        } else if (this.level === 10) {
            // Level 10: Minneapolis Skyway System (Final level) - FIXED STARTING PLATFORM
            this.currentBackground = 'skywaySystemBg';
            this.platforms = [
                new Platform(0, 350, 100, 50, '#4169E1'), // Extended ground
                new Platform(150, 320, 80, 20, '#4169E1'), // Skyway 1
                new Platform(280, 290, 80, 20, '#4169E1'), // Skyway 2
                new Platform(410, 260, 80, 20, '#4169E1'), // Skyway 3
                new Platform(540, 230, 80, 20, '#4169E1'), // Skyway 4
                new Platform(670, 200, 80, 20, '#4169E1'), // Skyway 5
                new Platform(720, 350, 80, 50, '#4169E1'), // Victory platform
            ];
            
            this.collectibles = [
                new Collectible(190, 290, 'coin'),
                new Collectible(320, 260, 'coin'),
                new Collectible(450, 230, 'coin'),
                new Collectible(580, 200, 'coin'),
                new Collectible(710, 170, 'coin'),
                new Collectible(760, 320, 'coin'),
            ];
            
            this.enemies = [
                new Enemy(200, 300, 'goomba'),
                new Enemy(330, 270, 'goomba'),
                new Enemy(460, 240, 'goomba'),
                new Enemy(590, 210, 'goomba'),
                new Enemy(720, 180, 'goomba'),
            ];
        } else {
            // Victory screen - completed all 10 levels
            this.gameState = 'victory';
            return;
        }
    }
    
    loadingLoop() {
        // Show loading screen
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '36px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('HOT BOY CITY WALKS', this.width / 2, this.height / 2 - 60);
        this.ctx.fillText('THE ADVENTURES OF KODA', this.width / 2, this.height / 2 - 20);
        
        this.ctx.font = '24px Courier New';
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillText('Loading Minneapolis...', this.width / 2, this.height / 2 + 40);
        
        // Animated loading dots
        const dots = Math.floor(Date.now() / 500) % 4;
        this.ctx.fillText('.'.repeat(dots), this.width / 2 + 120, this.height / 2 + 40);
        
        if (this.gameState === 'loading') {
            requestAnimationFrame(() => this.loadingLoop());
        }
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Update player
        this.player.update(this.keys, this.platforms);
        
        // Update enemies
        this.enemies.forEach(enemy => enemy.update(this.platforms));
        
        // Check collisions
        this.checkCollisions();
        
        // Check if player fell off screen
        if (this.player.y > this.height) {
            this.lives--;
            if (this.lives <= 0) {
                this.gameState = 'gameOver';
            } else {
                this.player.reset(100, 300);
            }
        }
        
        // Check level completion
        if (this.player.x > 750) {
            this.level++;
            this.score += 1000; // Bonus for completing level
            this.player.reset(100, 300);
            this.initLevel();
        }
        
        // Update UI
        this.updateUI();
    }
    
    checkCollisions() {
        // Player vs collectibles
        this.collectibles = this.collectibles.filter(collectible => {
            if (this.player.collidesWith(collectible)) {
                this.score += 100;
                return false; // Remove collectible
            }
            return true;
        });
        
        // Player vs enemies
        this.enemies.forEach(enemy => {
            if (this.player.collidesWith(enemy)) {
                if (this.player.vy > 0 && this.player.y < enemy.y) {
                    // Player jumped on enemy
                    enemy.defeated = true;
                    this.player.vy = -10; // Bounce
                    this.score += 200;
                } else {
                    // Player hit enemy
                    this.lives--;
                    if (this.lives <= 0) {
                        this.gameState = 'gameOver';
                    } else {
                        this.player.reset(100, 300);
                    }
                }
            }
        });
        
        // Remove defeated enemies
        this.enemies = this.enemies.filter(enemy => !enemy.defeated);
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw Minneapolis background if images are loaded
        if (this.images.loaded && this.currentBackground) {
            const bgImage = this.images[this.currentBackground];
            if (bgImage) {
                this.ctx.drawImage(bgImage, 0, 0, this.width, this.height);
            }
        } else {
            // Fallback: Draw clouds if no background loaded
            this.drawClouds();
        }
        
        // Draw platforms
        this.platforms.forEach(platform => platform.draw(this.ctx));
        
        // Draw collectibles
        this.collectibles.forEach(collectible => collectible.draw(this.ctx));
        
        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        
        // Draw player
        this.player.draw(this.ctx);
        
        // Draw game over screen
        if (this.gameState === 'gameOver') {
            this.drawGameOver();
        } else if (this.gameState === 'victory') {
            this.drawVictory();
        }
    }
    
    drawClouds() {
        this.ctx.fillStyle = '#FFF';
        // Simple cloud shapes
        this.ctx.fillRect(100, 50, 60, 30);
        this.ctx.fillRect(110, 40, 40, 20);
        this.ctx.fillRect(300, 70, 80, 40);
        this.ctx.fillRect(310, 60, 60, 20);
        this.ctx.fillRect(600, 45, 70, 35);
        this.ctx.fillRect(610, 35, 50, 25);
    }
    
    drawVictory() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '48px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('VICTORY!', this.width / 2, this.height / 2 - 80);
        
        this.ctx.font = '24px Courier New';
        this.ctx.fillText('Koda conquered all 10 Minneapolis landmarks!', this.width / 2, this.height / 2 - 30);
        this.ctx.fillText('Complete city exploration achieved!', this.width / 2, this.height / 2 + 10);
        
        const restartMsg = this.isTouchDevice ? 'Tap to Restart' : 'Press R to Restart';
        this.ctx.fillText(restartMsg, this.width / 2, this.height / 2 + 60);
        
        this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 100);
    }
    
    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '48px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 50);
        
        this.ctx.font = '24px Courier New';
        const restartMsg = this.isTouchDevice ? 'Tap to Restart' : 'Press R to Restart';
        this.ctx.fillText(restartMsg, this.width / 2, this.height / 2 + 20);
        
        this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 60);
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }
    
    restart() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameState = 'playing';
        this.currentBackground = null;
        this.player = new Player(100, 300, this);
        this.initLevel();
    }
    
    gameLoop() {
        // Handle restart
        if (this.keys['KeyR'] && (this.gameState === 'gameOver' || this.gameState === 'victory')) {
            this.restart();
        }
        
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Player class
class Player {
    constructor(x, y, game) {
        this.game = game;
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.speed = 5;
        this.jumpPower = 12;
        this.animationState = 'idle'; // idle, running, jumping
    }
    
    update(keys, platforms) {
        // Horizontal movement
        if (keys['ArrowLeft']) {
            this.vx = -this.speed;
            this.animationState = 'running';
        } else if (keys['ArrowRight']) {
            this.vx = this.speed;
            this.animationState = 'running';
        } else {
            this.vx *= 0.8; // Friction
            this.animationState = 'idle';
        }
        
        // Jumping
        if (keys['Space'] && this.onGround) {
            this.vy = -this.jumpPower;
            this.onGround = false;
        }
        
        // Set jumping animation when in air
        if (!this.onGround) {
            this.animationState = 'jumping';
        }
        
        // Apply gravity
        this.vy += 0.5;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Platform collision
        this.onGround = false;
        platforms.forEach(platform => {
            if (this.collidesWith(platform)) {
                // Landing on top
                if (this.vy > 0 && this.y < platform.y) {
                    this.y = platform.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                }
                // Hitting from below
                else if (this.vy < 0 && this.y > platform.y) {
                    this.y = platform.y + platform.height;
                    this.vy = 0;
                }
                // Side collisions
                else if (this.vx > 0 && this.x < platform.x) {
                    this.x = platform.x - this.width;
                    this.vx = 0;
                } else if (this.vx < 0 && this.x > platform.x) {
                    this.x = platform.x + platform.width;
                    this.vx = 0;
                }
            }
        });
        
        // Keep player on screen
        if (this.x < 0) this.x = 0;
        if (this.x > 800 - this.width) this.x = 800 - this.width;
    }
    
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
    
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
    }
    
    draw(ctx) {
        // Only draw if images are loaded
        if (!this.game.images.loaded) {
            // Fallback to simple rectangle if images not loaded yet
            ctx.fillStyle = '#000';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = '#FFF';
            ctx.fillRect(this.x + 12, this.y, 8, this.height);
            ctx.fillRect(this.x + 8, this.y + 20, 16, 12);
            return;
        }
        
        // Select appropriate sprite based on animation state
        let sprite;
        switch (this.animationState) {
            case 'running':
                sprite = this.game.images.kodaRunning;
                break;
            case 'jumping':
                sprite = this.game.images.kodaJumping;
                break;
            default:
                sprite = this.game.images.kodaIdle;
        }
        
        // Draw the sprite
        ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
    }
}

// Platform class
class Platform {
    constructor(x, y, width, height, color = '#8B4513') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add some texture
        ctx.fillStyle = '#654321';
        for (let i = 0; i < this.width; i += 20) {
            ctx.fillRect(this.x + i, this.y, 2, this.height);
        }
    }
}

// Collectible class
class Collectible {
    constructor(x, y, type = 'coin') {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 16;
        this.type = type;
        this.animation = 0;
    }
    
    draw(ctx) {
        this.animation += 0.1;
        
        if (this.type === 'coin') {
            // Draw spinning coin
            ctx.fillStyle = '#FFD700';
            const scale = Math.abs(Math.sin(this.animation));
            const width = this.width * scale;
            ctx.fillRect(this.x + (this.width - width) / 2, this.y, width, this.height);
            
            // Add shine
            ctx.fillStyle = '#FFF';
            ctx.fillRect(this.x + (this.width - width) / 2 + 2, this.y + 2, Math.max(2, width - 4), 4);
        }
    }
}

// Enemy class
class Enemy {
    constructor(x, y, type = 'goomba') {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;
        this.type = type;
        this.vx = -1;
        this.vy = 0;
        this.defeated = false;
    }
    
    update(platforms) {
        if (this.defeated) return;
        
        // Move horizontally
        this.x += this.vx;
        
        // Apply gravity
        this.vy += 0.5;
        this.y += this.vy;
        
        // Platform collision
        platforms.forEach(platform => {
            if (this.collidesWith(platform) && this.vy > 0) {
                this.y = platform.y - this.height;
                this.vy = 0;
            }
        });
        
        // Reverse direction at edges
        if (this.x <= 0 || this.x >= 800 - this.width) {
            this.vx = -this.vx;
        }
    }
    
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
    
    draw(ctx) {
        if (this.defeated) return;
        
        // Draw simple enemy
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Eyes
        ctx.fillStyle = '#FFF';
        ctx.fillRect(this.x + 4, this.y + 4, 4, 4);
        ctx.fillRect(this.x + 16, this.y + 4, 4, 4);
        
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 6, this.y + 6, 2, 2);
        ctx.fillRect(this.x + 18, this.y + 6, 2, 2);
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new Game();
});

