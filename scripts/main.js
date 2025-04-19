document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                if (nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                }
            }
        });
    });

    // Screenshots carousel functionality
    const screenshotsSlider = document.getElementById('screenshots-slider');
    const navDots = document.querySelectorAll('.nav-dot');
    const prevBtn = document.getElementById('prev-screenshot');
    const nextBtn = document.getElementById('next-screenshot');

    if (screenshotsSlider && navDots.length > 0) {
        let currentIndex = 0;
        const screenshots = document.querySelectorAll('.screenshot');
        const maxIndex = screenshots.length - 1;

        // Function to scroll to a specific screenshot
        const scrollToScreenshot = (index) => {
            if (index < 0) index = maxIndex;
            if (index > maxIndex) index = 0;

            currentIndex = index;

            // Update active nav dot
            navDots.forEach(dot => dot.classList.remove('active'));
            navDots[currentIndex].classList.add('active');

            // Scroll to the screenshot
            const screenshot = screenshots[currentIndex];
            const scrollPosition = screenshot.offsetLeft - (screenshotsSlider.offsetWidth / 2) + (screenshot.offsetWidth / 2);

            screenshotsSlider.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
        };

        // Set up navigation dots
        navDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.getAttribute('data-index'));
                scrollToScreenshot(index);
            });
        });

        // Set up arrow buttons
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                scrollToScreenshot(currentIndex - 1);
            });

            nextBtn.addEventListener('click', () => {
                scrollToScreenshot(currentIndex + 1);
            });
        }

        // Auto-scroll every 5 seconds
        let autoScrollInterval = setInterval(() => {
            scrollToScreenshot(currentIndex + 1);
        }, 5000);

        // Pause auto-scroll when user interacts with the slider
        screenshotsSlider.addEventListener('mouseenter', () => {
            clearInterval(autoScrollInterval);
        });

        screenshotsSlider.addEventListener('mouseleave', () => {
            autoScrollInterval = setInterval(() => {
                scrollToScreenshot(currentIndex + 1);
            }, 5000);
        });

        // Handle manual scrolling
        let isScrolling;
        screenshotsSlider.addEventListener('scroll', () => {
            clearTimeout(isScrolling);
            clearInterval(autoScrollInterval);

            isScrolling = setTimeout(() => {
                // Find the closest screenshot to the center of the viewport
                const sliderCenter = screenshotsSlider.offsetWidth / 2;
                let closestScreenshot = screenshots[0];
                let closestDistance = Infinity;

                screenshots.forEach((screenshot, index) => {
                    const screenshotCenter = screenshot.offsetLeft + (screenshot.offsetWidth / 2);
                    const distance = Math.abs(screenshotCenter - (screenshotsSlider.scrollLeft + sliderCenter));

                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestScreenshot = screenshot;
                        currentIndex = index;
                    }
                });

                // Update active nav dot
                navDots.forEach(dot => dot.classList.remove('active'));
                navDots[currentIndex].classList.add('active');

                // Resume auto-scroll
                autoScrollInterval = setInterval(() => {
                    scrollToScreenshot(currentIndex + 1);
                }, 5000);
            }, 150);
        });
    }

    // FAQ accordion
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current item
            item.classList.toggle('active');
        });
    });

    // Form submission
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;

            // Simple validation
            if (!name || !email || !message) {
                alert('Please fill in all required fields.');
                return;
            }

            // In a real application, you would send this data to a server
            // For now, just show a success message
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }
});
