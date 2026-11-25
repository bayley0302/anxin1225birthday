const content = document.querySelector('#content');
const heading = document.querySelector('#section-title');
const directory = document.querySelector('#directory');
const links = [...document.querySelectorAll('#site-nav a[href^="#"]')];
const sections = new Map(links.map(link => [link.hash.slice(1), link]));
document.querySelector('#date').textContent = window.birthday.date;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function showDirectory(open) {
  directory.closest('aside').classList.toggle('open', open);
  directory.setAttribute('aria-expanded', String(open));
}

directory.addEventListener('click', () => showDirectory(directory.getAttribute('aria-expanded') === 'false'));
links.forEach(link => link.addEventListener('click', () => showDirectory(false)));

function gallery(photos) {
  const group = element('div', 'gallery');
  const track = element('div', 'gallery-track');
  track.setAttribute('aria-label', '照片相册');
  track.tabIndex = 0;
  const pages = photos.map(({src, title}, index) => {
    const frame = element('figure');
    const img = element('img');
    img.src = src;
    img.alt = title;
    img.draggable = false;
    frame.hidden = index !== 0;
    frame.append(img);
    track.append(frame);
    return frame;
  });
  const bar = element('div', 'gallery-controls');
  const prev = element('button', '', '上一张');
  const next = element('button', '', '下一张');
  const count = element('output');
  let current = 0;
  let gesture;
  let turning;
  function update() {
    count.textContent = (current + 1) + ' / ' + photos.length;
    prev.disabled = current === 0;
    next.disabled = current === photos.length - 1;
  }
  function go(step) {
    const target = current + step;
    if (target < 0 || target >= pages.length) return;
    turning?.cancel();
    const previous = pages[current];
    const incoming = pages[target];
    current = target;
    previous.hidden = true;
    incoming.hidden = false;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const sheet = previous.cloneNode(true);
      sheet.hidden = false;
      sheet.classList.add('turning-page');
      sheet.setAttribute('aria-hidden', 'true');
      sheet.style.transformOrigin = step > 0 ? 'left center' : 'right center';
      track.append(sheet);
      turning = sheet.animate([
        {transform: 'rotateY(0deg)', opacity: 1},
        {transform: 'rotateY(' + (-step * 86) + 'deg)', opacity: .8, offset: .84},
        {transform: 'rotateY(' + (-step * 96) + 'deg)', opacity: 0}
      ], {duration: 470, easing: 'ease-in-out'});
      turning.onfinish = turning.oncancel = () => sheet.remove();
    }
    update();
  }
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  track.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    go(event.key === 'ArrowLeft' ? -1 : 1);
  });
  track.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    gesture = {id: event.pointerId, x: event.clientX, y: event.clientY};
    track.setPointerCapture(event.pointerId);
  });
  track.addEventListener('pointerup', event => {
    if (event.pointerId !== gesture?.id) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    gesture = null;
    if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) go(-Math.sign(dx));
  });
  track.addEventListener('pointercancel', () => { gesture = null; });
  track.addEventListener('lostpointercapture', () => { gesture = null; });
  bar.append(prev, count, next);
  group.append(track, bar);
  update();
  return group;
}

function videos(clips) {
  const list = element('ul', 'video-grid');
  const viewer = element('dialog', 'video-viewer');
  const video = element('video');
  video.controls = true;
  video.playsInline = true;
  const previous = element('button', 'link', '上一条');
  const next = element('button', 'link', '下一条');
  const close = element('button', 'link', '关闭');
  const actions = element('div', 'actions');
  actions.append(previous, next, close);
  viewer.append(video, actions);
  let current = 0;

  function show(index) {
    current = index;
    const clip = clips[index];
    viewer.setAttribute('aria-label', clip.title);
    video.src = clip.src;
    video.setAttribute('aria-label', clip.title);
    previous.disabled = index === 0;
    next.disabled = index === clips.length - 1;
    if (!viewer.open) viewer.showModal();
    video.play().catch(() => {});
  }

  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  close.addEventListener('click', () => viewer.close());
  viewer.addEventListener('close', () => {
    video.pause();
    video.removeAttribute('src');
    video.load();
  });

  clips.forEach(({src, title: caption, layout, url}, index) => {
    const item = element('li', url ? 'video-external' : (layout === 'landscape' ? 'video-landscape' : ''));
    const card = url ? element('a', 'video-card') : element('button', 'video-card');
    if (url) {
      card.href = url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.setAttribute('aria-label', '前往观看 ' + caption);
    }
    const poster = element('img');
    poster.src = url ? src : src.replace(/\.mp4$/i, '.jpg');
    poster.alt = '';
    poster.loading = 'lazy';
    const face = element('span', 'video-cover');
    const play = element('span', 'video-play', '▶');
    play.setAttribute('aria-hidden', 'true');
    face.append(poster, play);
    card.append(face, element('span', 'video-caption', caption));
    if (!url) {
      card.setAttribute('aria-label', '播放 ' + caption);
      card.addEventListener('click', () => show(index));
    }
    item.append(card);
    list.append(item);
  });
  const group = document.createDocumentFragment();
  group.append(list, viewer);
  return group;
}

function asmrArea() {
  const link = element('a', 'asmr-cover');
  link.href = 'https://www.bilibili.com/video/BV1Kd7Q6BENi/?spm_id_from=333.337.search-card.all.click&vd_source=eee2711f742cbfc18dec643737db7c19';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  const cover = element('img');
  cover.src = 'assets/asmr.jpg';
  cover.alt = '周安信 ASMR 视频封面';
  link.append(cover, element('small', '', '点击封面前往哔哩哔哩观看 ASMR'));
  return link;
}

function petArea() {
  const section = element('div', 'pet-area');
  const layout = element('div', 'pet-layout');
  const items = element('div', 'pet-items');
  const stage = element('div', 'pet-stage');
  const portrait = element('img', 'pet-portrait');
  portrait.src = 'assets/pet-portrait.png';
  portrait.alt = '拿着奶茶的周安信';
  portrait.draggable = false;
  const heart = element('span', 'pet-heart', '♡');
  heart.setAttribute('aria-hidden', 'true');
  const audio = element('audio', 'pet-audio');
  audio.preload = 'none';
  const status = element('p', 'pet-status');
  status.setAttribute('role', 'status');
  stage.append(portrait, heart);
  layout.append(items, stage);
  section.append(element('p', 'pet-tip', '来和信咪互动吧 *拖动左侧物品给信咪即可触发'), layout, status, audio);

  function interact(sound, label) {
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    if (sound) {
      audio.src = 'assets/' + sound;
      audio.play().catch(() => {
        if (audio.getAttribute('src') === 'assets/' + sound && audio.error) {
          status.textContent = '音频加载失败，请再试一次。';
        }
      });
    }
    status.textContent = label;
    heart.getAnimations().forEach(animation => animation.cancel());
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      heart.animate([
        {opacity: 0, transform: 'translateY(0) scale(.7)'},
        {opacity: 1, offset: .25},
        {opacity: 0, transform: 'translateY(-34px) scale(1.25)'}
      ], {duration: 640});
    }
  }

  for (const [label, photo, sound, response] of [
    ['摸摸头', 'pet-hand.png', '', '摸摸信咪'],
    ['麦克风', 'pet-mic.png', 'pet-song.mp3', '正在播放：宝贝'],
    ['火锅', 'pet-pot.png', 'pet-pot.mp3', '正在播放：火锅'],
    ['围巾', 'pet-scarf.png', 'pet-scarf.mp3', '正在播放：小众哥必备围巾']
  ]) {
    const item = element('button', 'pet-item');
    const image = element('img');
    image.src = 'assets/' + photo.replace(/^pet-/, 'drag-');
    image.alt = '';
    image.draggable = false;
    item.append(image, element('span', '', label));
    items.append(item);
    let pointer;
    let dragEvents;
    let ghost;
    item.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      pointer = event.pointerId;
      dragEvents = new AbortController();
      const options = {signal: dragEvents.signal};
      window.addEventListener('pointermove', place, options);
      window.addEventListener('pointerup', release, options);
      window.addEventListener('pointercancel', release, options);
      ghost = image.cloneNode();
      ghost.className = 'pet-ghost';
      ghost.setAttribute('aria-hidden', 'true');
      section.append(ghost);
      place(event);
    });
    function place(event) {
      if (event.pointerId !== pointer) return;
      ghost.style.left = event.clientX + 'px';
      ghost.style.top = event.clientY + 'px';
    }
    function release(event) {
      if (event.pointerId !== pointer) return;
      pointer = undefined;
      dragEvents.abort();
      ghost.remove();
      const box = portrait.getBoundingClientRect();
      if (event.type === 'pointerup' && event.clientX >= box.left && event.clientX <= box.right &&
          event.clientY >= box.top && event.clientY <= box.bottom) interact(sound, response);
    }
    item.addEventListener('click', event => {
      if (event.detail === 0) interact(sound, response);
    });
  }
  audio.addEventListener('ended', () => { status.textContent = ''; });
  return section;
}

const wallApi = 'https://wtuxbsjjtptipoanaxkg.supabase.co/rest/v1/birthday_wishes';
const wallKey = 'sb_publishable_-FCh69hb1Nv04yzwYegmJQ_UUDz22qX';
const wallHeaders = {
  apikey: wallKey,
  Authorization: 'Bearer ' + wallKey
};

function wall() {
  const node = document.querySelector('#wall-template').content.cloneNode(true);
  const form = node.querySelector('form');
  const list = node.querySelector('#messages');
  const status = node.querySelector('#wall-status');
  let entries = [];
  function draw() {
    list.replaceChildren();
    if (!entries.length) list.append(element('li', '', '还没有留言，写下第一条生日祝福吧。'));
    entries.forEach(entry => {
      const item = element('li');
      item.append(element('strong', '', entry.name), element('p', '', entry.message));
      list.append(item);
    });
  }
  async function load(initial = false) {
    if (initial) status.textContent = '正在加载大家的祝福…';
    try {
      const response = await fetch(wallApi + '?select=id,name,message,created_at&order=created_at.desc&limit=100', {
        headers: wallHeaders
      });
      if (!response.ok) throw new Error('读取失败');
      entries = await response.json();
      if (initial || status.textContent === '正在加载大家的祝福…' || status.textContent === '留言墙暂时无法加载，请稍后重试。') status.textContent = '';
      draw();
    } catch {
      status.textContent = '留言墙暂时无法加载，请稍后重试。';
      draw();
    } finally {
      if (node.isConnected) window.setTimeout(() => load(false), 15000);
    }
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get('nickname').trim() || '匿名';
    const message = data.get('message').trim();
    if (!message) {
      status.textContent = '请填写生日祝福。';
      return;
    }
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    status.textContent = '正在发布祝福…';
    try {
      const response = await fetch(wallApi, {
        method: 'POST',
        headers: {...wallHeaders, 'Content-Type': 'application/json', Prefer: 'return=representation'},
        body: JSON.stringify({name, message})
      });
      if (!response.ok) throw new Error('写入失败');
      const [entry] = await response.json();
      entries.unshift(entry);
      entries = entries.slice(0, 100);
      status.textContent = '祝福已发布。';
      draw();
      form.reset();
    } catch {
      status.textContent = '发布失败，请稍后重试。';
    } finally {
      submit.disabled = false;
    }
  });
  draw();
  load(true);
  return node;
}

function render(focusHeading = false) {
  const hash = location.hash.slice(1);
  const key = sections.has(hash) ? hash : 'profile';
  heading.textContent = sections.get(key).textContent;
  document.title = heading.textContent + ' · ANXIN';
  sections.forEach((link, name) => {
    if (name === key) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  const playing = content.querySelector('dialog[open] video');
  if (playing) playing.pause();
  content.querySelector('.pet-audio')?.pause();
  content.replaceChildren();
  if (key === 'wall') {
    content.append(wall());
  } else if (key === 'asmr') {
    content.append(asmrArea());
  } else if (key === 'pet') {
    content.append(petArea());
  } else if (key === 'planet') {
    content.append(videos(window.media.planet));
  } else {
    const media = window.media[key];
    const photos = media.filter(item => item.type === 'image');
    const clips = media.filter(item => item.type === 'video');
    if (photos.length) content.append(gallery(photos));
    if (key === 'profile') content.append(element('p', 'profile-text', window.birthday.profile));
    if (clips.length) content.append(videos(clips));
  }
  if (focusHeading) {
    heading.focus({preventScroll: true});
    window.scrollTo(0, 0);
  }
}

window.addEventListener('hashchange', () => render(true));
render();




