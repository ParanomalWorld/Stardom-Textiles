// public/js/script.js
document.addEventListener('DOMContentLoaded', () => {
    // Animate stats numbers
    const animateNumbers = (entries, observer) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                const statItems = entry.target.querySelectorAll('.stat-item h3');
                statItems.forEach(item => {
                    const target = +item.innerText;
                    let count = 0;
                    const increment = target / 100;
                    
                    const updateCount = () => {
                        if(count < target) {
                            count += increment;
                            item.innerText = Math.ceil(count);
                            requestAnimationFrame(updateCount);
                        } else {
                            item.innerText = target;
                        }
                    }
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
    if(statsSection) statsObserver.observe(statsSection);

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