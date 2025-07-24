async function addBookmarkButton() {
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

  // Check if current page is bookmarked
  const currentUrl = window.location.href;
  let isBookmarked = false;
  
  try {
    const response = await chrome.runtime.sendMessage({ 
      action: 'checkBookmark', 
      url: currentUrl 
    });
    isBookmarked = response.isBookmarked;
  } catch (error) {
    console.error('Error checking bookmark status:', error);
  }

  // Load the appropriate HTML template
  const templateFile = isBookmarked ? 'bookmark-filled.html' : 'bookmark-outlined.html';
  let buttonHTML = '';
  
  try {
    const response = await fetch(chrome.runtime.getURL(templateFile));
    buttonHTML = await response.text();
  } catch (error) {
    console.error('Error loading template:', error);
    // Fallback to outlined version
    buttonHTML = `
      <span class="Button-content">
        <span class="Button-visual Button-leadingVisual">
          <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" class="octicon octicon-bookmark">
            <path d="M3.75 2A.75.75 0 0 0 3 2.75v11.5c0 .414.336.75.75.75a.75.75 0 0 0 .494-.184L8 11.434l3.756 3.632A.75.75 0 0 0 13 14.25V2.75a.75.75 0 0 0-.75-.75h-8.5ZM4.5 3.5h7v9.06l-3.006-2.907a.75.75 0 0 0-1.038 0L4.5 12.56V3.5Z"></path>
          </svg>
        </span>
        <span class="Button-label">Add bookmark</span>
      </span>
    `;
  }

  // Create the bookmark button
  const bookmarkButton = document.createElement('button');
  bookmarkButton.id = 'bookmark-button';
  bookmarkButton.className = 'Button--secondary Button--small Button';
  bookmarkButton.type = 'button';
  bookmarkButton.innerHTML = buttonHTML;

  // Update button text based on bookmark status
  const buttonLabel = bookmarkButton.querySelector('.Button-label');
  if (isBookmarked) {
    buttonLabel.textContent = 'Remove bookmark';
  } else {
    buttonLabel.textContent = 'Add bookmark';
  }

  // Add click event listener to the button
  bookmarkButton.addEventListener('click', async () => {
    console.log('Bookmark button clicked!');
    const url = window.location.href;
    const title = document.title;
  
    try {
      let response;
      if (isBookmarked) {
        // Remove bookmark
        response = await chrome.runtime.sendMessage({ 
          action: 'removeBookmark', 
          url 
        });
      } else {
        // Create bookmark
        response = await chrome.runtime.sendMessage({ 
          action: 'createBookmark', 
          title, 
          url 
        });
      }
      
      if (response.success) {
        console.log(isBookmarked ? 'Bookmark removed successfully' : 'Bookmark created successfully');
        
        // Remove the button so it gets recreated with the new state
        bookmarkButton.remove();
        setTimeout(addBookmarkButton, 100);
      } else {
        console.error('Failed to update bookmark:', response.error);
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
    }
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