window.addEventListener("DOMContentLoaded", initTodo);

function initTodo() {
  const TODO_STORE_KEY = "app_todo";
  const todoForm = document.querySelector("#todoForm");
  const todoInput = document.querySelector("#todoInput");
  const todoList = document.querySelector("#todoList");
  const todoSearch = document.querySelector("#todoSearch");
  const todoSearchInput = document.querySelector("#todoSearchInput");

  let editIndicator = false;
  let renderedTodoList = [];

  loadTodoList();
  initSearch();
  renderTodoList(renderedTodoList);
  createTodoItem();

  function loadTodoList() {
    const data = localStorage.getItem(TODO_STORE_KEY);
    if (data) {
      renderedTodoList = JSON.parse(data);
    }
  }

  function syncTodoList() {
    localStorage.setItem(TODO_STORE_KEY, JSON.stringify(renderedTodoList));
  }

  function renderTodoList(listArg) {
    todoList.innerHTML = "";

    for (let item of listArg) {
      if (item !== null && item.title !== undefined) {
        const todoItemWrap = document.createElement("div");
        todoItemWrap.classList.add("todo__item-wrap");

        const todoItem = document.createElement("div");
        todoItem.classList.add("todo__item");
        todoItem.style.borderColor = item.borderColor;

        todoItem.dataset.id = item.id;

        const todoItemText = document.createElement("div");
        todoItemText.classList.add("todo__item-text");
        todoItemText.textContent = item.title;

        const todoItemSaveBtn = document.createElement("button");
        todoItemSaveBtn.classList.add("todo__item-save");
        todoItemSaveBtn.textContent = "Save";
        todoItemSaveBtn.style.display = "none";

        const todoItemDeleteBtn = document.createElement("button");
        todoItemDeleteBtn.classList.add("todo__item-delete");

        const todoItemDeleteBtnThumb = document.createElement("span");
        todoItemDeleteBtnThumb.classList.add("todo__item-delete-thumb");

        todoList
          .appendChild(todoItemWrap)
          .appendChild(todoItem)
          .append(todoItemText, todoItemSaveBtn, todoItemDeleteBtn);
        todoItemDeleteBtn.appendChild(todoItemDeleteBtnThumb);
      }
    }

    deleteTodoItems();
    editTodoItems();
  }

  function createTodoItem() {
    todoForm.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!todoInput.value) {
        return;
      }

      let newTask = {
        id: Date.now(),
        title: todoInput.value,
        borderColor: "#" + Math.floor(Math.random() * 16777215).toString(16)
      };

      renderedTodoList.push(newTask);
      todoInput.value = "";

      syncTodoList();
      loadTodoList();
      renderTodoList(renderedTodoList);
      toggleSearchState();
    });
  }

  function deleteTodoItems() {
    todoList.addEventListener("click", (e) => {
      if (
        !e.target.classList.contains("todo__item-delete") &&
        !e.target.classList.contains("todo__item-delete-thumb")
      ) {
        return;
      }

      const itemToBeDeleted = e.target.closest(".todo__item");

      let deletedIndex = renderedTodoList.findIndex(
        (item) => item.id.toString() === itemToBeDeleted.dataset.id
      );

      if (deletedIndex === -1) {
        return;
      }

      renderedTodoList.splice(deletedIndex, 1);

      syncTodoList();
      loadTodoList();
      renderTodoList(renderedTodoList);
      toggleSearchState();
    });
  }

  function editTodoItems() {
    todoList.addEventListener("dblclick", (e) => {
      if (editIndicator === true) {
        return;
      }
      let editedItem;

      if (e.target.classList.contains("todo__item")) {
        editedItem = e.target;
      } else if (e.target.classList.contains("todo__item-text")) {
        editedItem = e.target.closest(".todo__item");
      } else {
        return;
      }

      editedItem.firstElementChild.setAttribute("contenteditable", "true");

      editedItem.firstElementChild.focus();

      editIndicator = true;

      const deleteBtn = editedItem.querySelector(".todo__item-delete");
      const saveBtn = editedItem.querySelector(".todo__item-save");

      deleteBtn.style.display = "none";
      saveBtn.style.display = "block";

      saveBtn.addEventListener("click", () => {
        let editedIndex = renderedTodoList.findIndex(
          (item) => item.id.toString() === editedItem.dataset.id
        );

        if (editedIndex === -1) {
          return;
        }

        renderedTodoList[editedIndex].title =
          editedItem.firstElementChild.textContent;

        editedItem.firstElementChild.setAttribute("contenteditable", "false");

        deleteBtn.style.display = "flex";
        saveBtn.style.display = "none";

        editIndicator = false;
        syncTodoList();
        loadTodoList();
        renderTodoList(renderedTodoList);
      });
    });
  }

  function initSearch() {
    if (!toggleSearchState()) {
      return;
    }
    todoSearchInput.addEventListener("input", (e) => {
      if (e.target.value !== "") {
        getSearchValues(e.target.value);
      } else {
        renderTodoList(renderedTodoList);
      }
    });
  }

  function toggleSearchState() {
    if (renderedTodoList.length === 0) {
      todoSearch.style.display = "none";
      return false;
    } else {
      todoSearch.style.display = "block";
      return true;
    }
  }

  function getSearchValues(value) {
    let notFound = todoSearch.querySelector(".todo__notfound");
    let filteredTodoList = [];

    for (let item of renderedTodoList) {
      if (item.title.toLowerCase().includes(value)) {
        if (filteredTodoList.includes(item)) {
          return;
        }
        filteredTodoList.push(item);
      }
    }

    if (filteredTodoList.length == 0 && value !== "") {
      notFound.style.display = "block";
    } else {
      notFound.style.display = "none";
    }

    return renderTodoList(filteredTodoList);
  }
}
