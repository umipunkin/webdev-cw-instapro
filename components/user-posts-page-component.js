import { getUserPosts } from "../api.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, getToken, setPosts, user } from "../index.js";
import { dislikePost, likePost } from "../api.js";

export function renderUserPostsPageComponent({ appEl, userId }) {
  const token = getToken();

  // Функция для рендеринга постов пользователя
  const renderPosts = (userPosts) => {
    let postItemsHtml = "";
    
    const getPostHtml = (post) => {
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
            ${window.dateFns.formatDistanceToNow(postDate, {
              addSuffix: true,
              locale: window.dateFns.locale.ru,
            })}
          </p>
        </li>
      `;
    };

    userPosts.forEach((post) => {
      postItemsHtml += getPostHtml(post);
    });

    const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
        <div class="posts-user-header">
          <img src="${userPosts[0]?.user.imageUrl || ''}" class="posts-user-header__user-image">
          <p class="posts-user-header__user-name">${userPosts[0]?.user.name || 'Пользователь'}</p>
        </div>
        <ul class="posts">
          ${postItemsHtml || '<p>Пользователь еще не опубликовал ни одного поста</p>'}
        </ul>
      </div>
    `;

    appEl.innerHTML = appHtml;

    renderHeaderComponent({
      element: document.querySelector(".header-container"),
    });

    // Обработчики лайков
    for (let likeButtonEl of document.querySelectorAll(".like-button")) {
      likeButtonEl.addEventListener("click", function () {
        if (!token) {
          alert("Необходимо авторизоваться");
          return;
        }

        const post = userPosts.find(
          (post) => post.id === likeButtonEl.dataset.postId
        );

        if (!post) return;

        if (post.isLiked) {
          dislikePost(post.id, token).then((res) => {
            setPosts(posts.map((p) => (p.id === res.post.id ? res.post : p)));
            renderPosts(userPosts.map((p) => (p.id === res.post.id ? res.post : p)));
          });
        } else {
          likePost(post.id, token).then((res) => {
            setPosts(posts.map((p) => (p.id === res.post.id ? res.post : p)));
            renderPosts(userPosts.map((p) => (p.id === res.post.id ? res.post : p)));
          });
        }
      });
    }

    // Обработчики кликов на хедер поста (для перехода к другим пользователям)
    for (let userEl of document.querySelectorAll(".post-header")) {
      userEl.addEventListener("click", () => {
        goToPage(USER_POSTS_PAGE, {
          userId: userEl.dataset.userId,
        });
      });
    }
  };

  // Показываем заглушку загрузки
  appEl.innerHTML = `
    <div class="page-container">
      <div class="header-container"></div>
      <div class="loading-page">
        <div class="loader"><div></div><div></div><div></div></div>
      </div>
    </div>
  `;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  // Загружаем посты пользователя
  getUserPosts(userId, token)
    .then((userPosts) => {
      renderPosts(userPosts);
    })
    .catch((error) => {
      console.error(error);
      appEl.innerHTML = `
        <div class="page-container">
          <div class="header-container"></div>
          <div class="error-message">Ошибка при загрузке постов пользователя</div>
        </div>
      `;
      renderHeaderComponent({
        element: document.querySelector(".header-container"),
      });
    });
}