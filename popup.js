/* vars */
let startButton  = document.getElementById("start");
let stopButton   = document.getElementById("stop");
let zipCodeInput = document.getElementById("zipCode");
let running      = document.getElementById("on-running");
let stopped      = document.getElementById("on-stopped");
let info         = document.getElementById("info");
let clearInfo    = document.getElementById("clear-info");
let pageNum      = document.getElementById("pageNum");

startButton.style.height = "50px";
startButton.style.width = "70px";
startButton.textContent = "Start";

clearInfo.parentElement.hidden = true;
info.hidden = true;

startButton.addEventListener('click', () => {
	console.log("Start button slicked");
    // Send a message to the active tab
    // alert("here !!");
    var zip = zipCodeInput.value;
    var page = pageNum.value.length === 0 ? "1" : pageNum.value;
    running.hidden = false; stopped.hidden = true;
    if(parseInt(zip) != NaN) {
        zipCodeInput.placeholder = "Scrapping in Progress .... ";
        chrome.runtime.sendMessage({clicked: true, zipCode: zip, page: page});
    } else {
        zipCodeInput.placeholder = "Invalid zipcode ?";
    }
});

clearInfo.addEventListener('click', () => {
    info.innerHTML = "";
});

stopButton.addEventListener("click", () => {
    console.log("Stop button clicked");
    zipCodeInput.placeholder = "Enter Zipcode";
    running.hidden = true; stopped.hidden = false;
    chrome.runtime.sendMessage({stop: true});
});


chrome.runtime.onMessage.addListener((req, sender, sendResponse)=>{
    if(req.msg === "info") {
        clearInfo.parentElement.hidden = true;
        info.hidden = true;
        var payload = "<p>"+req.info+"</p>";
        info.innerHTML += payload;
    }
});