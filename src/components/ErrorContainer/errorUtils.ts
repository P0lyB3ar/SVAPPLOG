// errorUtils.ts
export const showError = (message: string) => {
    const errorContainer = document.getElementById('errorMessages');
    const errorText = errorContainer?.querySelector('.error-text');
    if (errorContainer && errorText) {
        errorText.textContent = 'Error: ' + message;
        errorContainer.style.display = 'block';
    }
};
