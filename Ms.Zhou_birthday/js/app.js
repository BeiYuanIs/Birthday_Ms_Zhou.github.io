class BirthdayApp {
    constructor() {
        this.isMobile = this.checkMobile();
        this.initElements();
        this.initMusic();
        this.initCarousel();
        this.initEasterEgg();
        this.initLoader();
        this.fireConfetti();
    }

    /* ========== 初始化方法 ========== */
    initElements() {
        // 核心元素
        this.loader = document.getElementById('loader');
        this.musicPlayer = document.getElementById('bgMusic');
        this.musicBtn = document.getElementById('musicBtn');

        // 轮播图元素
        this.carousel = {
            inner: document.querySelector('.carousel-inner'),
            slides: document.querySelectorAll('.slide'),
            dots: document.querySelectorAll('.dot'),
            prevBtn: document.querySelector('.carousel-btn.prev'),
            nextBtn: document.querySelector('.carousel-btn.next'),
            currentIndex: 0
        };

        // 彩蛋元素
        this.easterEggBtn = document.getElementById('easterEggBtn');
        this.modal = document.getElementById('easterEggModal');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.showSecretBtn = document.getElementById('showSecretBtn');
        this.secretPage = document.getElementById('secretPage');
        this.backBtn = document.getElementById('backBtn');
    }

    initMusic() {
        // 配置音乐播放器
        this.musicPlayer.src = '../music/happy-birthday.mp3';
        this.musicPlayer.muted = true;
        this.musicPlayer.preload = 'auto';
        
        // iOS特殊处理
        if (this.isIOS()) {
            this.musicPlayer.setAttribute('playsinline', '');
            this.musicPlayer.setAttribute('webkit-playsinline', '');
        }

        // 移动设备特殊处理
        if (this.isMobile) {
            this.mobileMusicHandler();
        } else {
            this.attemptAutoPlay();
        }

        // 事件监听
        this.musicBtn.addEventListener('click', () => this.toggleMusic());
        this.musicPlayer.addEventListener('play', () => this.updateMusicButton('⏸️ 暂停音乐'));
        this.musicPlayer.addEventListener('pause', () => this.updateMusicButton('🎵 播放音乐'));
        this.musicPlayer.addEventListener('error', () => this.handleMusicError());
    }

    initCarousel() {
        this.initLazyLoad();
        
        // 按钮事件
        this.carousel.prevBtn.addEventListener('click', () => this.prevSlide());
        this.carousel.nextBtn.addEventListener('click', () => this.nextSlide());

        // 指示器事件
        this.carousel.dots.forEach(dot => {
            dot.addEventListener('click', () => {
                this.goToSlide(parseInt(dot.dataset.index));
            });
        });

        // 移动端触摸事件
        if (this.isMobile) {
            this.initTouchEvents();
        }
    }

    initEasterEgg() {
        this.easterEggBtn.addEventListener('click', () => this.showModal());
        this.closeModalBtn.addEventListener('click', () => this.hideModal());
        this.showSecretBtn.addEventListener('click', () => {
            this.hideModal();
            this.showSecretPage();
        });
        this.backBtn.addEventListener('click', () => this.hideSecretPage());
    }

    initLoader() {
        setTimeout(() => {
            this.loader.style.opacity = '0';
            setTimeout(() => {
                this.loader.style.display = 'none';
            }, 500);
        }, 2000);
    }

    /* ========== 工具方法 ========== */
    checkMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }

    /* ========== 音乐控制 ========== */
    mobileMusicHandler() {
        this.musicBtn.style.display = 'block';
        this.musicBtn.addEventListener('click', () => {
            this.attemptAutoPlay().catch(e => {
                console.log('移动端播放失败:', e);
            });
        }, { once: true });
    }

    attemptAutoPlay() {
        return this.musicPlayer.play()
            .then(() => {
                this.fadeInVolume();
                this.musicBtn.style.display = 'none';
            })
            .catch(error => {
                console.log('自动播放被阻止:', error);
                this.musicBtn.style.display = 'block';
            });
    }

    fadeInVolume() {
        this.musicPlayer.volume = 0;
        const fadeInterval = setInterval(() => {
            if (this.musicPlayer.volume < 0.8) {
                this.musicPlayer.volume += 0.1;
            } else {
                clearInterval(fadeInterval);
            }
        }, 100);
    }

    toggleMusic() {
        if (this.musicPlayer.paused) {
            this.musicBtn.textContent = '⌛ 加载中...';
            this.musicPlayer.play().catch(e => {
                this.updateMusicButton('🎵 播放音乐');
                console.error('播放失败:', e);
            });
        } else {
            this.musicPlayer.pause();
        }
    }

    updateMusicButton(text) {
        this.musicBtn.textContent = text;
        this.musicPlayer.muted = false;
    }

    handleMusicError() {
        this.musicBtn.textContent = '❌ 加载失败';
        this.musicBtn.style.backgroundColor = '#ffcccc';
        console.error('音频加载失败');
    }

    /* ========== 轮播图控制 ========== */
    initLazyLoad() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target.querySelector('img');
                    if (img && img.dataset.src) {
                        img.src = img.dataset.src;
                        img.onload = () => img.classList.add('loaded');
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, { rootMargin: '200px' });

        this.carousel.slides.forEach(slide => observer.observe(slide));
    }

    initTouchEvents() {
        let touchStartX = 0;
        const threshold = 50;

        this.carousel.inner.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        this.carousel.inner.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            if (touchStartX - touchEndX > threshold) {
                this.nextSlide();
            } else if (touchEndX - touchStartX > threshold) {
                this.prevSlide();
            }
        }, { passive: true });
    }

    updateCarousel() {
        this.carousel.inner.style.transform = `translateX(-${this.carousel.currentIndex * 100}%)`;
        
        this.carousel.slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.carousel.currentIndex);
        });

        this.carousel.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.carousel.currentIndex);
        });
    }

    prevSlide() {
        this.carousel.currentIndex = (this.carousel.currentIndex > 0) ? 
            this.carousel.currentIndex - 1 : this.carousel.slides.length - 1;
        this.updateCarousel();
    }

    nextSlide() {
        this.carousel.currentIndex = (this.carousel.currentIndex < this.carousel.slides.length - 1) ? 
            this.carousel.currentIndex + 1 : 0;
        this.updateCarousel();
    }

    goToSlide(index) {
        if (index >= 0 && index < this.carousel.slides.length) {
            this.carousel.currentIndex = index;
            this.updateCarousel();
        }
    }

    /* ========== 彩蛋功能 ========== */
    showModal() {
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hideModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    showSecretPage() {
        document.querySelector('.birthday-card').style.display = 'none';
        this.secretPage.style.display = 'flex';
        this.fireConfetti(5);
    }

    hideSecretPage() {
        this.secretPage.style.display = 'none';
        document.querySelector('.birthday-card').style.display = 'block';
    }

    /* ========== 特效 ========== */
    fireConfetti(duration = 3) {
        if (!window.confetti) return;

        const end = Date.now() + (duration * 1000);
        const colors = ['#ff6b8b', '#ffb8c6', '#4ecdc4', '#ffffff'];

        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };

        frame();
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new BirthdayApp();
    
    // 禁用右键菜单
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
});