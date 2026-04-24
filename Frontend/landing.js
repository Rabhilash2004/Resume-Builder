/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/javascript.js to edit this template
 */
const rotatingWords = [
  "dream job.",
  "perfect resume.",
  "career growth.",
  "winning profile."
];

const testimonials = [
  "\"I got recruiters from Amazon, Wise, and other companies reaching out to me already!!\"",
  "\"The resume preview feels premium and the builder is super smooth.\"",
  "\"I finished my resume in minutes and exported it instantly.\""
];

const floatingMessages = [
  "Someone from Düsseldorf, Germany is also here",
  "A user from Bengaluru just built a resume",
  "Someone from Pune exported a PDF",
  "A fresh profile was created 1 min ago"
];

let wordIndex = 0;
let testimonialIndex = 0;
let floatingIndex = 0;

function animateCounters() {
  const counters = document.querySelectorAll(".stat-number");

  counters.forEach(counter => {
    const target = +counter.dataset.target;
    const duration = 1400;
    const start = 0;
    const stepTime = Math.max(Math.floor(duration / target), 20);

    let current = start;
    const timer = setInterval(() => {
      current += 1;
      counter.textContent = current;
      if (current >= target) {
        clearInterval(timer);
        counter.textContent = target + (target === 98 ? "%" : "+");
      }
    }, stepTime);
  });
}

function updateRotatingWord() {
  const el = document.getElementById("rotatingWord");
  if (!el) return;
  el.style.opacity = "0";
  el.style.transform = "translateY(8px)";
  setTimeout(() => {
    wordIndex = (wordIndex + 1) % rotatingWords.length;
    el.textContent = rotatingWords[wordIndex];
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
  }, 220);
}

function updateTestimonial() {
  const el = document.getElementById("testimonialText");
  if (!el) return;
  el.style.opacity = "0";
  setTimeout(() => {
    testimonialIndex = (testimonialIndex + 1) % testimonials.length;
    el.textContent = testimonials[testimonialIndex];
    el.style.opacity = "1";
  }, 200);
}

function updateFloatingMessage() {
  const el = document.getElementById("floatingText");
  if (!el) return;
  el.style.opacity = "0";
  setTimeout(() => {
    floatingIndex = (floatingIndex + 1) % floatingMessages.length;
    el.textContent = floatingMessages[floatingIndex];
    el.style.opacity = "1";
  }, 180);
}

function revealOnScroll() {
  const items = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.14 });

  items.forEach(item => observer.observe(item));
}

function parallaxMockup() {
  const mockup = document.getElementById("mockup");
  if (!mockup) return;

  document.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 10;
    const y = (e.clientY / window.innerHeight - 0.5) * 10;
    mockup.style.transform = `rotateX(${-y}deg) rotateY(${x}deg)`;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  revealOnScroll();
  parallaxMockup();
  animateCounters();

  setInterval(updateRotatingWord, 2400);
  setInterval(updateTestimonial, 3600);
  setInterval(updateFloatingMessage, 3000);
});

