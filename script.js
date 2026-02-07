window.addEventListener("scroll", () => {
  const heroText = document.querySelector(".hero-content");
  let scrollY = window.scrollY;
  heroText.style.transform = `translateY(${scrollY * 0.3}px)`;
});
