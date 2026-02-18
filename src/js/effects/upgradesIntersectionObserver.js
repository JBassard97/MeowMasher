export const upgradeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        entry.target.classList.remove("out");
      } else {
        entry.target.classList.add("out");
        entry.target.classList.remove("in");
      }
    });
  },
  {
    root: document.querySelector(".upgrades"),
    threshold: 0, // 0 = any pixel visible, 1 = fully visible
  },
);
