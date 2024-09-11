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
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
function writeCommentAndClosePopup() {
  // Tìm ô nhập bình luận dựa trên class của div chứa ô nhập liệu
  const divInputComment = document.querySelector('.html-div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1jx94hy.x190bdop.xp3hrpj.x1ey2m1c.x13xjmei.xv7j57z.xh8yej3');

  if (divInputComment) {
    // Kiểm tra tất cả các ô nhập bình luận tiềm năng trong phạm vi thẻ div
    const potentialCommentBoxes = divInputComment.querySelectorAll('div[aria-label^="Bình luận với vai trò"], textarea');

    let foundCommentBox = null;
    
    // Duyệt qua các ô nhập bình luận tiềm năng để tìm ô hiển thị
    for (const commentBox of potentialCommentBoxes) {
      if (commentBox && isElementVisible(commentBox)) {
        foundCommentBox = commentBox; // Nếu tìm thấy ô nhập liệu đang hiển thị
        break;
      }
    }

    if (foundCommentBox) {
      foundCommentBox.focus(); // Đặt con trỏ vào ô nhập liệu
      document.execCommand('insertText', false, 'hello'); // Nhập nội dung bình luận
      foundCommentBox.dispatchEvent(new Event('input', { bubbles: true })); // Kích hoạt sự kiện input để cập nhật giá trị

      // Đợi một chút để nút gửi xuất hiện
      setTimeout(() => {
        // Tìm nút gửi bình luận trong phạm vi của thẻ div đã tìm thấy
        const sendButton = divInputComment.querySelector('.x1i10hfl.x1qjc9v5.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x9f619.xdl72j9.x2lah0s.xe8uvvx.x2lwn1j.xeuugli.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1h6gzvc.x1t137rt.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x1q0g3np.x87ps6o.x1lku1pv.x1a2a7pz.xjyslct.xjbqb8w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x3nfvp2.xdj266r.x11i5rnm.xat24crx1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6.x3ajldb.x194ut8o.x1vzenxt.xd7ygy7.xt298gk.x1xhcax0.x1s928wv.x10pfhc2.x1j6awrg.x1v53gu8.x1tfg27r.xitxdhh');
        if (sendButton) {
          // Tạo sự kiện chuột
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
          });

          // Gửi sự kiện click đến nút
          sendButton.dispatchEvent(clickEvent);

          console.log("Đã nhấn vào nút gửi bình luận.");

          // Đóng popup sau khi gửi bình luận
          setTimeout(() => {
            closePopupIfPresent();
          }, 1000);
        } else {
          console.log("Không tìm thấy nút gửi bình luận.");
        }
      }, 500); // Đợi 500ms để nút gửi xuất hiện sau khi nhấn vào ô nhập liệu
    } else {
      console.log("Không tìm thấy ô nhập bình luận trong thẻ div.");
    }
  } else {
    console.log("Không tìm thấy thẻ div chứa ô nhập bình luận.");
  }
}

// Hàm kiểm tra xem phần tử có hiển thị hay không
function isElementVisible(element) {
  return element.offsetWidth > 0 && element.offsetHeight > 0 && window.getComputedStyle(element).visibility !== 'hidden';
}

// Hàm đóng popup nếu có
function closePopupIfPresent() {
  const closeButton = document.querySelector('[aria-label="Đóng"], [aria-label="Close"]'); // Kiểm tra cả "Đóng" và "Close"
  if (closeButton) {
    closeButton.click(); // Nhấn vào nút đóng
    console.log("Đã đóng popup.");
  } else {
    console.log("Không tìm thấy nút đóng popup.");
  }
}
