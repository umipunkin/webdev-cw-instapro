import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, getToken, setPosts } from "../index.js";
import { dislikePost, likePost } from "../api.js";

export function renderPostsPageComponent({ appEl }) {
  // @TODO: реализовать рендер постов из api
  console.log("Актуальный список постов:", posts);
  /**
   * @TODO: чтобы отформатировать дату создания поста в виде "19 минут назад"
   * можно использовать https://date-fns.org/v2.29.3/docs/formatDistanceToNow
   */
  const token = getToken();

  let postItemsHtml = "";
  const getOncePostHtml = (post) => {
    const postDate = new Date(post.createdAt);
    return `
      <li class="post">
        <div class="post-header" data-user-id="${post.user.id}">
            <img src="${post.user.imageUrl}" class="post-header__user-image">
            <p class="post-header__user-name">${post.user.name}</p>
        </div>
        <div class="post-image-container">
          <img class="post-image" src="${post.imageUrl}">
        </div>
        <div class="post-likes">
          <button data-post-id="${post.id}" class="like-button">
            <img src="./assets/images/${
              post.isLiked ? "like-active.svg" : "like-not-active.svg"
            }">
          </button>
          <p class="post-likes-text">
            Нравится: <strong>${
              post.likes.length ? post.likes[0].name : 0
            }</strong>
            ${
              post.likes.length > 1
                ? `и <strong>${post.likes.length - 1}</strong>`
                : ""
            }
          </p>
        </div>
        <p class="post-text">
          <span class="user-name">${post.user.name}</span>
          ${post.description}
        </p>
        <p class="post-date">
          ${dateFns.formatDistanceToNow(postDate, {
            addSuffix: true,
            locale: dateFns.locale.ru,
          })}
        </p>
      </li>
    `;
  };
  posts.forEach((post) => {
    postItemsHtml += getOncePostHtml(post);
  });

  const appHtml = `
              <div class="page-container">
                <div class="header-container"></div>
                <ul class="posts">
                  ${postItemsHtml}
                </ul>
              </div>`;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  // Функционал лайков
  for (let likeButtonEl of document.querySelectorAll(".like-button")) {
    likeButtonEl.addEventListener("click", function () {
      if (!token) {
        alert("Необходимо авторизироывться");
        return;
      }

      const post = posts.find(
        (post) => post.id === likeButtonEl.dataset.postId
      );

      const postEl = this.closest(".post");
      const likeCountEl = postEl.querySelector(".post-likes-text");
      const likeImageEl = postEl.querySelector(".like-button > img");

      if (!post) {
        return;
      }

      if (post.isLiked) {
        dislikePost(likeButtonEl.dataset.postId, token).then((res) => {
          likeCountEl.innerHTML = `Нравится: <strong>${
            res.post.likes.length ? res.post.likes[0].name : 0
          }</strong>
            ${
              res.post.likes.length > 1
                ? `и <strong>${res.post.likes.length - 1}</strong>`
                : ""
            }`;
          likeImageEl.setAttribute(
            "src",
            "./assets/images/like-not-active.svg"
          );

          postEl.outerHtml = getOncePostHtml(res.post);
          setPosts(
            posts.map((current) =>
              current.id == res.post.id ? res.post : current
            )
          );
        });
      } else {
        likePost(likeButtonEl.dataset.postId, token).then((res) => {
          likeCountEl.innerHTML = `Нравится: <strong>${
            res.post.likes.length ? res.post.likes[0].name : 0
          }</strong>
            ${
              res.post.likes.length > 1
                ? `и <strong>${res.post.likes.length - 1}</strong>`
                : ""
            }`;
          likeImageEl.setAttribute("src", "./assets/images/like-active.svg");
          setPosts(
            posts.map((current) =>
              current.id == res.post.id ? res.post : current
            )
          );
        });
      }
    });
  }

  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  }
}
