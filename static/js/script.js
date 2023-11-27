
function fillItemIdDropdown() {
    $.ajax({
        type: "GET",
        url: "/admin/menu_items",
        success: function (response) {
            // Clear existing options
            $("#edit-item-id").empty();

            // Заполняем выпадающий список с использованием данных из response
            if (response.menu_items) {
                $.each(response.menu_items, function (index, item) {
                    // Store item ID as a data attribute
                    $("#edit-item-id").append("<option value='" + item[0] + "' data-item-id='" + item[0] + "'>" + item[0] + ": " + item[1] + "</option>");
                });
            }
        },
        error: function (error) {
            console.log(error);
        }
    });
}

// Функция для удаления категории
function deleteCategory() {
    var categoryId = $("#category-id").val();

    // Запрос на удаление категории
    $.ajax({
        type: "POST",
        url: "/admin/menu_categories/delete",
        data: JSON.stringify({ "category_id": categoryId }),
        contentType: "application/json;charset=UTF-8",
        success: function (response) {
            updateMenuCategories()
        },
        error: function (error) {
            console.log(error);

            if (error.responseJSON && error.responseJSON.error === "Category not found") {
                alert("Категория с указанным ID не найдена.");
            } else {
                alert("Ошибка при удалении категории(проверьте правильно ли указан ID).");
            }
        }
    });
}


// Функция для выбора категории и заполнения текущего описания
function selectCategory() {
    var selectedCategory = $("#edit-category-id option:selected");
    var currentDescription = selectedCategory.data("category-description");

    // Заполняем текущее описание
    $("#edit-category-description").val(currentDescription);
}



function selectCategory() {
    var selectedCategory = $("#edit-category-id option:selected");
    var currentDescription = selectedCategory.data("category-description");

    // Заполняем текущее описание
    $("#edit-category-description").val(currentDescription);
}

// Вызываем fillCategoryIdDropdown при загрузке страницы
$(document).ready(function () {
    fillCategoryIdDropdown();
});

// Функция для обновления описания категории
function updateCategoryDescription() {
    var selectedCategory = $("#edit-category-id option:selected");
    var categoryId = selectedCategory.val();
    var newDescription = $("#edit-category-new-description").val();

    // Проверяем, что описание не пусто
    if (!newDescription.trim()) {
        alert("Введите новое описание категории.");
        return;
    }

    // Запрос на обновление описания категории
    $.ajax({
        type: "POST",
        url: "/admin/menu_categories/edit_description",
        data: JSON.stringify({ "category_id": categoryId, "new_description": newDescription }),
        contentType: "application/json;charset=UTF-8",
        success: function (response) {
            // Вывод ответа сервера в консоль для отладки
            console.log(response);

            // Обновление списка категорий после изменения
            if (response.success) {
                fillCategoryIdDropdown();  // Обновление выпадающего списка после изменения описания
                updateMenuCategories();  // Обновление таблицы категорий
            } else {
                alert("Ошибка при изменении описания категории: " + response.error);
            }
        },
        error: function (error) {
            console.log(error);
            alert("Ошибка при изменении описания категории.");
        }
    });
}


// Заполняет выпадающий список категорий в форме изменения описания категории
function fillCategoryIdDropdown() {
    $.ajax({
        type: "GET",
        url: "/admin/menu_categories",
        success: function (response) {
            var categoryDropdown = $("#edit-category-id");
            categoryDropdown.empty(); // Очистим существующие опции

            // Заполняем выпадающий список с использованием данных из response
            if (response.menu_categories) {
                $.each(response.menu_categories, function (index, category) {
                    categoryDropdown.append("<option value='" + category[0] + "' data-category-description='" + category[2] + "'>" + category[1] + "</option>");
                });
            }
        },
        error: function (error) {
            console.log(error);
        }
    });
}

// Вызываем fillCategoryIdDropdown при загрузке страницы
$(document).ready(function () {
    fillCategoryIdDropdown();
});


// Функция для удаления блюда
function deleteMenuItem() {
    var itemId = $("#item-id").val();

    // Запрос на удаление блюда
    $.ajax({
        type: "POST",
        url: "/admin/menu_items/delete",
        data: JSON.stringify({ "item_id": itemId }),
        contentType: "application/json;charset=UTF-8",
        success: function (response) {
            // Вывод ответа сервера в консоль для отладки
            console.log(response);

            // Обновление списка блюд после удаления
            if (response.success) {
                // Очищаем поле ввода
                $("#item-id").val("");

                // Обновляем таблицу блюд, повторно выполняя запрос для получения списка
                updateMenuItems();
            } else {
                alert("Ошибка при удалении блюда: " + response.error);
            }
        },
        error: function (error) {
            console.log(error);
            alert("Ошибка при удалении блюда.");
        }
    });
}

// Функция для обновления списка блюд
function updateMenuItems() {
    $.ajax({
        type: "GET",
        url: "/admin/menu_items",
        success: function (response) {
            // Вывод ответа сервера в консоль для отладки
            console.log(response);

            // Очищаем таблицу блюд
            $("#menu-items tbody").empty();

            // Обновляем таблицу блюд с использованием данных из response
            if (response.menu_items) {
                var menuItemsTable = $("#menu-items tbody");
                $.each(response.menu_items, function (index, item) {
                    menuItemsTable.append("<tr><td>" + item[0] + "</td><td>" + item[1] + "</td><td>" + item[2] + " сом</td><td class='category'>" + item[3] + "</td><td><button onclick='deleteMenuItemById(" + item[0] + ")'>Удалить</button></td></tr>");
                });
            }
        },
        error: function (error) {
            console.log(error);
        }
    });
}

function updateMenuCategories() {
    $.ajax({
        type: "GET",
        url: "/admin/menu_categories",
        success: function (response) {
            // Вывод ответа сервера в консоль для отладки
            console.log(response);

            // Очищаем таблицу категорий
            $("#menu-categories tbody").empty();

            // Обновляем таблицу категорий с использованием данных из response
            if (response.menu_categories) {
                var menuCategoriesTable = $("#menu-categories tbody");
                $.each(response.menu_categories, function (index, category) {
                    var description = category[2] ? category[2] : '';  // Если описание существует, используем его, иначе пустую строку
                    menuCategoriesTable.append("<tr><td>" + category[0] + "</td><td>" + category[1] + "</td><td>" + description + "</td></tr>");
                });
            }
        },
        error: function (error) {
            console.log(error);
        }
    });
}

function showEditForm(itemId, itemName, itemPrice, itemCategory) {
    // Заполнение формы данными о блюде
    $("#edit-item-name").val(itemName);
    $("#edit-item-price").val(itemPrice);
    $("#edit-item-category").val(itemCategory);

    // Отображение формы
    $("#edit-form").show();

    // Сохранение id блюда для использования при сохранении
    $("#edit-form").data("item-id", itemId);
}



function updateMenuItem() {
    var selectedOption = $("#edit-item-id option:selected");
    var itemId = selectedOption.data("item-id");
    var newName = $("#edit-item-name").val();
    var newPrice = $("#edit-item-price").val();
    var newCategory = $("#edit-item-category").val();

    $.ajax({
        type: "POST",
        url: "/admin/menu_items/edit",
        data: JSON.stringify({
            "item_id": itemId,
            "new_item_name": newName,
            "new_price": newPrice,
            "new_category": newCategory
        }),
        contentType: "application/json;charset=UTF-8",
        success: function (response) {
            // Вывод ответа сервера в консоль для отладки
            console.log(response);

            // Обновление списка блюд после изменения
            if (response.success) {
                updateMenuItems();
                // Do not hide the form here
            } else {
                alert("Ошибка при изменении блюда: " + response.error);
            }
        },
        error: function (error) {
            console.log(error);
            alert("Ошибка при изменении блюда.");
        }
    });
}

function deleteMenuItemById(itemId) {
    // Запрос на удаление блюда
    $.ajax({
        type: "POST",
        url: "/admin/menu_items/delete",
        data: JSON.stringify({ "item_id": itemId }),
        contentType: "application/json;charset=UTF-8",
        success: function (response) {
            // Вывод ответа сервера в консоль для отладки
            console.log(response);

            // Обновление списка блюд после удаления
            if (response.success) {
                updateMenuItems();
            } else {
                alert("Ошибка при удалении блюда: " + response.error);
            }
        },
        error: function (error) {
            console.log(error);
            alert("Ошибка при удалении блюда.");
        }
    });
}
// Добавление нового блюда
function addMenuItem() {
    var itemName = $("#new-item-name").val();
    var price = $("#new-item-price").val();
    var categoryId = $("#new-item-category").val();

    $.ajax({
        type: "POST",
        url: "/admin/add_menu_item",
        data: JSON.stringify({ "item_name": itemName, "price": price, "category_id": categoryId }),
        contentType: "application/json;charset=UTF-8",
        success: function (response) {
            if (response.success) {
                // Обновите список блюд после успешного добавления
                updateMenuItems();
            } else {
                alert("Ошибка при добавлении блюда: " + response.error);
            }
        },
        error: function (error) {
            console.log(error);
            alert("Ошибка при добавлении блюда.");
        }
    });
}


// Функция для добавления новой категории
function addMenuCategory() {
    var categoryName = $("#new-category-name").val();
    var description = $("#new-category-description").val();

    $.ajax({
        type: "POST",
        url: "/admin/add_menu_category",
        data: JSON.stringify({ "category_name": categoryName, "description": description }),
        contentType: "application/json;charset=UTF-8",
        success: function (response) {
            console.log("Server response:", response);  // Отладочный вывод

            if (response.success) {
                updateMenuCategories();
            } else {
                alert("Ошибка при добавлении категории: " + response.error);
            }
        },
        error: function (error) {
            console.log(error);
            alert("Ошибка при добавлении категории.");
        }
    });
}

// Заполняет выпадающий список категорий в форме добавления блюда
function fillCategoryDropdown() {
    $.ajax({
        type: "GET",
        url: "/admin/menu_categories",
        success: function (response) {
            var categoryDropdown = $("#new-item-category");
            categoryDropdown.empty(); // Очистим существующие опции

            // Заполняем выпадающий список с использованием данных из response
            if (response.menu_categories) {
                $.each(response.menu_categories, function (index, category) {
                    categoryDropdown.append("<option value='" + category[0] + "'>" + category[1] + "</option>");
                });
            }
        },
        error: function (error) {
            console.log(error);
        }
    });
}

$(document).ready(function () {
    // Заполняем выпадающие списки при загрузке страницы
    fillCategoryDropdown();
    fillItemIdDropdown();

    // Обновляем таблицы исходными данными
    updateMenuItems();
    updateMenuCategories();

    // Добавляем обработчики событий для кнопок
    $("#add-item-button").on("click", addMenuItem);
    $("#delete-item-button").on("click", deleteMenuItem);
    $("#edit-item-button").on("click", updateMenuItem);
    $("#add-category-button").on("click", addMenuCategory);
    $("#delete-category-button").on("click", deleteCategory);
});



// static/js/couriers.js

document.addEventListener("DOMContentLoaded", function () {
    // Вызываем функцию для отображения курьеров при загрузке страницы
    updateCouriersList();



    // Функция для обновления списка курьеров
    function updateCouriersList() {
        fetch("/admin/couriers", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(response => response.json())
            .then(data => {
                // Получаем элемент tbody таблицы
                const tableBody = document.querySelector("#couriers-table tbody");

                // Очищаем текущий список курьеров в таблице
                tableBody.innerHTML = "";

                // Перебираем полученные данные и добавляем строки в таблицу
                data.couriers_info.forEach(courier => {
                    const row = tableBody.insertRow();

                    // Добавляем ячейки с информацией о курьере
                    const idCell = row.insertCell(0);
                    idCell.textContent = courier[0];

                    const nameCell = row.insertCell(1);
                    nameCell.textContent = courier[1];

                    const phoneCell = row.insertCell(2);
                    phoneCell.textContent = courier[2];

                    const interviewCell = row.insertCell(3);
                    interviewCell.textContent = courier[3] ? "Да" : "Нет";
                });

                // После обновления списка курьеров, обновляем выпадающие списки для удаления и изменения
                updateCourierDropdown();
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }


    // ... (остальной код)

    // Функция для изменения информации о курьере
    function editCourier() {
        const selectedCourierId = document.getElementById("edit-courier-select").value;
        const newName = document.getElementById("edit-courier-name").value;
        const newPhone = document.getElementById("edit-courier-phone").value;
        const newInterviewPassed = document.getElementById("edit-interview-passed").value;

        fetch("/admin/edit_courier", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                courier_id: selectedCourierId,
                new_name: newName,
                new_phone: newPhone,
                new_interview_passed: newInterviewPassed,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // После успешного изменения обновляем таблицу и выпадающий список
                    updateCouriersList();
                } else {
                    console.error("Error:", data.error);
                }
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }

    // ... (остальной код)

    // Функция для обновления выпадающего списка
    function updateCourierDropdown() {
        fetch("/admin/couriers", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(response => response.json())
            .then(data => {
                const deleteCourierSelect = document.getElementById("delete-courier-select");

                // Очищаем текущий список
                deleteCourierSelect.innerHTML = "";

                // Добавляем опции в список
                data.couriers_info.forEach(courier => {
                    const option = document.createElement("option");
                    option.value = courier[0];  // ID курьера
                    option.textContent = courier[1];  // Имя курьера
                    deleteCourierSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }

    // ... (остальной код)



    // Функция для добавления нового курьера
    function addCourier() {
        const name = document.getElementById("courier-name").value;
        const phone = document.getElementById("courier-phone").value;
        const interviewPassed = document.getElementById("interview-passed").value;

        fetch("/admin/add_courier", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                courier_name: name,
                phone_num: phone,  // Используйте правильное имя поля
                offline_interview_passed: interviewPassed,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // После успешного добавления обновляем таблицу
                    updateCouriersList();
                } else {
                    console.error("Error:", data.error);
                }
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }

    // Функция для удаления курьера
    function deleteCourier() {
        const selectedCourierId = document.getElementById("delete-courier-select").value;

        fetch("/admin/delete_courier", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                courier_id: selectedCourierId,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // После успешного удаления обновляем таблицу
                    updateCouriersList();
                } else {
                    console.error("Error:", data.error);
                }
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }



    // Обновляем список курьеров в выпадающем списке при загрузке страницы
    updateCourierDropdown();

    // Добавляем обработчик события для кнопки изменения информации о курьере
    document.getElementById("edit-courier-btn").addEventListener("click", editCourier);

    // Добавляем обработчик события для кнопки удаления курьера
    document.getElementById("delete-courier-btn").addEventListener("click", deleteCourier);

    // Добавляем обработчик события для кнопки добавления курьера
    document.getElementById("add-courier-btn").addEventListener("click", addCourier);

});



// static/js/promotions.js

document.addEventListener("DOMContentLoaded", function () {
    // Вызываем функцию для отображения промокодов при загрузке страницы
    updatePromotionsList();


    // Функция для обновления списка промокодов
    function updatePromotionsList() {
        fetch("/admin/promotions_data", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(response => response.json())
            .then(data => {
                // Получаем элемент tbody таблицы
                const tableBody = document.querySelector("#promotions-table tbody");

                // Очищаем текущий список промокодов в таблице
                tableBody.innerHTML = "";

                // Проверяем, что data.promotions_data существует и является массивом
                if (data.promotions_data && Array.isArray(data.promotions_data)) {
                    // Перебираем полученные данные и добавляем строки в таблицу
                    data.promotions_data.forEach(promotion => {
                        const row = tableBody.insertRow();

                        // Добавляем ячейки с информацией о промокоде
                        const idCell = row.insertCell(0);
                        idCell.textContent = promotion[0];

                        const promoCodeCell = row.insertCell(1);
                        promoCodeCell.textContent = promotion[1];

                        const discountAmountCell = row.insertCell(2);
                        discountAmountCell.textContent = promotion[2];

                        // Добавляем кнопку для удаления промокода
                        const actionsCell = row.insertCell(3);
                        const deleteButton = document.createElement("button");
                        deleteButton.textContent = "Удалить";
                        deleteButton.addEventListener("click", function () {
                            deletePromotion(promotion[0]);  // Передаем ID промокода для удаления
                        });
                        actionsCell.appendChild(deleteButton);
                    });
                } else {
                    console.error("Invalid data format:", data);
                }
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }



    // Функция для удаления промокода
    function deletePromotion(promotionId) {
        fetch("/admin/delete_promotion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                promotion_id: promotionId,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // После успешного удаления обновляем таблицу
                    updatePromotionsList();
                } else {
                    console.error("Error:", data.error);
                }
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }

    // Функция для добавления нового промокода
    function addPromotion() {
        const promoCode = document.getElementById("promo-code").value;
        const discountAmount = document.getElementById("discount-amount").value;

        fetch("/admin/add_promotion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                promo_code: promoCode,
                discount_amount: discountAmount,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // После успешного добавления обновляем список промокодов
                    fillDropDownPromo();
                    updatePromotionsList()
                } else {
                    console.error("Error:", data.error);
                }
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }


    // Функция для заполнения выпадающего списка промокодов
    function fillDropDownPromo() {
        fetch("/admin/promotions_data", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(response => response.json())
            .then(data => {
                const promoSelect = document.getElementById("promo-select");

                // Очищаем текущий список
                promoSelect.innerHTML = "";

                // Проверяем, что data.promotions_data существует и является массивом
                if (data.promotions_data && Array.isArray(data.promotions_data)) {
                    // Добавляем опции в список
                    data.promotions_data.forEach(promotion => {
                        const option = document.createElement("option");
                        option.value = promotion[0];  // ID промокода
                        option.textContent = promotion[1];  // Значение промокода
                        promoSelect.appendChild(option);
                    });
                } else {
                    console.error("Invalid data format:", data);
                }
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }

    // Добавляем обработчик события для кнопки применения промокода
    document.getElementById("apply-promo-btn").addEventListener("click", function () {
        // Ваша логика применения промокода
        const selectedPromoId = document.getElementById("promo-select").value;
        console.log("Selected Promo ID:", selectedPromoId);
    });

    // Вызываем функцию для заполнения выпадающего списка промокодов при загрузке страницы
    fillDropDownPromo();



    // Добавляем обработчик события для кнопки добавления промокода
    document.getElementById("add-promotion-btn").addEventListener("click", addPromotion);
});



// -------------------------ФИЛИАЛЫ-------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    updateBranchesList();
    document.getElementById("add-branch-btn").addEventListener("click", addBranch);
    document.getElementById("edit-branch-btn").addEventListener("click", editBranch);


    // Функция для обновления списка филиалов
    function updateBranchesList() {
        fetch("/admin/branches_data", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(response => response.json())
            .then(data => {
                // Получаем элемент tbody таблицы
                const tableBody = document.querySelector("#branches-table tbody");

                // Очищаем текущий список филиалов в таблице
                tableBody.innerHTML = "";

                // Перебираем полученные данные и добавляем строки в таблицу
                data.branches_data.forEach(branch => {
                    const row = tableBody.insertRow();

                    // Добавляем ячейки с информацией о филиале
                    const idCell = row.insertCell(0);
                    idCell.textContent = branch[0];

                    const nameCell = row.insertCell(1);
                    nameCell.textContent = branch[1];

                    const locationCell = row.insertCell(2);
                    locationCell.textContent = branch[2];

                    // Добавляем кнопку для удаления филиала
                    const actionsCell = row.insertCell(3);
                    const deleteButton = document.createElement("button");
                    deleteButton.textContent = "Удалить";
                    deleteButton.addEventListener("click", function () {
                        deleteBranch(branch[0]);  // Передаем ID филиала для удаления
                    });
                    actionsCell.appendChild(deleteButton);
                });
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }

    // Функция для удаления филиала
    function deleteBranch(branchId) {
        fetch("/admin/delete_branch", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                branch_id: branchId,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // После успешного удаления обновляем список филиалов
                    updateBranchesList();
                } else {
                    console.error("Error:", data.error);
                }
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }

    // Функция для добавления филиала
    function addBranch() {
        const name = document.getElementById("branch-name").value;
        const location = document.getElementById("branch-location").value;

        fetch("/admin/add_branch", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                branch_name: name,
                location: location,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // После успешного добавления обновляем список филиалов
                    updateBranchesList();
                } else {
                    console.error("Error:", data.error);
                }
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }

    // Функция для изменения информации о филиале
    function editBranch() {
        const selectedBranchId = document.getElementById("edit-branch-id").value;
        const newName = document.getElementById("edit-branch-name").value;
        const newLocation = document.getElementById("edit-branch-location").value;

        fetch("/admin/edit_branch", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                branch_id: selectedBranchId,
                new_name: newName,
                new_location: newLocation,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // После успешного изменения обновляем таблицу
                    updateBranchesList();
                } else {
                    console.error("Error:", data.error);
                }
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }



});

// ---------------------------ЗАКАЗЫ--------------------------------
document.addEventListener("DOMContentLoaded", function () {
    // Вызываем функцию для отображения заказов при загрузке страницы
    updateOrdersList();

    // Функция для обновления списка заказов
    function updateOrdersList() {
        fetch("/admin/orders_data", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(response => response.json())
            .then(data => {
                // Получаем элемент tbody таблицы
                const tableBody = document.querySelector("#orders-table tbody");

                // Очищаем текущий список заказов в таблице
                tableBody.innerHTML = "";

                // Перебираем полученные данные и добавляем строки в таблицу
                data.orders_data.forEach(order => {
                    const row = tableBody.insertRow();

                    // Добавляем ячейки с информацией о заказе
                    const idCell = row.insertCell(0);
                    idCell.textContent = order[0];

                    const customerNameCell = row.insertCell(1);
                    customerNameCell.textContent = order[1];

                    const orderTimeCell = row.insertCell(2);
                    orderTimeCell.textContent = order[2];

                    const statusCell = row.insertCell(3);
                    statusCell.textContent = order[3] === 0 ? "Активен" : "Отменен";

                    // Добавляем кнопку для удаления заказа
                    const actionsCell = row.insertCell(4);
                    const deleteButton = document.createElement("button");
                    deleteButton.textContent = "Удалить";
                    deleteButton.addEventListener("click", function () {
                        deleteOrder(order[0]);  // Передаем ID заказа для удаления
                    });
                    actionsCell.appendChild(deleteButton);
                });
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }

    // Функция для удаления заказа
    function deleteOrder(orderId) {
        fetch("/admin/delete_order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                order_id: orderId,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // После успешного удаления обновляем таблицу заказов
                    updateOrdersList();
                } else {
                    console.error("Error:", data.error);
                }
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }
});


// // Универсальная функция для очистки полей ввода формы
// function clearFormInputs(formId) {
//     const form = document.getElementById(formId);
//     if (form) {
//         // Находим все элементы ввода внутри формы и устанавливаем их значения в пустую строку
//         const inputElements = form.querySelectorAll('input, select');
//         inputElements.forEach(input => {
//             input.value = "";
//         });
//     }
// }

// // Пример использования:
// clearFormInputs("edit-courier-form");
