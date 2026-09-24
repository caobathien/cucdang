const DEFAULTS = {
  lf: "Tặng em một bó hoa",
  tf: "Gửi cục dàng 🌷",
  cf: "Hôm nay là Trung thu, anh hông ở cạnh dẫn em đi chơi được, bữa sau anh bù cục dàng nha. Tặng cục dàng 1 bó hoa nhỏ, gặp trực tiếp thì sẽ là 1 bó hoa thật ạ ❤️ Anh luôn nhớ về cục dàng, nhớ nhiều lắm luôn. Nay anh phải đi làm hông về chở bé đi chơi được, nhưng tình cảm của anh dành cho em nhiều hơn bao giờ hết. Anh mong sau này mình còn thật nhiều dịp để cùng nhau đi chơi, cùng nhau đón những ngày lễ và ngày kỉ niệm của tụi mình. Và anh nhất định sẽ ở cạnh em, dẫn em đi chơi, mua cho em thứ em thích và bù lại cho cục dàng thật nhiều. Trung thu vui vẻ nha cô gái bé nhỏ của anh. Cảm ơn em vì đã xuất hiện và làm cho những ngày của anh trở nên đáng mong chờ hơn rất nhiều. ❤️",  
  sf: "Yêu cục dàng nhiều lắm",
  mf: "a.mp3",
};

const ASSET_ROOT = "https://lovelys2.vercel.app/HeartBeats/";

const elements = {
  start: document.querySelector("#start-screen"),
  openGift: document.querySelector("#open-gift"),
  main: document.querySelector("#main-content"),
  flowers: document.querySelector("#flowers"),
  petals: document.querySelector("#petals"),
  title: document.querySelector("#flower-title"),
  letterButton: document.querySelector("#letter-button"),
  modal: document.querySelector("#letter-modal"),
  closeLetter: document.querySelector("#close-letter"),
  letterTitle: document.querySelector("#letter-title"),
  letterMessage: document.querySelector("#letter-message"),
  letterSign: document.querySelector("#letter-sign"),
  music: document.querySelector("#background-music"),
};

function decodeConfig() {
  const encoded = new URLSearchParams(location.search).get("id");
  if (!encoded) return DEFAULTS;

  try {
    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(normalized), (char) => char.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    return { ...DEFAULTS, ...JSON.parse(decoded) };
  } catch (error) {
    console.warn("Không đọc được cấu hình trên URL, đang dùng nội dung mặc định.", error);
    return DEFAULTS;
  }
}

function applyConfig(config) {
  elements.title.textContent = config.lf;
  elements.letterTitle.textContent = config.tf;
  elements.letterMessage.textContent = config.cf;
  elements.letterSign.textContent = config.sf;

  // Music src is already set in HTML
  
  const musicToggle = document.getElementById('music-toggle');
  if (musicToggle) {
    musicToggle.addEventListener('click', () => {
      if (elements.music.paused) {
        elements.music.play();
        musicToggle.querySelector('.music-label').textContent = 'Pause Music ⏸';
      } else {
        elements.music.pause();
        musicToggle.querySelector('.music-label').textContent = 'Play Music 🎵';
      }
    });
  }
}

function makeFlower(index) {
  const flower = document.createElement("div");
  flower.className = "flower";
  flower.setAttribute("aria-hidden", "true");

  const head = document.createElement("div");
  head.className = "flower__head";

  for (let i = 0; i < 6; i += 1) {
    const petal = document.createElement("span");
    petal.className = "flower__petal";
    head.append(petal);
  }

  const center = document.createElement("span");
  center.className = "flower__center";
  head.append(center);

  for (let i = 0; i < 3; i += 1) {
    const spark = document.createElement("i");
    spark.className = "spark";
    head.append(spark);
  }

  const stem = document.createElement("div");
  stem.className = "flower__stem";
  stem.style.animationDelay = `${Math.min(index * 0.11, 0.75)}s`;

  for (let i = 0; i < 3; i += 1) {
    const leaf = document.createElement("span");
    leaf.className = "stem-leaf";
    stem.append(leaf);
  }

  flower.append(head, stem);
  return flower;
}

function buildBouquet() {
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 9; index += 1) fragment.append(makeFlower(index));
  elements.flowers.append(fragment);
}

function createFallingPetal() {
  if (!elements.main.classList.contains("is-visible")) return;

  const petal = document.createElement("span");
  const size = 12 + Math.random() * 16;
  petal.className = "falling-petal";
  petal.textContent = Math.random() > 0.25 ? "♥" : "🌸";
  petal.style.left = `${Math.random() * 100}%`;
  petal.style.fontSize = `${size}px`;
  petal.style.opacity = `${0.45 + Math.random() * 0.5}`;
  petal.style.setProperty("--drift", `${-100 + Math.random() * 200}px`);
  petal.style.animationDuration = `${5 + Math.random() * 5}s`;
  elements.petals.append(petal);
  petal.addEventListener("animationend", () => petal.remove(), { once: true });
}

async function openGift() {
  elements.start.classList.add("is-hidden");
  elements.main.classList.add("is-visible");
  elements.main.setAttribute("aria-hidden", "false");

  try {
    await elements.music.play();
    const musicToggle = document.getElementById('music-toggle');
    if (musicToggle) {
      musicToggle.querySelector('.music-label').textContent = 'Pause Music ⏸';
    }
  } catch {
    // Một số trình duyệt chặn tự phát nhạc; hiệu ứng hình ảnh vẫn tiếp tục.
  }

  window.setTimeout(() => elements.letterButton.classList.add("is-visible"), 2600);
}

function showLetter() {
  elements.modal.classList.add("is-open");
  elements.modal.setAttribute("aria-hidden", "false");
  elements.closeLetter.focus();
}

function hideLetter() {
  elements.modal.classList.remove("is-open");
  elements.modal.setAttribute("aria-hidden", "true");
  elements.letterButton.focus();
}

buildBouquet();
applyConfig(decodeConfig());

elements.openGift.addEventListener("click", openGift);
elements.letterButton.addEventListener("click", showLetter);
elements.closeLetter.addEventListener("click", hideLetter);
elements.modal.addEventListener("click", (event) => {
  if (event.target === elements.modal) hideLetter();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && elements.modal.classList.contains("is-open")) hideLetter();
});

window.setInterval(createFallingPetal, 420);
