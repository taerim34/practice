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
    rating: Number(f.get('rating')),
    note: f.get('note'),
    date: new Date().toISOString().slice(0, 10),
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
    (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
  );
  if (!books.length) {
    list.innerHTML = '<li class="empty">아직 기록된 책이 없어요.</li>';
    return;
  }
  list.innerHTML = books
    .sort((a, b) => b.id - a.id)
    .map(
      (b) => `
    <li>
      <div>
        <strong>${escape(b.title)}</strong> ${'★'.repeat(b.rating)}${'☆'.repeat(5 - b.rating)}
        <div class="meta">${escape(b.author)} · ${b.date}</div>
        ${b.note ? `<div class="note">"${escape(b.note)}"</div>` : ''}
      </div>
      <button onclick="removeBook(${b.id})">삭제</button>
    </li>`
    )
    .join('');
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
