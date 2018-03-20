
var testo = document.querySelectorAll('input[type=text]');
var email = document.getElementById("email");
var form = document.getElementById("form-registrazione");
var error = document.querySelector('.error');

testo.addEventListener("input", function (event) {
        // Each time the user types something, we check if the
        // email field is valid.
        if (testo.validity.valid) {
                // In case there is an error message visible, if the field
                // is valid, we remove the error message.
                error.innerHTML = ""; // Reset the content of the message
                error.className = "error"; // Reset the visual state of the message
        }
}, false);

email.addEventListener("input", function (event) {
        // Each time the user types something, we check if the
        // email field is valid.
        if (email.validity.valid) {
                // In case there is an error message visible, if the field
                // is valid, we remove the error message.
                error.innerHTML = ""; // Reset the content of the message
                error.className = "error"; // Reset the visual state of the message
        }
}, false);

form.addEventListener("submit", function (event) {
        // Each time the user tries to send the data, we check
        // if the email field is valid.
        if (!testo.validity.valid || !email.validity.valid) {

                // If the field is not valid, we display a custom
                // error message.
                error.innerHTML = "dati non corretti!";
                error.className = "error active";
                // And we prevent the form from being sent by canceling the event
                event.preventDefault();
        }
}, false);

