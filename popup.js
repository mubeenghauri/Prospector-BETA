let startButton = document.getElementById("start");
startButton.style.height = "50px";
startButton.style.width = "70px";
startButton.textContent = "Start";


startButton.addEventListener('click', () => {
	console.log("Start button slicked");
    // Send a message to the active tab
    // alert("here !!");

    chrome.runtime.sendMessage({clicked: true});
})
