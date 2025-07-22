import { getPosts } from "./api.js";
import { renderAddPostPageComponent } from "./components/add-post-page-component.js";
import { renderAuthPageComponent } from "./components/auth-page-component.js";
import {
  ADD_POSTS_PAGE,
  AUTH_PAGE,
  LOADING_PAGE,
  POSTS_PAGE,
  USER_POSTS_PAGE,
} from "./routes.js";
import { renderPostsPageComponent } from "./components/posts-page-component.js";
import { renderLoadingPageComponent } from "./components/loading-page-component.js";
import { renderUserPostsPageComponent } from "./components/user-posts-page-component.js";
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveUserToLocalStorage,
} from "./helpers.js";
import { getUserPosts } from "./api.js";

export let user = getUserFromLocalStorage();
export let page = null;
export let posts = [];
let data = null; // Добавляем переменную для хранения данных между переходами

export const setPosts = (newPosts) => {
  posts = newPosts;
};

export const getToken = () => {
  const token = user ? `Bearer ${user.token}` : undefined;
  return token;
};

export const logout = () => {
  user = null;
  removeUserFromLocalStorage();
  goToPage(POSTS_PAGE);
};

export const goToPage = (newPage, newData) => {
  data = newData; // Сохраняем данные для использования в renderApp
  
  if (
    [
      POSTS_PAGE,
      AUTH_PAGE,
      ADD_POSTS_PAGE,
      USER_POSTS_PAGE,
      LOADING_PAGE,
    ].includes(newPage)
  ) {
    if (newPage === ADD_POSTS_PAGE) {
      page = user ? ADD_POSTS_PAGE : AUTH_PAGE;
      return renderApp();
    }

    if (newPage === POSTS_PAGE) {
      page = LOADING_PAGE;
      renderApp();

      return getPosts({ token: getToken() })
        .then((newPosts) => {
          page = POSTS_PAGE;
          posts = newPosts;
          renderApp();
        })
        .catch((error) => {
          console.error(error);
          goToPage(POSTS_PAGE);
        });
    }

    if (newPage === USER_POSTS_PAGE) {
      if (!data?.userId) {
        console.error("Не передан userId");
        return goToPage(POSTS_PAGE);
      }

      page = LOADING_PAGE;
      renderApp();

      return getUserPosts(data.userId, getToken())
        .then((newPosts) => {
          page = USER_POSTS_PAGE;
          posts = newPosts;
          renderApp();
        })
        .catch((error) => {
          console.error(error);
          goToPage(POSTS_PAGE);
        });
    }

    page = newPage;
    renderApp();
    return;
  }

  throw new Error("страницы не существует");
};

const renderApp = () => {
  const appEl = document.getElementById("app");
  
  if (page === LOADING_PAGE) {
    return renderLoadingPageComponent({
      appEl,
      user,
      goToPage,
    });
  }

  if (page === AUTH_PAGE) {
    return renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        user = newUser;
        saveUserToLocalStorage(user);
        goToPage(POSTS_PAGE);
      },
      user,
      goToPage,
    });
  }

  if (page === ADD_POSTS_PAGE) {
    return renderAddPostPageComponent({
      appEl,
      onAddPostClick({ description, imageUrl }) {
        addPost({
          description,
          imageUrl,
          token: getToken(),
        })
          .then((newPost) => {
            // Добавляем новый пост в начало списка
            posts = [newPost, ...posts];
            goToPage(POSTS_PAGE);
          })
          .catch((error) => {
            alert("Не удалось добавить пост");
          });
      },
    });
  }

  if (page === POSTS_PAGE) {
    return renderPostsPageComponent({
      appEl,
    });
  }

  if (page === USER_POSTS_PAGE) {
    return renderUserPostsPageComponent({
      appEl,
      userId: data?.userId,
    });
  }
};

goToPage(user ? POSTS_PAGE : AUTH_PAGE);