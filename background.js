
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'createBookmark') {
    chrome.bookmarks.create(
      {
        'title': "PRs",
        'parentId': '1'
      },
      function(newFolder) {
        console.log("added folder: " + newFolder.title);
      },
    );
  }
});