(() => {
    const root = document.documentElement;
    const header = document.querySelector(".site-header");

    if (!header) {
        return;
    }

    const setHeaderOffset = () => {
        root.style.setProperty("--header-offset", `${header.offsetHeight}px`);
    };

    setHeaderOffset();
    window.addEventListener("resize", setHeaderOffset);
    window.addEventListener("load", setHeaderOffset);
})();

(() => {
    const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
    const parallaxItems = Array.from(document.querySelectorAll("[data-parallax]"));
    const mobileQuery = window.matchMedia("(max-width: 900px)");
    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const PARALLAX_MIN_FRAME_TIME = 1000 / 45;
    let parallaxRaf = 0;
    let lastParallaxTimestamp = 0;

    revealItems.forEach((item, index) => {
        const staggerDelay = Math.min(index * 0.05, 0.32);
        item.style.setProperty("--reveal-delay", `${staggerDelay.toFixed(2)}s`);
    });

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                });
            },
            { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
        );

        revealItems.forEach((item) => revealObserver.observe(item));
    } else {
        revealItems.forEach((item) => item.classList.add("is-visible"));
    }

    const setParallax = () => {
        parallaxRaf = 0;
        const now = performance.now();

        if (now - lastParallaxTimestamp < PARALLAX_MIN_FRAME_TIME) {
            return;
        }
        lastParallaxTimestamp = now;

        if (reduceMotionQuery.matches || mobileQuery.matches) {
            parallaxItems.forEach((item) => {
                if (item._parallaxShift !== "0px") {
                    item.style.setProperty("--parallax-shift", "0px");
                    item._parallaxShift = "0px";
                }
            });
            return;
        }

        const viewportCenter = window.innerHeight * 0.5;

        parallaxItems.forEach((item) => {
            const strength = Number(item.dataset.parallax || "0.08");
            const rect = item.getBoundingClientRect();
            const elementCenter = rect.top + rect.height * 0.5;
            const distanceFromCenter = (elementCenter - viewportCenter) / viewportCenter;
            const offset = -distanceFromCenter * window.innerHeight * strength * 0.18;
            const shift = `${offset.toFixed(2)}px`;

            if (item._parallaxShift !== shift) {
                item.style.setProperty("--parallax-shift", shift);
                item._parallaxShift = shift;
            }
        });
    };

    const requestParallax = () => {
        if (parallaxRaf) {
            return;
        }
        parallaxRaf = window.requestAnimationFrame(setParallax);
    };

    if (parallaxItems.length > 0) {
        window.addEventListener("scroll", requestParallax, { passive: true });
        window.addEventListener("resize", requestParallax);

        if (typeof reduceMotionQuery.addEventListener === "function") {
            reduceMotionQuery.addEventListener("change", requestParallax);
            mobileQuery.addEventListener("change", requestParallax);
        } else {
            reduceMotionQuery.addListener(requestParallax);
            mobileQuery.addListener(requestParallax);
        }

        requestParallax();
    }
})();

(() => {
    const projectsSection = document.querySelector(".section-projects");
    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!projectsSection || reduceMotionQuery.matches) {
        return;
    }

    let spotlightFrame = 0;
    let spotlightX = "50%";
    let spotlightY = "50%";

    const commitSpotlight = () => {
        spotlightFrame = 0;
        projectsSection.style.setProperty("--spot-x", spotlightX);
        projectsSection.style.setProperty("--spot-y", spotlightY);
    };

    const requestSpotlight = () => {
        if (spotlightFrame) {
            return;
        }
        spotlightFrame = window.requestAnimationFrame(commitSpotlight);
    };

    projectsSection.addEventListener("pointermove", (event) => {
        const bounds = projectsSection.getBoundingClientRect();
        const localX = (event.clientX - bounds.left) / bounds.width;
        const localY = (event.clientY - bounds.top) / bounds.height;
        spotlightX = `${(Math.min(Math.max(localX, 0), 1) * 100).toFixed(2)}%`;
        spotlightY = `${(Math.min(Math.max(localY, 0), 1) * 100).toFixed(2)}%`;
        requestSpotlight();
    });

    projectsSection.addEventListener("pointerleave", () => {
        spotlightX = "50%";
        spotlightY = "50%";
        requestSpotlight();
    });
})();

(() => {
    const root = document.documentElement;
    const header = document.querySelector(".site-header");

    if (!header) {
        return;
    }

    let scrollFrame = 0;

    const updateScrollState = () => {
        scrollFrame = 0;
        const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);

        root.style.setProperty("--page-progress", progress.toFixed(4));
        header.classList.toggle("is-scrolled", window.scrollY > 20);
    };

    const requestScrollUpdate = () => {
        if (scrollFrame) {
            return;
        }
        scrollFrame = window.requestAnimationFrame(updateScrollState);
    };

    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
    window.addEventListener("resize", requestScrollUpdate);
    window.addEventListener("load", requestScrollUpdate);
    updateScrollState();
})();

(() => {
    const root = document.documentElement;
    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reduceMotionQuery.matches) {
        return;
    }

    let pointerFrame = 0;
    let pointerX = 50;
    let pointerY = 26;

    const commitPointer = () => {
        pointerFrame = 0;
        root.style.setProperty("--cursor-x", `${pointerX.toFixed(2)}%`);
        root.style.setProperty("--cursor-y", `${pointerY.toFixed(2)}%`);
    };

    const requestPointerCommit = () => {
        if (pointerFrame) {
            return;
        }
        pointerFrame = window.requestAnimationFrame(commitPointer);
    };

    window.addEventListener(
        "pointermove",
        (event) => {
            pointerX = (event.clientX / window.innerWidth) * 100;
            pointerY = (event.clientY / window.innerHeight) * 100;
            requestPointerCommit();
        },
        { passive: true }
    );

    window.addEventListener("pointerleave", () => {
        pointerX = 50;
        pointerY = 26;
        requestPointerCommit();
    });

    commitPointer();
})();
