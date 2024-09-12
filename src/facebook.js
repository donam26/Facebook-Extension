let keywords = [];
let scrolling = false;
let shouldStopAfterCurrentTask = false; // New flag to indicate stop after the current task
let scrollInterval = null; // Store scroll interval globally

function checkFeel() {
  window.focus(); // Ensure the main window is focused
  const targetDiv = document.querySelector("#facebook");

  if (targetDiv) {
    scrolling = true;
    scrollInterval = setInterval(() => {
      if (!scrolling) { // Stop scrolling if the stop flag is set
        clearInterval(scrollInterval);
        console.log("Scrolling stopped.");
        shouldStopAfterCurrentTask = true; // Set the flag to stop after the current task
        return;
      }

      const commentButtons = document.querySelectorAll(
        '[aria-label="Viết bình luận"]'
      );
      let clicked = false;

      commentButtons.forEach((button) => {
        if (
          isElementInViewport(button) &&
          !button.hasAttribute("data-clicked")
        ) {
          button.click();
          button.setAttribute("data-clicked", "true");
          clicked = true;

          setTimeout(() => {
            writeCommentAndClosePopup();
          }, 1000);
        }
      });

      if (
        targetDiv.scrollTop + targetDiv.clientHeight >=
        targetDiv.scrollHeight
      ) {
        clearInterval(scrollInterval);
      } else {
        targetDiv.scrollTop += 100;
      }
    }, 20);
  } else {
    console.log("Không tìm thấy thẻ với class đã chỉ định.");
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showAlert") {
    const inputValue = request.keyword;
    const comment = request.comment;
    keywords = inputValue.split(";").map((item) => item.trim());
    chrome.storage.local.set({ keywords }, () => {});
    chrome.storage.local.set({ comment }, () => {});
    if (keywords.length === 0 || keywords.every((keyword) => keyword === "")) {
      alert("Vui lòng nhập keyword!");
      return;
    }
    checkFeel();
  } else if (request.action === "stop") {
    scrolling = false; // Set scrolling to false to stop scrolling
    shouldStopAfterCurrentTask = true; // Ensure the extension stops after the current task
    console.log("Scrolling stopped.");
  }
});

// Function to check if an element is in the viewport
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Function to generate a spun comment using spin content
function spinContent(text) {
  return text.replace(/\{(.+?)\}/g, (match, p1) => {
    const options = p1.split('|');
    return options[Math.floor(Math.random() * options.length)];
  });
}

function writeCommentAndClosePopup() {
  const checkPopupInterval = setInterval(() => {
    const popupDiv = document.querySelector(
      ".x1n2onr6.x1ja2u2z.x1afcbsf.xdt5ytf.x1a2a7pz.x71s49j.x1qjc9v5.xrjkcco.x58fqnu.x1mh14rs.xfkwgsy.x78zum5.x1plvlek.xryxfnj.xcatxm7.xrgej4m.xh8yej3"
    );

    if (popupDiv) {
      clearInterval(checkPopupInterval);

      const spanParentElements = popupDiv.querySelector(
        ".x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.xudqn12.x3x7a5m.x6prxxf.xvq8zen.xo1l8bm.xzsf02u.x1yc453h"
      );

      const childSpans = spanParentElements
        ? spanParentElements.querySelectorAll(":scope > div")
        : [];
      let combinedText = "";

      childSpans.forEach((div) => {
        combinedText += div.textContent + " "; // Append each text content with a space
      });

      chrome.storage.local.get(["keywords", "comment"], (result) => {
        const storedComment = result.comment || "";
        const spunComment = spinContent(storedComment); // Generate spun content
        const storedKeywords = result.keywords || [];

        const normalizedCombinedText = combinedText
          .toLowerCase()
          .normalize("NFC")
          .replace(/\s+/g, " ")
          .trim();

        const keywordFound = storedKeywords.some((keyword) =>
          normalizedCombinedText.includes(
            keyword.toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim()
          )
        );

        if (keywordFound) {
          let retryCount = 0;
          const maxRetries = 20; // Maximum attempts to find the input comment box
          const checkCommentBoxInterval = setInterval(() => {
            const divInputComment = popupDiv.querySelector(
              ".html-div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1jx94hy.x190bdop.xp3hrpj.x1ey2m1c.x13xjmei.xv7j57z.xh8yej3"
            );

            if (divInputComment) {
              clearInterval(checkCommentBoxInterval); // Stop checking once input box is found

              const potentialCommentBoxes = divInputComment.querySelectorAll(
                ".xzsf02u.x1a2a7pz.x1n2onr6.x14wi4xw.notranslate"
              );

              let foundCommentBox = null;

              for (const commentBox of potentialCommentBoxes) {
                if (commentBox && isElementVisible(commentBox)) {
                  foundCommentBox = commentBox;
                  break;
                }
              }

              if (foundCommentBox) {
                foundCommentBox.focus();
                document.execCommand("insertText", false, spunComment); // Use the spun comment
                foundCommentBox.dispatchEvent(
                  new Event("input", { bubbles: true })
                );

                const checkInterval = setInterval(() => {
                  const sendButton = popupDiv.querySelector(
                    '[aria-label="Bình luận"]'
                  );
                  console.log(popupDiv)
                  console.log(sendButton)

                  if (sendButton) {
                    const clickEvent = new MouseEvent("click", {
                      bubbles: true,
                      cancelable: true,
                      view: window,
                    });

                    sendButton.dispatchEvent(clickEvent);
                    console.log("Đã nhấn vào nút gửi bình luận.");

                    clearInterval(checkInterval);

                    setTimeout(() => {
                      if (shouldStopAfterCurrentTask) {
                        scrolling = false; // Stop scrolling after the current task
                        console.log("Stopped after the current task.");
                      } else {
                        closePopupIfPresent();
                      }
                    }, 1000);
                  } else {
                    retryCount++;
                    if (retryCount >= maxRetries) {
                      clearInterval(checkInterval);
                      console.log(
                        "Không tìm thấy nút gửi bình luận sau nhiều lần thử."
                      );
                    }
                  }
                }, 500);
              } else {
                console.log("Không tìm thấy ô nhập bình luận trong thẻ div.");
              }
            } else {
              retryCount++;
              if (retryCount >= maxRetries) {
                clearInterval(checkCommentBoxInterval);
                console.log(
                  "Không tìm thấy thẻ div chứa ô nhập bình luận sau nhiều lần thử."
                );
              }
            }
          }, 500); // Check every 500ms for the input box to appear
        } else {
          closePopupIfPresent();
        }
      });
    }
  }, 500); // Check every 500ms for the popup to appear
}

// Function to check if an element is visible
function isElementVisible(element) {
  return (
    element.offsetWidth > 0 &&
    element.offsetHeight > 0 &&
    window.getComputedStyle(element).visibility !== "hidden"
  );
}

// Function to close popup if present
function closePopupIfPresent() {
  const closeButton = document.querySelector(
    '[aria-label="Đóng"], [aria-label="Close"]'
  ); // Check both "Đóng" and "Close"
  if (closeButton) {
    closeButton.click(); // Click the close button
    console.log("Đã đóng popup.");
    // Only call checkFeel() if the stop flag is not set
    if (!shouldStopAfterCurrentTask) {
      checkFeel();
    }
  } else {
    console.log("Không tìm thấy nút đóng popup.");
  }
}
