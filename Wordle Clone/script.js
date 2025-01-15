// Global variables
let correctWord = ""; // Word to guess
let currentRow = 0;

// Your Wordnik API key (replace with your actual key)
// Your Wordnik API key (replace with your actual key)
const WORDNIK_API_KEY = 'f85ot5piyba060t06cfxybxdq0ke2a1lzb89ipng7g91znalk';

async function fetchWord() {
    try {
        // Fetch a random word with at least one dictionary definition
        const response = await fetch(`https://api.wordnik.com/v4/words.json/randomWord?minLength=5&maxLength=5&hasDictionaryDef=true&api_key=${WORDNIK_API_KEY}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !data.word || !/^[A-Za-z]{5}$/.test(data.word)) {
            throw new Error("Invalid data from Wordnik API.");
        }

        correctWord = data.word.toUpperCase(); // Convert the word to uppercase
        console.log("Correct word (Wordnik):", correctWord);
    } catch (error) {
        console.error("Error fetching word from Wordnik API. Falling back to predefined list:", error);

        // Fallback to predefined list
        const randomIndex = Math.floor(Math.random() * COMMON_WORDS.length);
        correctWord = COMMON_WORDS[randomIndex];
        console.log("Correct word (Fallback):", correctWord);
    }
}




// Initialize the game
async function initGame() {
    await fetchWord(); // Fetch the word before starting the game
    const gameBoard = document.getElementById("gameBoard");

    // Create 6 rows of 5 input boxes
    for (let i = 0; i < 6; i++) {
        const row = document.createElement("div");
        row.classList.add("row");
        for (let j = 0; j < 5; j++) {
            const input = document.createElement("input");
            input.setAttribute("maxlength", "1");
            input.setAttribute("class", "letter");
            input.setAttribute("data-row", i);
            input.setAttribute("data-col", j);

            // Event listener for moving between inputs
            input.addEventListener("input", (event) => {
                if (event.inputType === "insertText" && input.value) {
                    // Move to the next input box
                    const nextInput = row.querySelector(`input[data-col="${j + 1}"]`);
                    if (nextInput) {
                        nextInput.focus();
                    }
                }
            });

            // Event listener for backspace
            input.addEventListener("keydown", (event) => {
                if (event.key === "Backspace" && !input.value) {
                    // Move to the previous input box
                    const prevInput = row.querySelector(`input[data-col="${j - 1}"]`);
                    if (prevInput) {
                        prevInput.focus();
                    }
                }
            });

            row.appendChild(input);
        }
        gameBoard.appendChild(row);
    }
}

// Submit guess logic
document.getElementById("submitGuess").addEventListener("click", async () => {
    const rows = document.querySelectorAll(".row");
    const inputs = rows[currentRow].querySelectorAll("input");

    let guess = "";
    inputs.forEach((input) => {
        guess += input.value.toUpperCase();
    });

    if (guess.length !== 5) {
        document.getElementById("message").innerText = "Please fill in all letters.";
        return;
    }

    // Validate if the user input is a valid English word using the Wordnik API
    if (!(await isValidWord(guess))) {
        document.getElementById("message").innerText = "Invalid word. Try again with a valid English word.";
        return;
    }

    // Check the guess
    const result = checkGuess(guess, correctWord);

    // Update colors based on result
    inputs.forEach((input, index) => {
        if (result[index] === "correct") {
            input.style.backgroundColor = "#6aaa64"; // Green
            input.style.color = "white";
        } else if (result[index] === "present") {
            input.style.backgroundColor = "#c9b458"; // Yellow
            input.style.color = "white";
        } else {
            input.style.backgroundColor = "#787c7e"; // Gray
            input.style.color = "white";
        }
    });

    // Check if the guess is correct
    if (guess === correctWord) {
        document.getElementById("message").innerText = "Congratulations! You guessed the word!";
        document.getElementById("submitGuess").disabled = true;
    } else if (currentRow === 5) {
        document.getElementById("message").innerText = `Game over! The word was ${correctWord}.`;
        document.getElementById("submitGuess").disabled = true;
    } else {
        currentRow++;
        document.getElementById("message").innerText = "";
    }
});

// Function to check the guess
function checkGuess(guess, correctWord) {
    const result = Array(5).fill("absent");

    // Check for correct letters in correct positions
    for (let i = 0; i < 5; i++) {
        if (guess[i] === correctWord[i]) {
            result[i] = "correct";
        }
    }

    // Check for correct letters in wrong positions
    for (let i = 0; i < 5; i++) {
        if (result[i] !== "correct" && correctWord.includes(guess[i])) {
            result[i] = "present";
        }
    }

    return result;
}

// Function to validate a word using Wordnik API
// Function to validate a word using Wordnik API
async function isValidWord(word) {
    try {
        const response = await fetch(`https://api.wordnik.com/v4/word.json/${word}/definitions?api_key=${WORDNIK_API_KEY}`);
        const data = await response.json();

        // If data is an empty array, it means the word is not valid
        if (data && data.length > 0) {
            return true; // Word is valid
        } else {
            return false; // Word is not valid
        }
    } catch (error) {
        console.error("Error validating word:", error);
        return false; // Assume invalid on error
    }
}


// Start the game
initGame();
