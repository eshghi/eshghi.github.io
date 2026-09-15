(() => {
  'use strict';
  const list = document.querySelector('#project-list');
  if (list) {
    const rows = [...list.querySelectorAll('.project-row')];
    const buttons = [...document.querySelectorAll('[data-filter]')];
    const search = document.querySelector('#project-search');
    const known = new Set(buttons.map(button => button.dataset.filter));
    let category = 'all';
    const restore = () => {
      const params = new URLSearchParams(location.search);
      category = known.has(params.get('area')) ? params.get('area') : 'all';
      search.value = params.get('q') || '';
    };
    const apply = (write = true) => {
      const query = search.value.trim().toLocaleLowerCase();
      let count = 0;
      for (const row of rows) {
        const visible = (category === 'all' || row.dataset.category === category) && row.dataset.search.includes(query);
        row.hidden = !visible;
        count += visible ? 1 : 0;
      }
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
      document.querySelector('#results-status').textContent = `${count} projects`;
      document.querySelector('#empty-state').hidden = count !== 0;
      const filtered = category !== 'all' || Boolean(query);
      document.querySelector('#introduction').hidden = filtered;
      document.querySelector('.collection-heading [data-clear]').hidden = !filtered;
      document.querySelector('#collection-label').textContent = category === 'all' ? 'Selected research & applications' : buttons.find(button => button.dataset.filter === category).textContent;
      if (write) {
        const params = new URLSearchParams();
        if (category !== 'all') params.set('area', category);
        if (query) params.set('q', search.value.trim());
        try { history.replaceState(null, '', location.pathname + (params.size ? '?' + params : '') + location.hash); } catch (_) { /* Local file previews may restrict history. */ }
      }
    };
    buttons.forEach(button => button.addEventListener('click', () => { category = button.dataset.filter; apply(); }));
    search.addEventListener('input', () => apply());
    document.querySelectorAll('[data-clear]').forEach(button => button.addEventListener('click', () => {
      category = 'all'; search.value = ''; apply();
    }));
    window.addEventListener('popstate', () => { restore(); apply(false); });
    restore(); apply(false);
  }

  const dialog = document.querySelector('#gallery-lightbox');
  const data = document.querySelector('#gallery-data');
  if (dialog && data) {
    const photos = JSON.parse(data.textContent);
    const image = dialog.querySelector('img');
    let index = 0;
    const show = next => {
      index = (next + photos.length) % photos.length;
      const photo = photos[index];
      image.src = data.dataset.base + photo.file;
      image.alt = photo.title;
      dialog.querySelector('#lightbox-title').textContent = photo.title;
      dialog.querySelector('#lightbox-caption').textContent = photo.caption;
      dialog.querySelector('.lightbox-index').textContent = `${index + 1} / ${photos.length}`;
      dialog.querySelector('.full-image').href = image.src;
    };
    document.querySelectorAll('[data-gallery-index]').forEach(button => button.addEventListener('click', () => {
      show(Number(button.dataset.galleryIndex)); dialog.showModal();
    }));
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.querySelector('[data-prev]').addEventListener('click', () => show(index - 1));
    dialog.querySelector('[data-next]').addEventListener('click', () => show(index + 1));
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
  }
})();
