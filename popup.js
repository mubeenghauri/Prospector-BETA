let startButton = document.getElementById("start");
let stopButton  = document.getElementById("stop");
let zipCodeInput = document.getElementById("zipCode");

startButton.style.height = "50px";
startButton.style.width = "70px";
startButton.textContent = "Start";


startButton.addEventListener('click', () => {
	console.log("Start button slicked");
    // Send a message to the active tab
    // alert("here !!");

    var zip = zipCodeInput.value;

    if(parseInt(zip) != NaN) {
        zipCodeInput.placeholder = "Scrapping in Progress .... ";
        chrome.runtime.sendMessage({clicked: true, zipCode: zip});
    } else {
        zipCodeInput.placeholder = "Invalid zipcode ?";
    }
});

stopButton.addEventListener("click", () => {
    console.log("Stop button clicked");
    chrome.runtime.sendMessage({stop: true});
});
