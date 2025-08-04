chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: requestPictureInPicture,
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
