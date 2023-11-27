// login.js
$(document).ready(function () {
    $('#login-form').submit(function (e) {
        e.preventDefault();

        // Collect form data
        var formData = {
            username: $('#username').val(),
            password: $('#password').val()
        };

        // Send AJAX request
        $.ajax({
            type: 'POST',
            url: '/login',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify(formData),
            success: function (response) {
                if (response.success) {
                    window.location.href = '/admin';
                } else {
                    alert('Invalid username or password');
                }
            },
            error: function () {
                alert('Error during login');
            }
        });
    });
});
