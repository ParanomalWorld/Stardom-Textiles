// Update the JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.querySelector('body');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        body.classList.toggle('nav-active'); // Prevent body scroll

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            body.classList.remove('nav-active');
        }
    });
});
    // Animate stats numbers
    const animateNumbers = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statItems = entry.target.querySelectorAll('h3[data-count]');
                statItems.forEach(item => {
                    const target = +item.dataset.count;
                    let count = 0;
                    const increment = target / 100;

                    const updateCount = () => {
                        if (count < target) {
                            count += increment;
                            item.innerText = Math.ceil(count);
                            requestAnimationFrame(updateCount);
                        } else {
                            item.innerText = target;
                        }
                    };
                    updateCount();
                });
                observer.unobserve(entry.target);
            }
        });
    };

    const statsObserver = new IntersectionObserver(animateNumbers, {
        threshold: 0.5
    });

    const statsSection = document.querySelector('.stats');
    if (statsSection) statsObserver.observe(statsSection);

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
