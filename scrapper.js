/**
 * @author : mubeenghauri
 * @version : 0.9-BETA
 * DONE :
 *      - make all message responses asynchronus ?     [X]
 *      - extract email out of fb                      [X]
 *      - extract website, linkedin                    [X]
 *      - while on favebook, if title of document is   [X]
 *        "Page Not Found", skip scrapping fb
 * TODO: 
 *      - refactor code, u know, make it like what that Youtube guy had
 * 
 */
console.log("Hello from scrapper");

var scrollEffect = () => {
    setTimeout(function(){
        for(var i = 0; i < 15; i++) {
            setTimeout(function(){window.scrollBy(0, 70);}, 2000);
        }
    }, 2000);

    setTimeout(function() {
        for(var i = 0; i < 15; i++) {
            setTimeout(function(){window.scrollBy(0, -70);}, 2000);
        }

    }, 3000);
}

var getProfiles = () => {
    console.log("[Get Profile] Initiated");
    return new Promise(resolve => {
        var profileArray = [];
        var profiles = document.getElementsByClassName("ldb-contact-name");
    
        for(var i = 0; i < profiles.length; i++) {
            scrollEffect();
            var link = profiles[i].getElementsByTagName('a')[0];
            console.log("[GET PROFILES] Found Link : "+link["href"]);
            profileArray.push(link["href"]);
            scrollEffect();
        }
        resolve(profileArray);
    })
}

var scrapeProfile = () => {
    console.log("[SCRAPPER][SCRAPEPROFILE] Initiated ...");
    // now we are at profile page.
    scrollEffect();

    return new Promise(resolve => {
            // check is sales last 12mo > 10
            var saleTag = parseInt(document.getElementsByClassName("ctcd-item ctcd-item_sales")[0]
            .innerText
                            .split(' ')[0], 0);
            scrollEffect();
            console.log("[SCRAPPER][SCRAPEPROFILE] sales : "+saleTag);
            if(saleTag >= 10) {
                // we have 10 or more sales
                // extract info needed
                console.log("[SCRAPPER][SCRAPEPROFILE] have 10 or more sales");
                scrollEffect();

                var url = document.location['href'];
                var isPremium = document.getElementsByClassName("ctcd-agent-type zsg-content-item").length > 0 ? true : false;

                scrollEffect();

                var name = document.getElementsByClassName("ctcd-user-name")[0].innerText;
                console.log("[SCRAPPER][SCRAPEPROFILE] Found Name : "+name);
                var zipCode = document.getElementsByClassName("postal-code")[0].innerText;
                console.log("[SCRAPPER][SCRAPEPROFILE] Found zip : "+zipCode);

                scrollEffect();

                var fbUrl = document.getElementsByClassName("facebook").length > 0 ? document.getElementsByClassName("facebook")[0].parentElement.getAttribute("href") : "not found";
                console.log("[SCRAPPER][SCRAPEPROFILE] Found fb : "+fbUrl);
                
                scrollEffect();

                var linkedinUrl = document.getElementsByClassName("linkedIn").length > 0 ? document.getElementsByClassName("linkedIn")[0].parentElement.getAttribute("href") : "not found";
                console.log("[SCRAPPER][SCRAPEPROFILE] Found fb : "+linkedinUrl);

                scrollEffect();
                var website = "not available";
                
                var a = document.getElementsByTagName("a");
                for (let i = 0; i < a.length; i++) {
                    try {
                        if(a[i].innerText === "Website") {
                            website = a[i].getAttribute("href");
                        }
                    } catch (error) {}
                }
               
                console.log("[SCRAPPER][SCRAPEPROFILE] found website : "+website );
                var data = {
                    "name": name,
                    "url": url,
                    "isPremium": isPremium,
                    "zipCode": zipCode,
                    "fbUrl": fbUrl,
                    "linkedIn": linkedinUrl,
                    "website": website
                };

                console.log("[SCRAPPER][SCRAPEPROFILE] Extracted Data : "+JSON.stringify(data));
                resolve(data); 

            } else {
                console.log("[SCRAPPER] Criteria not met : sales = "+saleTag);
                resolve( "CriteriaNotMet");
            }
    })
}

var onGetEmail = async () => {

    console.log("[SCRAPPER] GETTING EMAILS");

    return new Promise( resolve => {
        setTimeout(()=>{

            if(window.document.title == "Page Not Found") {
                resolve( {data: "email", email: "invalid-facebook-id"} );
                return;
            }

            var a = document.getElementsByTagName("a");
            var anchorOfInterest = null;
            for(var i = 0; i < a.length; i++) {
                try{
                    if(a[i].getAttribute("href").includes("@")){
                    console.log(a[i].getAttribute("href"));
                    anchorOfInterest = a[i]; 
                }
                } catch(err){}
            }
            if(!anchorOfInterest) {
                resolve( {data: "email", email: "N/A"} );
            } else {
                var email = anchorOfInterest.children[0].textContent;
                console.log("[SCRAPPER] got email : "+email);
                resolve( {data: "email", email: email } );
            }
        }, 3000);
    })
}

var onGetProfiles = async () => {

    console.log("[SCRAPPER] Looking for profiles");
    var profiles = false;
    profiles = await getProfiles();
    console.log("[SCRAPPER] Extracted Profiles # "+profiles.length);
    for(var i = 0; i < profiles.length; i++) {
        console.log(profiles[i]);
    }

    if(!profiles){
        console.log("[OnGetProfiles] hmmm, found no profiles");
    } else {
        return { msg: "profiles", p: profiles};
    }
}

var onScrapeProfile = async () => {
    console.log("[SCRAPPER] ACTION RECIEVED : scrapeProfile");
    var profileData = await scrapeProfile();
    console.log("[SCRAPPER] Data Extracted "+JSON.stringify(profileData));
    if( !profileData ) {
        //port.postMessage( { data: "profileData", jObj: false } );
        console.log("[SCRAPPER] hmm, scrapeProfile returned false obj :/", profileData);
    } else if(profileData === "CriteriaNotMet"){
        console.log("Returned, criteria not met");
        return { data: "profileData", jObj: "CriteriaNotMet"};
    } else {
        console.log("Returned obj", profileData);
        return { data: "profileData", jObj: profileData };
        
    }
}

/** START : Registering event listeners **/

chrome.runtime.onConnect.addListener( port => {

    // as a port of avoiding multiple responses
    // (yes, for some reasonse, we get multiple request
    // hence multiple responses)
    // TO NOTE: this script (aka, content script)
    // is loaded everytin a new tab opens (that is
    // when the script is injected), therefore, 
    // on every page change, the(se) variable(s) shall 
    // be initialized. And we can be confident that 
    // during the scope of the script, these wont change
    // (unless explicitly done so)
    var sentProfile = false;
    var sentProfileData = false;
    var sentEmail = false;

    console.assert(port.name == "main-port");

    port.onMessage.addListener((request) => {
        console.log("[SCRAPPER] Got request: ",JSON.stringify(request));

        /////////////////////////////////////////////////////////////////////

        if( request.message === "getProfiles" ) {
            if( !sentProfile ){
                (async () => {
                    var profiles = await onGetProfiles();
                    port.postMessage(profiles);
                    sentProfile = true;
                })();
            } else {
                console.log("[SCRAPPER] already sent profile");
            }    
        }

        /////////////////////////////////////////////////////////////////////
        
        if( request.action === "scrapeProfile" ){
            console.log("got request srape profile");
            if( !sentProfileData ) {
                (async () => {
                    var profileData = await onScrapeProfile();
                    // if either is true, do nothing
                    console.log("Async got", profileData);
                    if( !sentProfileData ) {
                        // handle it ? how ...
                        port.postMessage(profileData);
                        sentProfileData = true;
                    } else {
                       console.log("Silly me :(");
                    }
                })();        
                // to keep channel open ?
                console.log("scrape profile, returned true? ;-/");
                return true;        
            } else {
                console.log("[SCRAPPER] Already sent profile data")
            }
        }

        /////////////////////////////////////////////////////////////////////

        if( request.action === "getEmailFromFacebook" ) {
            console.log("[Scrapper] Got request to extract email");
            if( !sentEmail ) {
                (async () => {
                    var email = await onGetEmail();
                    console.log("async got : ", email);
                    port.postMessage(email);
                    sentEmail = true;
                })();
                return true;
            }
        }

        /////////////////////////////////////////////////////////////////////

    });
});

