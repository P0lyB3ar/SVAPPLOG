import "./ErrorContainer.css";


function ErrorContainer() {

    const closeError = () => {
        const errorContainer = document.getElementById('errorMessages');
        if (errorContainer) {
            errorContainer.style.display = 'none';
        }
    };

    

    return (
        <div id="errorMessages" className="error-container">
            <span className="close-btn" onClick={closeError}>x</span>
            <p className="error-text"></p>
        </div>
    );
}

export default ErrorContainer;
