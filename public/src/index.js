document.getElementById('fetchButton').addEventListener('click', function() {
    const sortValue = document.getElementById('type').value;
    
    const url = `http://localhost:8000/read?logs=all&dict=v1&sort=${sortValue}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        })
        .catch(error => {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = '<p style="color: red;">Error: ' + error.message + '</p>';
        });
});