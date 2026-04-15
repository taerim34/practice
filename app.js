const KEY = 'booklog.books';
const load = () => JSON.parse(localStorage.getItem(KEY) || '[]');
const save = (b) => localStorage.setItem(KEY, JSON.stringify(b));

function addBook(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  const books = load();
  books.push({
    id: Date.now(),
    title: f.get('title'),
    author: f.get('author'),
    category: f.get('category') || '기타',
    rating: Number(f.get('rating')),
    pages: Number(f.get('pages')) || null,
    cover: f.get('cover') || '',
    tags: (f.get('tags') || '')
      .split(',').map((t) => t.trim()).filter(Boolean),
    note: f.get('note'),
    date: f.get('date') || new Date().toISOString().slice(0, 10),
  });
  save(books);
  location.href = 'books.html';
  return false;
}

function removeBook(id) {
  save(load().filter((b) => b.id !== id));
  renderBooks();
}

function renderBooks() {
  const list = document.getElementById('list');
  if (!list) return;
  const q = (document.getElementById('q')?.value || '').toLowerCase();
  const books = load().filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      (b.tags || []).some((t) => t.toLowerCase().includes(q))
  );
  if (!books.length) {
    list.innerHTML = '<li class="empty">아직 기록된 책이 없어요.</li>';
    return;
  }
  list.innerHTML = books
    .sort((a, b) => b.id - a.id)
    .map((b) => bookCard(b, true))
    .join('');
}

function bookCard(b, withDelete) {
  const tags = (b.tags || []).map((t) => `<span class="tag">#${escape(t)}</span>`).join(' ');
  const cover = b.cover
    ? `<img class="cover" src="${escape(b.cover)}" alt="" onerror="this.style.display='none'" />`
    : '';
  return `
    <li>
      ${cover}
      <div style="flex:1">
        <strong>${escape(b.title)}</strong>
        ${b.category ? `<span class="tag">${escape(b.category)}</span>` : ''}
        ${'★'.repeat(b.rating)}${'☆'.repeat(5 - b.rating)}
        <div class="meta">
          ${escape(b.author)} · ${b.date}${b.pages ? ` · ${b.pages}p` : ''}
        </div>
        ${b.note ? `<div class="note">"${escape(b.note)}"</div>` : ''}
        ${tags ? `<div class="tags-row">${tags}</div>` : ''}
      </div>
      ${withDelete ? `<button onclick="removeBook(${b.id})">삭제</button>` : ''}
    </li>`;
}

function renderHome() {
  const books = load();
  const total = books.length;
  const avg = total ? (books.reduce((s, b) => s + b.rating, 0) / total).toFixed(1) : '0.0';
  const recent = total ? books.sort((a, b) => b.id - a.id)[0].title : '-';
  document.getElementById('total').textContent = total;
  document.getElementById('avg').textContent = avg;
  document.getElementById('recent').textContent = recent;
}

function updatePreview() {
  const el = document.getElementById('preview');
  if (!el) return;
  const f = new FormData(document.getElementById('form'));
  const title = f.get('title');
  const author = f.get('author');
  if (!title && !author) {
    el.innerHTML = '<span class="empty">입력하는 내용이 여기 미리보기로 표시돼요.</span>';
    return;
  }
  const fake = {
    title: title || '(제목 없음)',
    author: author || '(저자 없음)',
    category: f.get('category'),
    rating: Number(f.get('rating')) || 3,
    pages: Number(f.get('pages')) || null,
    cover: f.get('cover') || '',
    tags: (f.get('tags') || '').split(',').map((t) => t.trim()).filter(Boolean),
    note: f.get('note'),
    date: f.get('date') || new Date().toISOString().slice(0, 10),
  };
  el.innerHTML = `<h3 class="preview-title">미리보기</h3><ul class="list" style="margin:0">${bookCard(fake, false)}</ul>`;
}

function resetAll() {
  if (confirm('모든 기록을 삭제할까요?')) {
    localStorage.removeItem(KEY);
    alert('초기화 완료');
  }
}

function escape(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
