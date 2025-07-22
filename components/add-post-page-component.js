import { renderUploadImageComponent } from "./upload-image-component.js";
import { getToken, goToPage } from "../index.js";
import { addPost } from "../api.js";
import { POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js"



export function renderAddPostPageComponent({ appEl }) {
  let imageUrl = "";
  let description = "";

  const render = () => {
    const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <div class="form">
        <h3 class="form-title">Добавить пост</h3>
        <div class="form-inputs">
          <div class="upload-image-container"></div>
          <textarea 
            id="description-input" 
            class="input textarea" 
            placeholder="Описание поста"
          ></textarea>
          <div class="form-error"></div>
          <button class="button" id="add-button">Добавить</button>
        </div>
      </div>
    </div>
    `;

    appEl.innerHTML = appHtml;

    renderHeaderComponent({
      element: document.querySelector(".header-container"),
    });

    // Компонент загрузки изображения
    renderUploadImageComponent({
      element: document.querySelector(".upload-image-container"),
      onImageUrlChange(newImageUrl) {
        imageUrl = newImageUrl;
      },
    });

    // Обработчик ввода описания
    document
      .getElementById("description-input")
      .addEventListener("input", (e) => {
        description = e.target.value;
      });

    // Обработчик кнопки добавления
    document.getElementById("add-button").addEventListener("click", () => {
      if (!imageUrl) {
        alert("Не выбрано изображение");
        return;
      }

      if (!description.trim()) {
        alert("Введите описание поста");
        return;
      }

      addPost({
        description: description.trim(),
        imageUrl,
        token: getToken(),
      })
        .then(() => {
          goToPage(POSTS_PAGE);
        })
        .catch((error) => {
          document.querySelector(".form-error").textContent =
            "Ошибка при добавлении поста";
        });
    });
  };

  render();
}
