let lastPostCount = 0;
let currentIndex = 0;
let intervalId = null;
let isProcessing = false;
let keywords = [];
let timeDelay = 1000;

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
    window.focus(); 
    checkNewPostsContinuously(); 
   } else if (request.action === "pause") {
    stopScroll();
  } else if (request.action === "stop") {
    // Dừng scrolling
    stopScroll();
        console.log("Scrolling stopped.");
    // Xóa dữ liệu trong chrome.storage.local
    chrome.storage.local.clear(() => {
      console.log("Storage cleared.");
    });

    chrome.runtime.sendMessage({ action: 'clearPopup' });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

function stopScroll() {
  if (intervalId) {
    clearInterval(intervalId); // Dừng interval
    intervalId = null; // Reset giá trị để có thể kiểm tra lại lần sau
    console.log("Đã tạm dừng quá trình cuộn.");
  }
}

async function checkNewPostsContinuously() {
  if (!intervalId) {
    intervalId = setInterval(async () => {
      // Nếu đang xử lý thì không tiếp tục xử lý bài viết khác
      if (isProcessing) return;

      const postElements = document.querySelector(
        ".x9f619.x193iq5w.x1miatn0.xqmdsaz.x1gan7if.x1xfsgkm div"
      );

      if (postElements) {
        const children = postElements.children;

        if (currentIndex < children.length) {
          const child = children[currentIndex];

          if (isInViewport(child)) {
            const sendButton = child.querySelector(
              '[aria-label="Viết bình luận"]'
            );
            if (sendButton && !isInViewport(sendButton)) {
              scrollToButton(sendButton);
            } else if (sendButton) {
              isProcessing = true;

              // Await the keyword check before proceeding
              const keywordFound = await checkKeyWord(child);
              if (keywordFound) {
                const clickEvent = new MouseEvent("click", {
                  bubbles: true,
                  cancelable: true,
                  view: window,
                });
                sendButton.dispatchEvent(clickEvent);

                setTimeout(async () => {
                  await checkPopup(child);
                  console.log(child);
                  isProcessing = false; // Hoàn thành xử lý bài viết
                }, 1000);
              } else {
                console.log("Không tìm thấy từ khóa phù hợp trong bài viết.");
                isProcessing = false; // Không tìm thấy từ khóa, chuyển sang bài viết tiếp theo
              }
              currentIndex++; // Chuyển đến bài viết tiếp theo
            } else {
              currentIndex++; // Di chuyển sang bài viết tiếp theo dù không tìm thấy nút
            }
          } else {
            scrollToPost(child); // Cuộn xuống để bài viết hiện lên
          }
        } else {
          console.log("Đã xử lý hết các bài viết.");
        }
      } else {
        console.log("Không phát hiện bài viết mới.");
      }
    }, timeDelay);
  }
}


// Kiểm tra nếu phần tử đang trong viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  // Kiểm tra nếu một phần của phần tử nằm trong màn hình
  return (
    rect.top < windowHeight &&
    rect.bottom > 0 && // Phần trên của phần tử nằm dưới đỉnh màn hình, và phần dưới nằm trên đáy màn hình
    rect.left < windowWidth &&
    rect.right > 0 // Phần bên trái của phần tử nằm trong màn hình
  );
}

// Cuộn màn hình để hiển thị bài viết
function scrollToPost(element) {
  element.scrollIntoView({ behavior: "smooth", block: "center" });
}

// Cuộn màn hình để hiển thị nút bình luận trong bài viết dài
function scrollToButton(button) {
  button.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function checkPopup(post) {
  const popupDiv = document.querySelector(
    ".x1n2onr6.x1ja2u2z.x1afcbsf.xdt5ytf.x1a2a7pz.x71s49j.x1qjc9v5.xrjkcco.x58fqnu.x1mh14rs.xfkwgsy.x78zum5.x1plvlek.xryxfnj.xcatxm7.xrgej4m"
  );

  if (popupDiv) {
    await handleComment(popupDiv); // Xử lý bình luận trong popup
    await closePopupIfPresent(); // Chờ đến khi popup đóng hoàn toàn
  } else {
    console.log("Bình luận trực tiếp");
    await handleComment(post); // Xử lý bình luận trực tiếp nếu không có popup
  }
}

async function closePopupIfPresent() {
  return new Promise((resolve) => {
    const closeButton = document.querySelector(
      '[aria-label="Đóng"], [aria-label="Close"]'
    );
    if (closeButton) {
      closeButton.click();
      console.log("Đã đóng popup.");
      setTimeout(resolve, 1000); // Chờ 1 giây để đảm bảo popup đã đóng hoàn toàn
    } else {
      console.log("Không tìm thấy nút đóng popup.");
      resolve();
    }
  });
}

async function handleComment(parentBox) {
  console.log(parentBox);
  const commentBox = parentBox.querySelector(
    ".xzsf02u.x1a2a7pz.x1n2onr6.x14wi4xw.notranslate"
  );

  if (commentBox) {
    commentBox.setAttribute("data-commented", "true");
    commentBox.innerText = ""; // Xóa nội dung cũ

    // Chờ một khoảng thời gian để chắc chắn rằng input đã được render
    await new Promise((resolve) => setTimeout(resolve, 500));

    commentBox.focus(); // Focus vào ô bình luận
    const storedComment = await getStoredComment();

    const spunComment = spinContent(storedComment); // Generate spun content

    document.execCommand("insertText", false, spunComment);
    commentBox.dispatchEvent(new Event("input", { bubbles: true })); // Cập nhật nội dung vào ô bình luận

    await new Promise((resolve) => {
      const intervalId = setInterval(() => {
        // Focus lại vào ô comment để đảm bảo nút gửi được render ra
        commentBox.focus();
        
        const sendButton = parentBox.querySelector('[aria-label="Bình luận"]');
        if (sendButton) {
          sendButton.focus(); // Focus vào nút gửi để nó sẵn sàng click
          sendButton.click(); // Click vào nút gửi bình luận
          console.log("Đã nhấn vào nút gửi bình luận.");

          clearInterval(intervalId); // Dừng việc kiểm tra sau khi đã nhấn nút gửi

          setTimeout(() => {
            console.log("Proceeding to next post...");
            resolve(); // Kết thúc Promise sau khi hoàn thành bình luận
          }, 3000); // Thời gian chờ sau khi gửi bình luận
        } else {
          console.log("Đang chờ nút gửi bình luận được render...");
        }
      }, 500); // Kiểm tra mỗi 500ms
    });
  } else {
    console.log("Không tìm thấy ô nhập bình luận.");
  }
}

function spinContent(text) {
  return text.replace(/\{(.+?)\}/g, (match, p1) => {
    const options = p1.split("|");
    return options[Math.floor(Math.random() * options.length)];
  });
}

async function checkKeyWord(post) {
  return new Promise((resolve) => {
    chrome.storage.local.get(["keywords"], (result) => {
      const combinedText = post.innerText || post.textContent || "";
      const keywords = result.keywords || [];

      // Log the post content and keywords for debugging
      console.log("Post content:", combinedText);
      console.log("Keywords:", keywords);

      if (!keywords || keywords.length === 0) {
        console.log("No keywords provided.");
        resolve(false);
        return;
      }

      const normalizedCombinedText = combinedText
        .toLowerCase()
        .normalize("NFC")
        .replace(/\s+/g, " ")
        .trim();

      const keywordFound = keywords.some((keyword) => {
        const normalizedKeyword = keyword.toLowerCase().normalize("NFC").trim();
        const keywordMatch = normalizedCombinedText.includes(normalizedKeyword);
        console.log(`Checking keyword: "${normalizedKeyword}", Match: ${keywordMatch}`);
        return keywordMatch;
      });

      resolve(keywordFound);
    });
  });
}


async function getStoredComment() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["comment"], (result) => {
      resolve(result.comment || "");
    });
  });
}