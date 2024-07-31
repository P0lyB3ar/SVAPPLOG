document.getElementById('registerBtn').addEventListener('click', function() {
    var spinner = document.getElementById('spinner');
    spinner.style.display = 'block'; // Show spinner

    // Simulate an action, e.g., form submission and page load
    setTimeout(function() {
        // Replace this with actual page redirection or form submission
        window.location.href = "index.html";
    }, 2000); // Simulate a 2 second delay for the action
});
