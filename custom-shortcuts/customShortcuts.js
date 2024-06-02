chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: requestPictureInPicture,
    args: ["action"],
  });
});

function requestPictureInPicture() {
  if (document.pictureInPictureEnabled) {
    let video = document.getElementsByTagName("video");
    video[0].requestPictureInPicture();
  } else {
    console.log("Your browser cannot use picture-in-picture right now");
  }
}

// This callback WILL NOT be called for "_execute_action"
chrome.commands.onCommand.addListener((command) => {
  console.log(`Command "${command}" called`);
});
