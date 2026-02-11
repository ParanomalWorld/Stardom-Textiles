// Header Interactions
document.addEventListener('DOMContentLoaded', () => {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const dropdownParents = document.querySelectorAll('.dropdown-parent');

    const carousel = document.getElementById('carousel');
const images = carousel.querySelectorAll('img');
const dotsContainer = document.getElementById('carouselDots');
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
// Updated Mobile Menu Interaction
document.querySelectorAll('.mobile-nav-item.has-submenu').forEach(item => {
    const link = item.querySelector('.mobile-nav-link');
    link.addEventListener('click', (e) => {
        e.preventDefault();
        item.classList.toggle('active');
    });
});

// Close submenus when clicking elsewhere
document.addEventListener('click', (e) => {
    if (!e.target.closest('.mobile-nav-item.has-submenu')) {
        document.querySelectorAll('.mobile-nav-item.has-submenu').forEach(item => {
            item.classList.remove('active');
        });
    }
});

// Smooth scroll for mobile menu items
document.querySelectorAll('.mobile-submenu-item').forEach(link => {
    link.addEventListener('click', () => {
        mobileNav.classList.remove('active');
        document.body.classList.remove('no-scroll');



    });

    images.forEach((_, i) => {
  const dot = document.createElement('div');
  dot.classList.add('dot');
  if (i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => {
    carousel.scrollTo({
      left: carousel.children[i].offsetLeft,
      behavior: 'smooth'
    });
  });
  dotsContainer.appendChild(dot);
});

// Update dots on scroll
carousel.addEventListener('scroll', () => {
  const scrollLeft = carousel.scrollLeft;
  let closestIndex = 0;
  let closestDistance = Infinity;

  [...images].forEach((img, i) => {
    const distance = Math.abs(img.offsetLeft - scrollLeft);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = i;
    }
  });

  [...dotsContainer.children].forEach(dot => dot.classList.remove('active'));
  dotsContainer.children[closestIndex].classList.add('active');
});
});

