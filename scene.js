const pick = (id) => document.getElementById(id);
const scene = pick('scene');
const cat = pick('cat');
const cake = pick('cake');
const candle = document.querySelector('.candle');
const wind = document.querySelector('.wind');
const menu = pick('menu');
const links = pick('links');
const intro = pick('intro');
const celebration = pick('celebrate');
const enter = pick('enter');
const film = pick('opening-film');
const video = pick('opening-video');
const playFilm = pick('play-film');
const filmStatus = pick('film-status');
const muteFilm = pick('film-mute');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let drag = null;
let timer = null;

pick('date').textContent = window.birthday.date;
pick('greeting').textContent = window.birthday.greeting;


function moveCat(x, y) {
  cat.style.transform = `translate(${x}px, ${y}px)`;
}

function releaseDrag() {
  const pointer = drag?.pointer;
  drag = null;
  cat.classList.remove('dragging');
  if (pointer !== undefined && cat.hasPointerCapture(pointer)) cat.releasePointerCapture(pointer);
}

function reset() {
  clearTimeout(timer);
  releaseDrag();
  scene.dataset.state = 'ready';
  scene.classList.remove('smoking');
  cat.classList.add('settling');
  moveCat(0, 0);
  cat.disabled = false;
  intro.hidden = false;
  celebration.hidden = true;
  enter.hidden = false;
  cat.focus({ preventScroll: true });
}

function finish(smoke) {
  scene.dataset.state = 'done';
  scene.classList.toggle('smoking', smoke);
  cat.disabled = true;
  intro.hidden = true;
  celebration.hidden = false;
  enter.focus({ preventScroll: true });
  timer = setTimeout(showFilm, smoke ? 1450 : 600);
}

function blow() {
  if (scene.dataset.state !== 'ready') return;
  releaseDrag();
  const stage = scene.getBoundingClientRect();
  const plate = cake.getBoundingClientRect();
  const feline = cat.getBoundingClientRect();
  const wick = candle.getBoundingClientRect();
  const fromX = plate.left + plate.width * .08;
  const fromY = plate.bottom - feline.height * .46;
  cat.classList.add('settling');
  moveCat(fromX - feline.width * .77 - stage.left - cat.offsetLeft, plate.bottom - feline.height - stage.top - cat.offsetTop);
  wind.style.left = `${fromX - stage.left}px`;
  wind.style.top = `${fromY - stage.top}px`;
  wind.style.setProperty('--wind-x', `${wick.left - fromX}px`);
  wind.style.setProperty('--wind-y', `${wick.top - fromY}px`);
  scene.dataset.state = 'blowing';
  pick('skip').disabled = true;
  timer = setTimeout(() => {
    pick('skip').disabled = false;
    finish(true);
  }, motion.matches ? 0 : 450);
}

cat.addEventListener('pointerdown', (event) => {
  if (drag || !event.isPrimary || event.button !== 0 || scene.dataset.state !== 'ready') return;
  cat.classList.remove('settling');
  moveCat(0, 0);
  drag = { pointer: event.pointerId, x: event.clientX, y: event.clientY, moved: false, lastX: 0, lastY: 0 };
  cat.setPointerCapture(event.pointerId);
  cat.classList.add('dragging');
});

function crossesCake(fromX, fromY, toX, toY) {
  const stage = scene.getBoundingClientRect();
  const plate = cake.getBoundingClientRect();
  const left = stage.left + cat.offsetLeft;
  const top = stage.top + cat.offsetTop;
  let enterAt = 0;
  let exitAt = 1;

  // Sweep the cat's bounds between events so a fast drag cannot skip the cake.
  for (const [start, end, min, max] of [
    [fromX, toX, plate.left - left - cat.offsetWidth * .75, plate.right - left - cat.offsetWidth * .25],
    [fromY, toY, plate.top - top - cat.offsetHeight * .9, plate.bottom - top - cat.offsetHeight * .1]
  ]) {
    if (start === end) {
      if (start < min || start > max) return false;
      continue;
    }
    const a = (min - start) / (end - start);
    const b = (max - start) / (end - start);
    enterAt = Math.max(enterAt, Math.min(a, b));
    exitAt = Math.min(exitAt, Math.max(a, b));
    if (enterAt > exitAt) return false;
  }
  return true;
}

function updateDrag(event) {
  const dx = event.clientX - drag.x;
  const dy = event.clientY - drag.y;
  if (Math.hypot(dx, dy) > 5) drag.moved = true;
  if (!drag.moved) return;
  const x = Math.max(-cat.offsetLeft, Math.min(dx, scene.clientWidth - cat.offsetLeft - cat.offsetWidth));
  const y = Math.max(-cat.offsetTop, Math.min(dy, scene.clientHeight - cat.offsetTop - cat.offsetHeight));
  const hit = crossesCake(drag.lastX, drag.lastY, x, y);
  moveCat(x, y);
  drag.lastX = x;
  drag.lastY = y;
  if (hit) blow();
}

window.addEventListener('pointermove', (event) => {
  if (event.pointerId === drag?.pointer) updateDrag(event);
});

window.addEventListener('pointerup', (event) => {
  if (event.pointerId !== drag?.pointer) return;
  updateDrag(event);
  if (!drag) return;
  releaseDrag();
  cat.classList.add('settling');
  moveCat(0, 0);
});

function cancelDrag(event) {
  if (event.pointerId !== drag?.pointer) return;
  releaseDrag();
  moveCat(0, 0);
}
window.addEventListener('pointercancel', cancelDrag);
cat.addEventListener('lostpointercapture', cancelDrag);
cat.addEventListener('click', (event) => {
  if (event.detail === 0) blow();
});
pick('skip').addEventListener('click', () => {
  if (scene.dataset.state !== 'ready') return;
  releaseDrag();
  moveCat(0, 0);
  finish(false);
});
pick('retry').addEventListener('click', reset);
function openHome() {
  clearTimeout(timer);
  if (!video.ended) return;
  try {
    sessionStorage.setItem('anxin-film-watched', '1');
  } catch {
    filmStatus.textContent = '浏览器未允许保存此次观看状态，请用 Edge 或 Chrome 打开网页。';
    filmStatus.hidden = false;
    return;
  }
  voiceTrack.pause();
  location.assign('home.html');
}
async function startFilm(allowMutedFallback) {
  try {
    await video.play();
  } catch {
    if (video.error) return;
    if (allowMutedFallback) {
      video.muted = true;
      return startFilm(false);
    }
    filmStatus.textContent = '请点击播放以继续。';
    filmStatus.hidden = false;
    playFilm.hidden = false;
  }
}

function showFilm() {
  clearTimeout(timer);
  if (film.open) return;
  film.showModal();
  startFilm(true);
}

enter.addEventListener('click', showFilm);
playFilm.addEventListener('click', () => {
  if (video.error) video.load();
  startFilm(false);
});
video.addEventListener('playing', () => {
  playFilm.hidden = true;
  filmStatus.hidden = true;
  muteFilm.hidden = false;
});
video.addEventListener('error', () => {
  filmStatus.textContent = '视频加载失败，请重试播放。';
  playFilm.hidden = false;
  filmStatus.hidden = false;
});
const voiceDialog = pick('opening-voice');
const voiceTrack = pick('voice-track');
const voicePlay = pick('voice-play');
const voiceProgress = pick('voice-progress');
function clockText(seconds) {
  const full = Math.floor(Number.isFinite(seconds) ? seconds : 0);
  return Math.floor(full / 60) + ':' + String(full % 60).padStart(2, '0');
}
function syncVoice() {
  const playing = !voiceTrack.paused && !voiceTrack.ended;
  voicePlay.setAttribute('aria-label', playing ? '暂停语音' : '播放语音');
  voicePlay.firstElementChild.textContent = playing ? 'Ⅱ' : '▶';
  const ready = Number.isFinite(voiceTrack.duration) && voiceTrack.duration > 0;
  voiceProgress.disabled = !ready;
  voiceProgress.max = ready ? voiceTrack.duration : 1;
  voiceProgress.value = ready ? voiceTrack.currentTime : 0;
  voiceProgress.style.setProperty('--played', (ready ? 100 * voiceTrack.currentTime / voiceTrack.duration : 0) + '%');
  pick('voice-time').textContent = clockText(voiceTrack.currentTime) + ' / ' + clockText(voiceTrack.duration);
}
for (const event of ['play', 'pause', 'ended', 'loadedmetadata', 'timeupdate', 'emptied']) {
  voiceTrack.addEventListener(event, syncVoice);
}
voicePlay.addEventListener('click', () => {
  if (voiceTrack.paused || voiceTrack.ended) voiceTrack.play().catch(() => {});
  else voiceTrack.pause();
});
voiceProgress.addEventListener('input', () => {
  voiceTrack.currentTime = Number(voiceProgress.value);
});
let koreanVoice = true;
function playVoice() {
  const caption = pick('voice-title');
  caption.lang = koreanVoice ? 'ko' : 'zh-CN';
  caption.textContent = koreanVoice ? '고마워, 케이크는 내가 사양 안 할게' : '多谢，蛋糕我就不客气啦';
  pick('voice-language').textContent = koreanVoice ? '切换中文' : '切换韩语';
  voiceTrack.pause();
  voiceTrack.src = koreanVoice ? 'assets/opening-ko.mp3' : 'assets/opening-zh.mp3';
  voiceTrack.play().catch(() => {});
}
video.addEventListener('ended', () => {
  film.close();
  voiceDialog.showModal();
  playVoice();
});
voiceDialog.addEventListener('cancel', event => event.preventDefault());
pick('voice-language').addEventListener('click', () => {
  koreanVoice = !koreanVoice;
  playVoice();
});
pick('voice-home').addEventListener('click', openHome);
video.addEventListener('volumechange', () => {
  muteFilm.textContent = video.muted ? '开启声音' : '静音';
});
muteFilm.addEventListener('click', () => { video.muted = !video.muted; });
film.addEventListener('cancel', event => event.preventDefault());
function showMenu(open) {
  links.hidden = !open;
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
}
menu.addEventListener('click', () => showMenu(links.hidden));
pick('home').addEventListener('click', () => {
  showMenu(false);
  pick('skip').disabled = false;
  reset();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !links.hidden) {
    showMenu(false);
    menu.focus();
  }
});




