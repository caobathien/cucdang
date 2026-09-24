(() => {
  "use strict";

  const ORIGINAL_ROOT = "https://lovecodes2.vercel.app/HeartBeatz/";
  const defaults = {
    passcode: "2009",
    title: "Chào Công Chúa",
    message: "Gửi cục dàng, cô gái bé nhỏ của anh! \n Cảm ơn em vì đã ở bên anh ❤️. Anh không biết tương lai như nào hiện tại anh yêu em, và nhớ cục dàng nhiều lắm",
    photos: [
      "../image/1790246537415_2142046926086214970_5656456680232256511_2b4a96117aa21574ff2bb67afa0db3ee.jpg",
      "../image/1790246537403_2142046926086214970_5656456680232256511_63643264ac566b3569e6edd07b684efa.jpg",
      "../image/1790246537395_2142046926086214970_5656456680232256511_a21b86fa8e5ea5b23619ae2b444a1c13.jpg",
      "../image/1790246537388_2142046926086214970_5656456680232256511_c9fa1331f94689c6b80ff697008c2393.jpg",
      "../image/1790246537380_2142046926086214970_5656456680232256511_2cfe530227b3f4bccf94129b4e743361.jpg",
      "../image/1790246537372_2142046926086214970_5656456680232256511_16c57e0d01497b57d222b2556d79f493.jpg",
      "../image/1790246537363_2142046926086214970_5656456680232256511_3c1c78ff9bceef36187e070805081366.jpg",
      "../image/1790246537302_2142046926086214970_5656456680232256511_3cffdfe402d055e9891d0d70992fe83f.jpg",
      "../image/1790246537332_2142046926086214970_5656456680232256511_1402fd66c7208c3730019f5c28fc25ff.jpg",
      "../image/1790246537351_2142046926086214970_5656456680232256511_eb78b95a1d1ab3e93352f023de5dd325.jpg"
    ],
    music: `${ORIGINAL_ROOT}n/a.mp3`,
  };

  function decodePayload(value) {
    if (!value) return {};
    try {
      const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
      const bytes = Uint8Array.from(atob(normalized), (char) => char.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch (error) {
      console.warn("Không thể đọc cấu hình trên URL:", error);
      return {};
    }
  }

  function resolveAsset(path, fallback) {
    if (!path) return fallback;
    try {
      return new URL(path, ORIGINAL_ROOT).href;
    } catch {
      return fallback;
    }
  }

  const payload = decodePayload(new URLSearchParams(location.search).get("id"));
  const config = {
    passcode: String(payload.p || defaults.passcode),
    title: payload.t || defaults.title,
    message: payload.l || defaults.message,
    photos: Array.isArray(payload.q) && payload.q.length
      ? payload.q.map((item) => resolveAsset(item, defaults.photos[0]))
      : defaults.photos,
    music: resolveAsset(payload.m, defaults.music),
  };

  const state = {
    input: "",
    drawing: false,
    autoSlideTimer: null,
    typewriterTimer: null,
    scratchFinished: false,
  };

  const lockScreen = document.getElementById("lock-screen");
  const cardScreen = document.getElementById("card-screen");
  const dots = [...document.querySelectorAll(".dot")];
  const title = document.getElementById("main-title");
  const typewriter = document.getElementById("typewriter");
  const gallery = document.getElementById("gallery");
  const scratchCanvas = document.getElementById("scratch");
  const scratchBox = document.querySelector(".scratch-box");
  const scratchContext = scratchCanvas.getContext("2d", { willReadFrequently: true });

  function renderMusic() {
    const container = document.getElementById("music-container");
    container.innerHTML = `
      <button class="music-control" id="music-toggle" type="button" aria-label="Bật hoặc tắt nhạc">
        <span class="disk" id="music-disk" aria-hidden="true"></span>
        <span class="music-label">Play Music 🎵</span>
      </button>
      <audio id="bg-music" loop preload="metadata">
        <source src="${config.music}" type="audio/mpeg">
      </audio>`;

    const button = document.getElementById("music-toggle");
    const music = document.getElementById("bg-music");
    const disk = document.getElementById("music-disk");
    const label = button.querySelector(".music-label");

    button.addEventListener("click", async () => {
      if (music.paused) {
        try {
          await music.play();
          disk.classList.add("playing");
          label.textContent = "Pause Music ⏸";
        } catch (error) {
          console.warn("Trình duyệt chưa cho phép phát nhạc:", error);
        }
      } else {
        music.pause();
        disk.classList.remove("playing");
        label.textContent = "Play Music 🎵";
      }
    });

    return { button, music };
  }

  const player = renderMusic();

  function updateDots() {
    dots.forEach((dot, index) => {
      dot.classList.toggle("filled", index < state.input.length);
    });
  }

  function clearInput() {
    state.input = "";
    dots.forEach((dot) => dot.classList.remove("error"));
    updateDots();
  }

  function startTypewriter() {
    clearTimeout(state.typewriterTimer);
    typewriter.textContent = "";
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    typewriter.append(cursor);
    let index = 0;

    const typeNext = () => {
      if (index >= config.message.length) return;
      typewriter.insertBefore(document.createTextNode(config.message[index]), cursor);
      index += 1;
      state.typewriterTimer = setTimeout(typeNext, 50);
    };
    typeNext();
  }

  function celebrate() {
    if (typeof window.confetti === "function") {
      window.confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ff4d6d", "#ff8fa3", "#ffffff"],
      });
    }
  }

  function unlock() {
    celebrate();
    setTimeout(() => {
      lockScreen.classList.remove("active");
      cardScreen.classList.add("active");
      title.textContent = config.title;
      startTypewriter();
      if (player.music.paused) player.button.click();
    }, 800);
  }

  function checkPasscode() {
    if (state.input === config.passcode) {
      unlock();
      return;
    }
    dots.forEach((dot) => dot.classList.add("error"));
    setTimeout(clearInput, 500);
  }

  function pressNumber(number) {
    if (state.input.length >= 4) return;
    state.input += number;
    updateDots();
    if (state.input.length === 4) checkPasscode();
  }

  document.querySelectorAll("[data-number]").forEach((button) => {
    button.addEventListener("click", () => pressNumber(button.dataset.number));
  });
  document.getElementById("clear-button").addEventListener("click", clearInput);
  document.addEventListener("keydown", (event) => {
    if (/^\d$/.test(event.key)) pressNumber(event.key);
    if (event.key === "Backspace" || event.key === "Escape") clearInput();
  });

  function renderPhotos() {
    const fragment = document.createDocumentFragment();
    config.photos.forEach((url, index) => {
      const image = document.createElement("img");
      image.src = url;
      image.alt = `Kỷ niệm ${index + 1}`;
      image.className = "photo-stack";
      image.style.zIndex = String(config.photos.length - index);
      image.style.transform = `rotate(${Math.random() * 10 - 5}deg)`;
      fragment.append(image);
    });
    gallery.replaceChildren(fragment);
  }

  renderPhotos();

  function initScratch() {
    const width = scratchBox.clientWidth;
    const height = scratchBox.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    scratchCanvas.width = width * ratio;
    scratchCanvas.height = height * ratio;
    scratchCanvas.style.width = `${width}px`;
    scratchCanvas.style.height = `${height}px`;
    scratchContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    scratchContext.globalCompositeOperation = "source-over";

    const gradient = scratchContext.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#ff9a9e");
    gradient.addColorStop(0.5, "#fad0c4");
    gradient.addColorStop(1, "#fbc2eb");
    scratchContext.fillStyle = gradient;
    scratchContext.fillRect(0, 0, width, height);

    scratchContext.fillStyle = "rgba(255,255,255,0.2)";
    for (let index = 0; index < 50; index += 1) {
      scratchContext.beginPath();
      scratchContext.arc(Math.random() * width, Math.random() * height, Math.random() * 20, 0, Math.PI * 2);
      scratchContext.fill();
    }

    scratchContext.font = "bold 24px 'Mali'";
    scratchContext.fillStyle = "#fff";
    scratchContext.textAlign = "center";
    scratchContext.textBaseline = "middle";
    scratchContext.fillText("Cào nhẹ", width / 2, height / 2);
  }

  initScratch();

  function pointerPosition(event) {
    const rect = scratchCanvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function scratch(event) {
    if (!state.drawing || state.scratchFinished) return;
    const position = pointerPosition(event);
    scratchContext.globalCompositeOperation = "destination-out";
    scratchContext.beginPath();
    scratchContext.arc(position.x, position.y, 22, 0, Math.PI * 2);
    scratchContext.fill();
  }

  function nextPhoto(photo) {
    if (!photo) return;
    photo.classList.add("fly-away");
    setTimeout(() => {
      const photos = [...gallery.querySelectorAll(".photo-stack")];
      const minimum = Math.min(...photos.map((item) => Number(item.style.zIndex) || 0));
      photo.style.zIndex = String(minimum - 1);
      photo.style.transform = `rotate(${Math.random() * 10 - 5}deg)`;
      photo.classList.remove("fly-away");
    }, 600);
  }

  function startAutoSlide() {
    clearInterval(state.autoSlideTimer);
    if (config.photos.length < 2) return;
    state.autoSlideTimer = setInterval(() => {
      const photos = [...gallery.querySelectorAll(".photo-stack")];
      const top = photos.reduce((best, photo) =>
        Number(best.style.zIndex) > Number(photo.style.zIndex) ? best : photo
      );
      nextPhoto(top);
    }, 3000);
  }

  function finishScratchIfNeeded() {
    if (state.scratchFinished) return;
    const image = scratchContext.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height);
    let transparent = 0;
    for (let index = 3; index < image.data.length; index += 4) {
      if (image.data[index] === 0) transparent += 1;
    }

    if (transparent / (image.data.length / 4) <= 0.4) return;
    state.scratchFinished = true;
    scratchCanvas.style.transition = "opacity 1s ease";
    scratchCanvas.style.opacity = "0";
    setTimeout(() => {
      scratchCanvas.style.display = "none";
      startAutoSlide();
    }, 1000);
    
    setTimeout(() => {
      const btnMore = document.getElementById("btn-more-content");
      if (btnMore) {
        btnMore.style.display = "block";
      }
    }, 3000);
  }

  scratchCanvas.addEventListener("pointerdown", (event) => {
    state.drawing = true;
    scratchCanvas.setPointerCapture(event.pointerId);
    scratch(event);
  });
  scratchCanvas.addEventListener("pointermove", scratch);
  scratchCanvas.addEventListener("pointerup", (event) => {
    state.drawing = false;
    if (scratchCanvas.hasPointerCapture(event.pointerId)) scratchCanvas.releasePointerCapture(event.pointerId);
    finishScratchIfNeeded();
  });
  scratchCanvas.addEventListener("pointercancel", () => { state.drawing = false; });

  gallery.addEventListener("click", (event) => {
    const photo = event.target.closest(".photo-stack");
    if (!photo) return;
    nextPhoto(photo);
    startAutoSlide();
  });

  const backgroundCanvas = document.getElementById("bg-canvas");
  const backgroundContext = backgroundCanvas.getContext("2d");
  let particles = [];
  let viewportWidth = 0;
  let viewportHeight = 0;

  class Particle {
    constructor() { this.reset(true); }

    reset(randomY = false) {
      this.x = Math.random() * viewportWidth;
      this.y = randomY ? Math.random() * viewportHeight : viewportHeight;
      this.size = Math.random() * 3 + 1;
      this.speed = Math.random() + 0.5;
      this.color = Math.random() > 0.5 ? "#ff4d6d" : "#fff";
    }

    draw(time) {
      this.y -= this.speed;
      if (this.y < -this.size) this.reset();
      backgroundContext.globalAlpha = Math.sin(time * 0.001 * this.speed) * 0.2 + 0.3;
      backgroundContext.fillStyle = this.color;
      backgroundContext.beginPath();
      backgroundContext.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      backgroundContext.fill();
    }
  }

  function resizeBackground() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    backgroundCanvas.width = viewportWidth * ratio;
    backgroundCanvas.height = viewportHeight * ratio;
    backgroundContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles = Array.from({ length: 100 }, () => new Particle());
  }

  function animateBackground(time) {
    backgroundContext.clearRect(0, 0, viewportWidth, viewportHeight);
    particles.forEach((particle) => particle.draw(time));
    backgroundContext.globalAlpha = 1;
    requestAnimationFrame(animateBackground);
  }

  window.addEventListener("resize", resizeBackground);
  resizeBackground();
  requestAnimationFrame(animateBackground);
})();
