function addBookmarkButton() {
  // Grab the gh-header-actions element
  const headerActions = document.querySelector('.gh-header-actions');
  
  // If not found, try again in a moment
  if (!headerActions) {
    setTimeout(addBookmarkButton, 1000);
    return;
  }

  // Bookmark button already exists - no need to add it again
  if (document.querySelector('#bookmark-button')) {
    return;
  }

  // Create the bookmark button
  const bookmarkButton = document.createElement('button');
  bookmarkButton.id = 'bookmark-button';
  bookmarkButton.className = 'Button--secondary Button--small Button';
  bookmarkButton.type = 'button';
  bookmarkButton.innerHTML = `
    <span class="Button-content">
      <span class="Button-visual Button-leadingVisual">
        <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" class="octicon octicon-bookmark">
          <path d="M3 2.75A.75.75 0 0 1 3.75 2h8.5a.75.75 0 0 1 .75.75v11.5a.75.75 0 0 1-1.244.565L8 11.434l-3.756 3.381A.75.75 0 0 1 3 14.25V2.75Z"></path>
        </svg>
      </span>
      <span class="Button-label">Add bookmark</span>
    </span>
  `;

  // Add click event listener to the button
  bookmarkButton.addEventListener('click', () => {
    console.log('Bookmark button clicked!');
    console.log('Current URL:', window.location.href);
    console.log('Page title:', document.title);
  
    // Bookmark API TBD
  });

  headerActions.insertBefore(bookmarkButton, headerActions.sectionElement);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addBookmarkButton);
} else {
  addBookmarkButton();
}

let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(addBookmarkButton, 500);
  }
}).observe(document, { subtree: true, childList: true });
