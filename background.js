/**
 * @author : mubeenghauri
 * @version : 0.9.5-BETA
 * 
 * DONE:                                                                       [DONE]             
 *      - injected script into current tabb                                     [X]
 *      - background now recieves profile page from scrapper                    [X]
 *      - somehow, iterate through the profile                                  [X]
 *          - extract info from profile page                                    [X]
 *          - send that back to background                                      [X]
 *          - make background store all that in a json object                   [X]
 *              Json Object contains :
 *                  {
 *                      "name"      : name,
 *                      "url"       : url,
 *                      "isPremium" : isPremium,
 *                      "zipCode"   : zipCode,
 *                      "fbUrl"     : fbUrl,
 *                      "email"     : email,
 *                      "website"   : website.com.,
 *                      "linkedIn"  : linkedin.com
 *                  }
 *      - [BUG] There is an issue with synchronization of message,              [X] 
 *              somehow, make messaging synchronus, while no 
 *              response from scrapper, dont send new messages !!
 *              (in other words, wait for response, before sending messages)
 *              (fixed using async/await promisies in scrapper)
 *      - for email, go through facebook (arghhh) [REAL CHALLENGE]              [X]
 *      - Stop injecting script on every tab reload                             [X]
 *          [maybe? get the job done the way it is rn ...]
 *      - iterate through pages when profiles extracted are empty
 *      - once object is complete, send it to python API,                       [X]
 *        which will save contents to csv
 *      - Incorporate new values into jsonObj                                   [X] 
 *          (additional val => website & linkedin, if available) 
 * TODO:
 *          - accept zipcode in bulk and iterate through them....
 *          - re-format facebook url to redirect directly to about page
 *          - REFACTOR code, use 'javasctipt OOP' for scrapper and backend implementation.
 *        
 * NOTES: this version, almost working, have to add a fix around to use case => (
 *      what if the sales number does not meet our match , skip profile???) [YES, PROFILE IS SKIPPED] [SOLVED]
 */

/** Globals */
let running = false;            /* Flag to indicate wether app is running or not */
let profiles = [];              /* List of profiles collected from search page */
const ports = new Set;          /* just for a little hack  */
var tempObj = "";               /* temporarily store data collected for a single user */
var messagePort = null;         /* message port for comunicating with conent script (scrapper.js) */
var recievedObj = false;        /* Flag to indicate if content script has sent data, to avoid duplication */
var profileData = [];           /* List of all data scrapped */
var changePage = false;
var zipCode = ""                /* Currently processing zipcode */
var pageNum = 1;                /* page number currently at */
var server = "http://localhost:5000/scrapped";

/** Start: Registering event listeners **/

/**
 * Hack for injecting scripts ?? 
 * source : https://discourse.mozilla.org/t/event-listeners-added-multiple-times/9971/4
 */
// chrome.runtime.onConnect.addListener(
//     port => ports.add(port) === port.onDisconnect.addListener(() => ports.delete(port))
// );



/**
 * fired up by message from popup.js
 * 
 * Entry Point of Extention. 
 */
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if( req.clicked === true) {
        console.log("I recieved button click confimation!");
        
        // reset variables
        profiles = [];
        tempObj = "";
        profilesData = [];
        pageNum = 1;

        // check if we are on zillow and on real estate agent page
        chrome.tabs.query({active: true}, tabs => {
            let tab = tabs[0];
            console.log("At tab "+tab.url);
            if( tab.url.includes("zillow.com") && tab.url.includes("real-estate-agent") ) {
                if(!running) { running = true; }
                zipCode = req.zipCode;
                console.log("[Backend] got zipcode : "+zipCode);
                (async () => {
                    goToSearchPage();
                    messagePort = chrome.tabs.connect(tab.id, {name: "main-port"});
                    registerMessageListener();
                    console.log("[BACKEND] Connected to port");
            
                    messagePort.postMessage({message: "getProfiles"});
                })();
                
            } else {
                console.log("tab should be zillow search page "+tab.url);
            }
        });
    }

    if(req.stop === true) {
        messagePort.disconnect();
        messagePort.onDisconnect.removeListener(event);
    }
});

/**
 * Whenever A tab is updated this event will be fired, 
 * This single even will handle all (3 cases in our case) cases.
 * (w.r.t URL)
 * 
 * Here, updating tab implies that the url of current tab is updated.
 * For our purposes, we are only operating within a single tab.
 * 
 * Also, upon clicking STOP button on popup, this will disconnect port
 */
chrome.tabs.onUpdated.addListener((tabid, changeInfo, tab) => {
    if( running ) {
        // if tabs are scwtiched, stop running !!! 
        // can start by engaging popup !!
        if((tab.url.includes("zillow.com") == false) && (tab.url.includes("facebook.com") == false)) {
            console.log("[BACKEND][TABS LISTENER] NOT TARGET URL!!"+tab.url);
            running = false;
            return; 
        } else {
            var url = tab.url;
            if( url.includes("profile") ) {
                // TODO: try not to inject script to every tab ;/
                //injectToCurrent();    [NOTES: WORKS WITHOUT IT TOO, REMOVE IT MAYBE?]
                messagePort = chrome.tabs.connect(tab.id, {name: "main-port"});
                registerMessageListener();
                // ask scrapper to scrape of required info and get it here.
                setTimeout( ()=>{
                    messagePort.postMessage({action: "scrapeProfile"});
            }, 10000 );
            }
            else if( tab.url.includes("facebook.com")  && tab.url.includes("about") ) {
                messagePort = chrome.tabs.connect(tab.id, {name: "main-port"});
                registerMessageListener();
                console.log("[BACKEND] Connected to port [FACEBOOK]");
                messagePort.postMessage({action: "getEmailFromFacebook"});
            }
            else if( tab.url.includes("zillow.com") && tab.url.includes("real-estate-agent") ) {
                messagePort = chrome.tabs.connect(tab.id, {name: "main-port"});
                registerMessageListener();
                messagePort.postMessage({message: "getProfiles"});
                console.log("[BACKEND] [TAB Listener] Getting Profiles");                
            }
            else {
                console.log("[BACKEND][TABS LISTENER] found invalid link? : "+url);
            }
        }
        
    } 
});

/** END: Registering event Listneres **/

/** START: Defining Functions **/

function registerMessageListener() {

    messagePort.onDisconnect.addListener( smtng => {
        console.log("Port disconnected");
        if(running){
            chrome.tabs.query({active: true}, tabs => {
                let tab = tabs[0];
                //console.log("At tab "+tab.url);
                if(tab.url.includes("zillow.com") && (tab.url.includes("real-estate-agent") || tab.url.includes("profile"))) {
                    if(!running){
                        injectToCurrent();
                    }  
                    messagePort = chrome.tabs.connect(tab.id, {name: "main-port"});
                    registerMessageListener();
                    if(messagePort) { 
                        //console.log("[BACKEND] Reconnected to port");
                    }
                }
            });
        } else {
            console.log("Not Running anymore, found profiles : ",profileData);
        }
    });

    messagePort.onMessage.addListener( res => {
        console.log("[BACKEND][MESSAGEPORT] recieved message !!",res);
        if( res.msg === "profiles" ) {
            console.log("[BACKEND] Recieved profiles collection : " + res.p );
            for(var i = 0; i < res.p.length; i++) {
                console.log(res.p[i]);
            }
            if( res.p.length <= 0 ) {
                console.log("[BACKEND] something wrong, length of profile collection is : "+res.p.length);
                return;
            }  else {
                profiles = res.p;
                // wait for 5 secs,  invoke profile iterator.
                setTimeout(iterateThroughProfiles, 5000);
            }
        }
    
        if( res.data === "profileData" ) {
            // res will return a json object (see above for structore of obj)
            // verify obj has all properties requires, except for email,
            // that will be the next step ;)
            var jsonObj = res.jObj;
            console.log("[BACKEND][PROFILE] GOT JSON RESPONSE : "+jsonObj);
            var properties = ["name", "isPremium", "url", "zipCode", "fbUrl"];
            var hasAll = true;
            if(!jsonObj) {
                // if no obj recieved, keep going through profiles;
                console.log("[BACKEND][PROFILE] recieved null object");
                //iterateThroughProfiles();
                return;
            } else if(typeof jsonObj === "string" && jsonObj === "CriteriaNotMet"){
                iterateThroughProfiles();
                return;

            } else {
                if(profileData.includes(JSON.stringify(jsonObj))) {
                    // if our tempObj has been assigned, and we get jsonObj 
                    // with same values, skip below code
                    console.log("[BACKEND][PROFILE] recieved dupplicate : "+jsonObj.name);
                    iterateThroughProfiles();
                    return;
                }
                properties.forEach((val, index, arr) => {
                    if( ! jsonObj.hasOwnProperty(val) ) {
                        hasAll = false;
                    }
                });
                if(hasAll) {
                    tempObj = jsonObj;
                    profileData.push(JSON.stringify(jsonObj));  
                    console.log("[BACKEND][PROFILE][PROFILE] SETTED TEMP OBJ TO : "+JSON.stringify(tempObj));
                    if(hasFacebook()){
                        messagePort.postMessage({action: "getEmailFromFacebook"});
                        console.log("[BACKED] Dispatched 'getEmailFromFacebook' to 'Scrapper'");
                        return;
                    }
                    // if does not have facebook listed. 
                    // set email to "null"; and send data to server
                    tempObj["email"] = "noFb=noEmail";
                    sendData();
                    // keep going through the profiles.
                    iterateThroughProfiles();
                }
            }
        }

        if( res.data === "email" ) {
            var email = res.email;
            console.log("[BACKEND][EMAIL] got email : ", email);
            
            if(tempObj.hasOwnProperty("email")) {
                console.log("recieved duplicate email ", email, tempObj);
                return;
            }
            tempObj['email'] = email;
            
            console.log("[BACKEND][PROFILE] updated temp obj : ", JSON.stringify(tempObj));
            
            sendData();

            // keep on iterating through profile
            iterateThroughProfiles();
        }

        if( res.data === "pageChanged" ) {
            console.log("[BACKEND] Recieved : ",res);
            if(res.status === "success") {
                console.log("Succecfully changed page.... going through profiles");
                messagePort.postMessage({message: "getProfiles"});
            }
        }
    
    });   

}

function requestSender(data) {
    return new Promise( resolve => {
        var xml = new XMLHttpRequest();
        xml.open("POST", server, true);
        xml.setRequestHeader("Content-Type", "application/json");
        xml.send(data);
        console.log("[REQUEST SENDER] sent data :",data);
    })
}

async function sendData() {
    console.log("[SEND DATA] sending data to server ... ");
    var data = JSON.stringify(tempObj);
    await requestSender(data);
    return;
}

function hasFacebook() {
    if( tempObj["fbUrl"] && tempObj["fbUrl"].includes("facebook") ) {
        console.log("[BACKEND] User : "+tempObj["name"]+" has a fb url =>"+tempObj["fbUrl"]);
        var url = tempObj.fbUrl;
        if( url[url.length-1] === "/" ){
            url = url + "about";
        } else {
            url = url + "/about";
        }
        changeTab(url);
        return true;
    } else {
        console.log("[BACKEND] User : "+tempObj["name"]+" does not have a fb url =>"+tempObj["fbUrl"]);
        return false;
    }
}

function changeTab(link) {
    console.log("[BACKEND] Changing tabs to : "+link)
    chrome.tabs.query({active: true}, (tabs) => {
        var tab = tabs[0];
        setTimeout(() => {
            chrome.tabs.update(tab.id, {url: link});
        }, 2000);
    });
}

function iterateThroughProfiles() { 
    if( profiles.length > 0 ) {
        console.log("[BACKEND]:[IterateThroughProfiles] Iterating through profiles ... ");
        var link = profiles.pop();
        console.log("[BACKEND]:[IterateThroughProfiles] Got link : "+link );
        if(link.includes("profile")){
            changeTab(link);
        } else {
            console.log("[BACKEND]:[IterateThroughProfiles] Something went wrong, got invalid link : "+link);
        }
    } else {
        console.log("[BACKEND]:[IterateThroughProfiles] Profiles is empty.");
        (async () => {
            // resetint these vars to avoid memory 
            // bottleneck
            profiles = [];
            tempObj = "";
            profilesData = [];
            await goToSearchPage();
        })();
    }
}

function goToSearchPage() {
    return new Promise( resolves => {
        var searchPage = "https://www.zillow.com/agent-finder/real-estate-agent-reviews/?locationText="+zipCode+"&page="+pageNum;
        console.log("[GOTONEXTPAGE] Going to search page "+searchPage);
        changeTab(searchPage);
        changePage = true;
        pageNum++;
        setTimeout(()=>{
            resolves(true);
        }, 3000);
    })
}

function getCurrentUrl() {
    chrome.tabs.query({active: true}, (tabs) => {
        console.log("getting current url : "+tabs[0].url);
        return tabs[0].url;
    });
}

function injectToCurrent() {
    chrome.tabs.query({active: true, currentWindow: true}, ([ tab, ]) => tab && injectToTab(tab.id));
}

function injectToTab(tabId) {
    // source : https://discourse.mozilla.org/t/event-listeners-added-multiple-times/9971/4
    if (Array.from(ports).some(_=>_.sender.tab.id === tabId)) { return; } // already injected
    console.log("Injecting script to tab ... ");
    chrome.tabs.executeScript(tabId, { file: "./scrapper.js"}, () => {
        console.log("script injected");
        running = true;
    });
}

/** END: Defining functions **/

/** SCRAP WORK BELOW **/
