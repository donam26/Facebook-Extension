let keywords = [];
let timeDelay = 1000;
let scrolling = false;
let isCommenting = false; // Flag to track if a comment action is in progress

document.addEventListener("DOMContentLoaded", () => {
  // Restore stored values from chrome.storage.local or default values
  // chrome.storage.local.get(['keywords', 'comment', 'numberComment', 'timeDelay'], (result) => {
  chrome.storage.local.get(["keywords", "comment", "timeDelay"], (result) => {
    if (result.keywords) {
      document.getElementById("keyword").value = result.keywords.join("; ");
    }
    if (result.comment) {
      document.getElementById("comment").value = result.comment;
    }
    if (result.timeDelay) {
      document.getElementById("timeDelay").value = result.timeDelay;
    }
  });
});

function checkFeel() {
  window.focus(); // Ensure the main window is focused
  const targetDiv = document.querySelector("#facebook");

  if (targetDiv) {
    scrolling = true;
    let scrollInterval = setInterval(() => {
      if (!scrolling) {
        console.log("Scrolling stopped.");
        clearInterval(scrollInterval);
        return;
      }

      const commentButtons = document.querySelectorAll(
        '[aria-label="Viết bình luận"]'
      );

      commentButtons.forEach((button) => {
        // Check if a comment action is already in progress
        if (
          isElementInViewport(button) &&
          !button.hasAttribute("data-clicked") &&
          !isCommenting
        ) {
          button.click();
          button.setAttribute("data-clicked", "true");

          isCommenting = true; // Set the flag to indicate a comment action is in progress

          setTimeout(() => {
            writeCommentAndClosePopup();
          }, timeDelay);
        }
      });

      if (
        targetDiv.scrollTop + targetDiv.clientHeight >=
        targetDiv.scrollHeight
      ) {
        setTimeout(() => {
          targetDiv.scrollTop += 100;
        }, 1000);
      } else {
        targetDiv.scrollTop += 100;
      }
    }, 100); // Adjusted interval for better performance
  } else {
    console.log("Không tìm thấy thẻ với class đã chỉ định.");
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showAlert") {
    const inputValue = request.keyword;
    const comment = request.comment;
    const timeComment = request.timeDelay;
    keywords = inputValue.split(";").map((item) => item.trim());
    timeDelay = timeComment;
    chrome.storage.local.set({ keywords }, () => {});
    chrome.storage.local.set({ comment }, () => {});
    chrome.storage.local.set({ timeDelay }, () => {});
    if (keywords.length === 0 || keywords.every((keyword) => keyword === "")) {
      alert("Vui lòng nhập keyword!");
      return;
    }
    checkFeel();
  } else if (request.action === "pause") {
    scrolling = false;
    console.log("Scrolling stopped.");
  } else if (request.action === "stop") {
    // Dừng scrolling
    scrolling = false;
    console.log("Scrolling stopped.");

    // Xóa dữ liệu trong chrome.storage.local
    chrome.storage.local.clear(() => {
      console.log("Storage cleared.");
    });

    // Scroll về đầu trang
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    const options = p1.split("|");
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
              clearInterval(checkCommentBoxInterval);

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

                // Find and click the send button
                const checkSendButtonInterval = setInterval(() => {
                  const sendButton = popupDiv.querySelector(
                    '[aria-label="Bình luận"]'
                  );

                  if (sendButton) {
                    const clickEvent = new MouseEvent("click", {
                      bubbles: true,
                      cancelable: true,
                      view: window,
                    });

                    sendButton.dispatchEvent(clickEvent);
                    console.log("Đã nhấn vào nút gửi bình luận.");

                    clearInterval(checkSendButtonInterval);

                    // After clicking, wait for a moment before closing the popup
                    setTimeout(() => {
                      closePopupIfPresent();
                    }, 1000); // Adjust the time if needed
                  } else {
                    retryCount++;
                    if (retryCount >= maxRetries) {
                      clearInterval(checkSendButtonInterval);
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
          }, 500);
        } else {
          closePopupIfPresent();
        }
      });
    } else {
      const directCommentFields = document.querySelectorAll(
        ".x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x2lah0s.x193iq5w.x1swvt13.x1pi30zi"
      );

      for (const field of directCommentFields) {
        console.log(field);
        if (
          isElementVisible(field) &&
          field.querySelector(".xzsf02u.x1a2a7pz.x1n2onr6.x14wi4xw.notranslate")
        ) {
          return field.querySelector(
            ".xzsf02u.x1a2a7pz.x1n2onr6.x14wi4xw.notranslate"
          );
        }
      }
    }
  }, 500);
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
  );
  if (closeButton) {
    closeButton.click();
    console.log("Đã đóng popup.");
  } else {
    console.log("Không tìm thấy nút đóng popup.");
  }

  isCommenting = false; // Reset the flag after comment action is complete
}
