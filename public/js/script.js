document.addEventListener('DOMContentLoaded', function () {
    const promptForm = document.getElementById('prompt-form');
    const promptInput = document.getElementById('prompt-input');
    const submitButton = promptForm.querySelector('button[type="submit"]');
    const stopButton = document.getElementById('stop-button');

    let isProcessing = false;
    let abortController = null;

    promptForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        if (isProcessing) {
            return;
        }

        // Initialize the AbortController for this request
        abortController = new AbortController();
        const signal = abortController.signal;

        // Set the processing flag to true
        isProcessing = true;

        // Disable the input, submit button, and enable the stop button
        promptInput.disabled = true;
        submitButton.disabled = true;
        stopButton.disabled = false;

        const prompt = promptInput.value;

        // Create a new div for this prompt and response
        const responseContainer = document.createElement('div');
        responseContainer.className = 'response-container';
        const outputElement = document.getElementById('output');
        outputElement.appendChild(responseContainer);

        // Display the prompt in bold dark letters on a new line
        const promptElement = document.createElement('div');
        promptElement.textContent = `${prompt}`;
        promptElement.style.fontWeight = 'bold';
        promptElement.style.color = 'red';  // Dark color
        responseContainer.appendChild(promptElement);

        // Scroll the output container to the bottom after adding new content
        const scrollToBottom = () => {
            outputElement.scrollTop = outputElement.scrollHeight;
        };

        try {
            // Fetch the response with the abort signal
            const response = await fetch("/completion", {
                method: 'POST',
                body: JSON.stringify({ prompt, n_predict: 512, stream: true }),
                headers: { 'Content-Type': 'application/json' },
                signal: signal
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            // Create a new element for the response text
            const responseText = document.createElement('div');
            responseContainer.appendChild(responseText);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });

                // Append each chunk of content inline to the responseText element
                responseText.textContent += chunk;

                // Scroll to the bottom as new content is added
                scrollToBottom();
            }

        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Request aborted');
            } else {
                console.error('Error:', error);
            }
        } finally {
            // Add interaction buttons (Like, Dislike, Copy)
            const interactionContainer = document.createElement('div');
            interactionContainer.className = 'interaction-container';

            const likeButton = document.createElement('button');
            likeButton.textContent = '👍 Like';
            likeButton.className = 'btn btn-success btn-sm me-2';
            likeButton.onclick = () => alert('You liked this response.');

            const dislikeButton = document.createElement('button');
            dislikeButton.textContent = '👎 Dislike';
            dislikeButton.className = 'btn btn-danger btn-sm me-2';
            dislikeButton.onclick = () => alert('You disliked this response.');

            const copyButton = document.createElement('button');
            copyButton.textContent = '📋 Copy';
            copyButton.className = 'btn btn-secondary btn-sm';
            copyButton.onclick = () => {
                navigator.clipboard.writeText(responseText.textContent).then(() => {
                    alert('Response copied to clipboard.');
                });
            };

            interactionContainer.appendChild(likeButton);
            interactionContainer.appendChild(dislikeButton);
            interactionContainer.appendChild(copyButton);

            responseContainer.appendChild(interactionContainer);

            // Always add a dividing line after the response
            const blankLine = document.createElement('div');
            blankLine.innerHTML = '&nbsp;';
            responseContainer.appendChild(blankLine);

            const divider = document.createElement('hr');
            divider.className = 'divider'; // Style this in your CSS
            responseContainer.appendChild(divider);

            // Scroll to the bottom after adding the divider
            scrollToBottom();

            // Reset the UI and flags
            promptInput.disabled = false;
            submitButton.disabled = false;
            stopButton.disabled = true;
            isProcessing = false;
            abortController = null;

            // Clear the input field for the next prompt
            promptInput.value = '';
        }
    });

    // Stop button functionality
    stopButton.addEventListener('click', function() {
        if (abortController) {
            abortController.abort();
        }
    });
});
