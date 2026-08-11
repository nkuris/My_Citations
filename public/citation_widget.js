$(document).ready(function() {
  initCitationsWidget();
  fetchCitations();

  // Client-side filter and server-side sort events
  $(document).on('change', '#citation-journal-filter', function() {
    applyFiltersAndRender();
  });

  $(document).on('change', '#citation-sort-order', function() {
    fetchCitations();
  });
});

// Tag Parser Function: build safe DOM nodes from <t> / <c> markup
function createTagNode(tagName, text) {
  var mark = document.createElement('mark');
  mark.textContent = text;
  mark.style.background = tagName === 't' ? '#00C4B022' : '#3AAEF522';
  mark.style.color = tagName === 't' ? '#00C4B0' : '#3AAEF5';
  mark.style.padding = '2px 4px';
  mark.style.borderRadius = '3px';
  mark.style.fontStyle = 'normal';
  return mark;
}

function buildExcerptNodes(str) {
  var fragment = document.createDocumentFragment();
  if (!str) return fragment;

  var regex = /<(\/)?(t|c)>/g;
  var cursor = 0;
  var openTag = null;
  var match;

  while ((match = regex.exec(str)) !== null) {
    if (!openTag) {
      if (match.index > cursor) {
        fragment.appendChild(document.createTextNode(str.slice(cursor, match.index)));
      }

      if (!match[1]) {
        openTag = { name: match[2], start: regex.lastIndex };
      } else {
        fragment.appendChild(document.createTextNode(match[0]));
        cursor = regex.lastIndex;
      }
    } else {
      if (match[1] && match[2] === openTag.name) {
        var content = str.slice(openTag.start, match.index);
        fragment.appendChild(createTagNode(openTag.name, content));
        openTag = null;
        cursor = regex.lastIndex;
      }
    }
  }

  if (openTag) {
    fragment.appendChild(document.createTextNode(str.slice(openTag.start - openTag.name.length - 2)));
    cursor = str.length;
  }

  if (cursor < str.length) {
    fragment.appendChild(document.createTextNode(str.slice(cursor)));
  }

  return fragment;
}

function setExcerptContent($container, text) {
  $container.empty();
  $container[0].appendChild(buildExcerptNodes(text));
}

// Author List Truncation: 1-3 full, >3 first two + "et al."
function formatAuthors(authors) {
  if (!Array.isArray(authors) || authors.length === 0) return '';
  if (authors.length > 3) {
    return authors.slice(0, 2).join(', ') + ' et al.';
  }
  return authors.join(', ');
}

function fetchCitations() {
  var $list = $('#citations-list');
  var sortOrder = $('#citation-sort-order').val() || 'desc';

  $list.html(`
    <div style="text-align:center; padding:2rem; color:var(--slate); font-size:0.88rem;">
      <span style="display:inline-block; animation:spin 1s infinite linear;">&#9696;</span> Loading citations...
    </div>
  `);

  $.ajax({
    url: 'http://localhost:3000/api/citations',
    method: 'GET',
    data: { order: sortOrder },
    dataType: 'json',
    success: function(data) {
      allCitations = Array.isArray(data) ? data : (data.citations || []);
      populateJournalFilter(allCitations);
      applyFiltersAndRender();
    },
    error: function(xhr, status, error) {
      console.error("Error fetching citations:", status, error);
      $list.html('<p style="color:#f87171;">Failed to load citations.</p>');
    }
  });
}

function initCitationsWidget() {
  if ($('#citations-widget').length) return;

  var widgetHtml = `
    <section id="citations-widget" class="features" style="border-top:1px solid var(--rule); padding-top:3rem;">
      <div class="section-head" style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:1rem; margin-bottom: 1.5rem;">
        <div>
          <span class="eyebrow">Academic Citations</span>
          <h2>Research Using P·1000 <span id="citation-total-count" style="font-size:1.1rem; color:var(--sky); font-weight:normal; margin-left:0.5rem;"></span></h2>
        </div>
        <div style="display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center;">
          <select id="citation-journal-filter" style="background:var(--surf); color:var(--fg); border:1px solid var(--rule); padding:0.4rem 0.8rem; border-radius:4px; font-size:0.8rem;">
            <option value="">All Journals</option>
          </select>
          <select id="citation-sort-order" style="background:var(--surf); color:var(--fg); border:1px solid var(--rule); padding:0.4rem 0.8rem; border-radius:4px; font-size:0.8rem;">
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      <div id="citations-list" style="display:flex; flex-direction:column; gap:1.25rem; min-height:120px;"></div>
    </section>
  `;

  var $mount = $('#citations-badge');
  if ($mount.length) {
    $mount.html(widgetHtml);
  }
}

function populateJournalFilter(citations) {
  var $select = $('#citation-journal-filter');
  var journals = new Set();

  citations.forEach(function(c) {
    if (c.journal) journals.add(c.journal);
  });

  $select.find('option:not(:first)').remove();
  journals.forEach(function(j) {
    $select.append($('<option>', { value: j, text: j }));
  });
}

function applyFiltersAndRender() {
  var selectedJournal = $('#citation-journal-filter').val();
  var sortOrder = $('#citation-sort-order').val();

  var filtered = allCitations.filter(function(item) {
    return !selectedJournal || item.journal === selectedJournal;
  });

  filtered.sort(function(a, b) {
    var dateA = new Date(a.date || a.year || a.created_at || 0);
    var dateB = new Date(b.date || b.year || b.created_at || 0);
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  renderCitationsList(filtered);
}

function renderCitationsList(citations) {
  var $list = $('#citations-list');
  $list.empty();

  $('#citation-total-count').text(`(${citations.length} citation${citations.length === 1 ? '' : 's'})`);

  if (citations.length === 0) {
    $list.html('<p style="color:var(--slate); padding:1rem 0;">No citations match your filter.</p>');
    return;
  }

  citations.forEach(function(item) {
    var title = item.article_title || item.title || 'Untitled Article';
    var journal = item.journal || 'Journal';
    var dateInfo = item.date || item.year || '';
    var doiUrl = item.doi ? `https://doi.org/${item.doi}` : '#';
    var authors = formatAuthors(item.authors);
    var shortText = item.short || '';
    var longText = item.long || item.excerpt || item.short || '';
    var hasLongExcerpt = item.long && item.long !== item.short;

    var cardHtml = `
      <div style="background: var(--surf); border: 1px solid var(--rule); padding: 1.25rem 1.5rem; border-radius: 6px;">
        <h4 style="font-size:1rem; font-weight:700; margin-bottom:0.25rem; line-height:1.4;">
          <a href="${doiUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--fg); text-decoration:none; transition:color 0.2s;" onmouseover="this.style.color='var(--sky)'" onmouseout="this.style.color='var(--fg) '">
            ${title} &#8599;
          </a>
        </h4>
        <p style="font-size:0.8rem; color:var(--slate); margin-bottom:0.6rem;">
          ${authors ? `<span style="color:var(--fg-sub); font-weight:500;">${authors}</span> &middot; ` : ''}
          <strong>${journal}</strong> ${dateInfo ? '&middot; ' + dateInfo : ''}
        </p>

        ${shortText ? `
          <blockquote class="excerpt-box" style="font-size:0.85rem; color:var(--fg); line-height:1.6; border-left:3px solid var(--blue); padding-left:0.9rem; margin-top:0.5rem;">
            <span class="excerpt-text"></span>
            ${hasLongExcerpt ? `
              <button class="toggle-excerpt-btn" 
                      data-expanded="false"
                      data-short="${encodeURIComponent(shortText)}"
                      data-long="${encodeURIComponent(longText)}"
                      style="background:none; border:none; color:var(--sky); font-size:0.78rem; font-weight:600; cursor:pointer; padding:0; margin-left:0.5rem; text-decoration:underline;">
                Show more
              </button>
            ` : ''}
          </blockquote>
        ` : ''}
      </div>
    `;

    $list.append(cardHtml);
    if (shortText) {
      var $card = $list.children().last();
      setExcerptContent($card.find('.excerpt-text'), '"' + shortText + '"');
    }
  });

  $('.toggle-excerpt-btn').off('click').on('click', function() {
    var $btn = $(this);
    var isExpanded = $btn.data('expanded') === true;
    var shortTxt = decodeURIComponent($btn.data('short'));
    var longTxt = decodeURIComponent($btn.data('long'));
    var $textSpan = $btn.siblings('.excerpt-text');

    if (isExpanded) {
      setExcerptContent($textSpan, '"' + shortTxt + '"');
      $btn.text('Show more').data('expanded', false);
    } else {
      setExcerptContent($textSpan, '"' + longTxt + '"');
      $btn.text('Show less').data('expanded', true);
    }
  });
}
