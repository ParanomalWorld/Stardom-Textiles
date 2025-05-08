// Header Interactions
document.addEventListener('DOMContentLoaded', () => {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const dropdownParents = document.querySelectorAll('.dropdown-parent');

    // Mobile Menu Toggle
    mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileNav.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });

    // Close Mobile Menu
    document.addEventListener('click', (e) => {
        if (!mobileNav.contains(e.target) && !mobileToggle.contains(e.target)) {
            mobileNav.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    });

    // Dropdown Interactions
    dropdownParents.forEach(parent => {
        parent.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) {
                parent.querySelector('.dropdown-menu').style.opacity = '1';
                parent.querySelector('.dropdown-menu').style.visibility = 'visible';
            }
        });

        parent.addEventListener('mouseleave', () => {
            if (window.innerWidth > 768) {
                parent.querySelector('.dropdown-menu').style.opacity = '0';
                parent.querySelector('.dropdown-menu').style.visibility = 'hidden';
            }
        });
    });

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});