// Array to store published notices
let notices = [];

// Language ISO codes for Translation API & Speech Synthesis
const languageMap = {
  "English":   { code: "en", speech: "en-IN" },
  "Hindi":     { code: "hi", speech: "hi-IN" },
  "Punjabi":   { code: "pa", speech: "pa-IN" },
  "Bengali":   { code: "bn", speech: "bn-IN" },
  "Tamil":     { code: "ta", speech: "ta-IN" },
  "Telugu":    { code: "te", speech: "te-IN" },
  "Marathi":   { code: "mr", speech: "mr-IN" },
  "Gujarati":  { code: "gu", speech: "gu-IN" },
  "Kannada":   { code: "kn", speech: "kn-IN" },
  "Malayalam": { code: "ml", speech: "ml-IN" },
  "Odia":      { code: "or", speech: "or-IN" },
  "Assamese":  { code: "as", speech: "as-IN" },
  "Urdu":      { code: "ur", speech: "ur-IN" }
};

const noticeForm = document.getElementById('noticeForm');
const noticesList = document.getElementById('noticesList');
const viewLangSelect = document.getElementById('viewLang');
const searchQuery = document.getElementById('searchQuery');

// Form Submission Handler
noticeForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const title = document.getElementById('noticeTitle').value;
  const category = document.getElementById('noticeCategory').value;
  const originalLang = document.getElementById('originalLang').value;
  const content = document.getElementById('noticeContent').value;

  const newNotice = {
    id: Date.now(),
    title: title,
    category: category,
    originalLang: originalLang,
    content: content,
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    translations: {} // Local cache for translated strings
  };

  notices.unshift(newNotice);
  noticeForm.reset();
  renderNotices();
});

// Translation API Call (MyMemory API with automatic fallback)
async function translateText(text, fromLang, toLang) {
  if (fromLang === toLang) return text;

  const fromCode = languageMap[fromLang]?.code || "en";
  const toCode = languageMap[toLang]?.code || "hi";

  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromCode}|${toCode}`
    );
    const data = await response.json();
    if (data && data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
  } catch (error) {
    console.error("Translation error:", error);
  }
  return text; // Return original text if translation service fails
}

// Render Notices Function
async function renderNotices() {
  const selectedLang = viewLangSelect.value;
  const filterText = searchQuery.value.toLowerCase();

  noticesList.innerHTML = '<p style="text-align: center; color: #718096; padding: 20px;">Translating notices...</p>';

  if (notices.length === 0) {
    noticesList.innerHTML = '<p style="color: #a0aec0; text-align: center; padding: 20px;">No notices published yet.</p>';
    return;
  }

  noticesList.innerHTML = '';

  for (let notice of notices) {
    // Fetch translation if not already in cache
    if (!notice.translations[selectedLang]) {
      const translatedTitle = await translateText(notice.title, notice.originalLang, selectedLang);
      const translatedContent = await translateText(notice.content, notice.originalLang, selectedLang);

      notice.translations[selectedLang] = {
        title: translatedTitle,
        content: translatedContent
      };
    }

    const transData = notice.translations[selectedLang];

    // Search filter check
    if (filterText && !transData.title.toLowerCase().includes(filterText) && !transData.content.toLowerCase().includes(filterText)) {
      continue;
    }

    const noticeElement = document.createElement('div');
    noticeElement.className = 'notice-card';
    noticeElement.innerHTML = `
      <div class="notice-header">
        <span class="notice-title">${transData.title}</span>
        <span class="status-badge">Available in ${selectedLang}</span>
      </div>
      <p class="notice-body">${transData.content}</p>
      <div class="notice-footer">
        <span>Category: <strong>${notice.category}</strong> | Original: <strong>${notice.originalLang}</strong></span>
        <span>Published: ${notice.date}</span>
      </div>
    `;

    noticesList.appendChild(noticeElement);
  }
}

// Event Listeners for Filters
viewLangSelect.addEventListener('change', renderNotices);
searchQuery.addEventListener('input', renderNotices);

// Initial Render
renderNotices();