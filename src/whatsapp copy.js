chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showAlert") {
    const targetDiv = document.querySelector("#facebook");

    if (targetDiv) {
      const scrollInterval = setInterval(() => {
        // Tìm tất cả các phần tử có aria-label="Viết bình luận"
        const commentButtons = document.querySelectorAll('[aria-label="Viết bình luận"]');
        let clicked = false;

        commentButtons.forEach((button) => {
          // Kiểm tra nếu nút đang nằm trong vùng hiển thị
          if (isElementInViewport(button) && !button.hasAttribute('data-clicked')) {
            button.click(); // Nhấn vào nút "Viết bình luận"
            button.setAttribute('data-clicked', 'true'); // Đánh dấu nút đã được nhấp
            clicked = true; // Đánh dấu là đã nhấp vào một nút

            // Đợi 1 giây để đảm bảo form bình luận đã mở
            setTimeout(() => {
              writeCommentAndClosePopup(); // Viết bình luận và đóng popup nếu có
            }, 1000);
          }
        });

        // Nếu không có nút mới nào để nhấp và đã đến cuối trang, dừng cuộn
        if (
          targetDiv.scrollTop + targetDiv.clientHeight >=
          targetDiv.scrollHeight
        ) {
          clearInterval(scrollInterval); // Dừng kéo khi đã đến cuối
        } else {
          targetDiv.scrollTop += 100; // Kéo xuống thêm 100 pixel
        }
      }, 20);
    } else {
      console.log("Không tìm thấy thẻ với class đã chỉ định.");
    }
  }
});

// Hàm kiểm tra xem phần tử có nằm trong vùng hiển thị hay không
function writeCommentAndClosePopup() {
  // Tìm thẻ div chứa ô nhập liệu
  const divInputComment = document.querySelector('.html-div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1jx94hy.x190bdop.xp3hrpj.x1ey2m1c.x13xjmei.xv7j57z.xh8yej3');

  if (divInputComment) {
    const maxWaitTime = 10000; // Thời gian tối đa để chờ (10 giây)
    const intervalTime = 500; // Khoảng thời gian giữa các lần kiểm tra (500ms)
    let elapsedTime = 0;

    const checkInterval = setInterval(() => {
      // Kiểm tra tất cả các ô nhập bình luận tiềm năng trong phạm vi thẻ div
      const potentialCommentBoxes = divInputComment.querySelectorAll('div[aria-label^="Bình luận với vai trò"], textarea');

      let foundCommentBox = null;

      potentialCommentBoxes.forEach((commentBox) => {
        // Kiểm tra xem ô nhập liệu có hiển thị và chưa được xử lý trước đó
        if (commentBox && isElementVisible(commentBox) && !commentBox.hasAttribute('data-processed')) {
          foundCommentBox = commentBox; // Nếu tìm thấy ô nhập liệu đang hiển thị
        }
      });

      if (foundCommentBox) {
        clearInterval(checkInterval); // Dừng kiểm tra tuần hoàn nếu tìm thấy ô nhập liệu
        foundCommentBox.setAttribute('data-processed', 'true'); // Đánh dấu ô nhập liệu đã được xử lý
        foundCommentBox.focus(); // Đặt con trỏ vào ô nhập liệu
        document.execCommand('insertText', false, 'hello'); // Nhập nội dung bình luận
        foundCommentBox.dispatchEvent(new Event('input', { bubbles: true })); // Kích hoạt sự kiện input để cập nhật giá trị

        // Tìm nút gửi bình luận trong phạm vi của thẻ div đã tìm thấy
        const sendButton = divInputComment.querySelector('[aria-label="Nhấn Enter để gửi"]');
        if (sendButton) {
          sendButton.click(); // Nhấn vào nút gửi bình luận

          // Đóng popup sau khi gửi bình luận
          setTimeout(() => {
            closePopupIfPresent();
          }, 1000);
        } else {
          console.log("Không tìm thấy nút gửi bình luận.");
        }
      } else if (elapsedTime >= maxWaitTime) {
        clearInterval(checkInterval); // Dừng kiểm tra nếu đã quá thời gian chờ
        console.log("Không tìm thấy ô nhập bình luận trong thời gian chờ.");
      }

      elapsedTime += intervalTime; // Tăng thời gian chờ đã trôi qua
    }, intervalTime);
  } else {
    console.log("Không tìm thấy thẻ div chứa ô nhập bình luận.");
  }
}

// Hàm kiểm tra xem phần tử có hiển thị hay không
function isElementVisible(element) {
  return element.offsetWidth > 0 && element.offsetHeight > 0; // Kiểm tra nếu phần tử có kích thước và hiển thị
}

function closePopupIfPresent() {
  const closeButton = document.querySelector('[aria-label="Đóng"]');
  if (closeButton) {
    closeButton.click();
    console.log("Đã đóng popup.");
  } else {
    console.log("Không tìm thấy nút đóng popup.");
  }
}
