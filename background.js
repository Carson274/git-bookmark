// Listener for creating the bookmark
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'createBookmark') {
    createBookmark(request.title, request.url)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true;
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

async function findOrCreateFolder(folderName='PRs') {
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