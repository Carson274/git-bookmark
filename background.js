// Listener for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'createBookmark':
      createBookmark(request.title, request.url)
        .then(result => sendResponse({ success: true, result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'checkBookmark':
      checkIfBookmarked(request.url)
        .then(result => sendResponse({ isBookmarked: result }))
        .catch(error => sendResponse({ isBookmarked: false, error: error.message }));
      return true;

    case 'removeBookmark':
      removeBookmark(request.url)
        .then(result => sendResponse({ success: true, result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    default:
      sendResponse({ success: false, error: 'Unknown action' });
      return false;
  }
});

// Function to create a bookmark
async function createBookmark(title, url) {
  try {
    let folder = await findOrCreateFolder();

    const shortenedTitle = title.length > 10 ? title.substring(0, 10) + '...' : title;
    
    // Create the bookmark
    const bookmark = await chrome.bookmarks.create({
      parentId: folder.id,
      title: shortenedTitle,
      url: url
    });
    
    return bookmark;
  } catch (error) {
    console.error('Bookmark creation failed:', error);
    throw error;
  }
}

// Function to find or create the PRs folder
async function findOrCreateFolder(folderName = 'PRs') {
  const bookmarks = await chrome.bookmarks.search({ title: folderName });
  const folder = bookmarks.find(b => !b.url);
  
  if (folder) {
    return folder;
  }
  
  // Create folder if it doesn't exist
  return await chrome.bookmarks.create({
    parentId: '1',
    title: folderName
  });
}

// Function to find an existing folder (without creating)
async function findFolder(folderName = 'PRs') {
  const bookmarks = await chrome.bookmarks.search({ title: folderName });
  return bookmarks.find(b => !b.url) || null;
}

// Function to check if a URL is bookmarked in the PRs folder
async function checkIfBookmarked(url) {
  try {
    const folder = await findFolder('PRs');
    if (!folder) return false;
    
    const bookmarks = await chrome.bookmarks.getChildren(folder.id);
    return bookmarks.some(bookmark => bookmark.url === url);
  } catch (error) {
    console.error('Error checking bookmark:', error);
    return false;
  }
}

// Function to remove a bookmark from the PRs folder
async function removeBookmark(url) {
  try {
    const folder = await findFolder('PRs');
    if (!folder) throw new Error('PRs folder not found');
    
    const bookmarks = await chrome.bookmarks.getChildren(folder.id);
    const bookmark = bookmarks.find(b => b.url === url);
    
    if (bookmark) {
      await chrome.bookmarks.remove(bookmark.id);
      return { removed: true };
    }
    
    throw new Error('Bookmark not found');
  } catch (error) {
    console.error('Error removing bookmark:', error);
    throw error;
  }
}