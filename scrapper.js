    // class Prospector {

    //     init() { 
    //         // first verify we are on zillow page
    //         console.log(document.location['href']);
    //         if(document.location['href'].includes("real-estate-agent") == false ){
    //             alert("Please switch to Real Estate Agent page, then click again");
    //             return;
    //         }

    //         // get zipcode to enter
    //         var zipcode = prompt("Enter Zipcode : ", "32004");
    //         enterZipCode(parseInt(zipCode, 10))

    //         // extractInfo
    //     }

    //     enterZipCode(zip) {
            
    //         scrollEffect();

    //         var locationBox = document.querySelector("input[name='locationText']");
    //         locationBox.value = zip;

    //         // click on search
    //         setTimeout(function() {
    //             document.getElementById("yui_3_18_1_1_1594037729084_497").click();
    //         } , 3000); // wait 3 seconds before clicking
    //     }

    //     scrollEffect() {
    //         setTimeout(function(){
    //             for(var i = 0; i < 15; i++) {
    //                 setTimeout(function(){window.scrollBy(0, 70);}, 2000);
    //             }
    //         }, 2000);

    //         setTimeout(function() {
    //             for(var i = 0; i < 15; i++) {
    //                 setTimeout(function(){window.scrollBy(0, -70);}, 2000);
    //             }

    //         }, 3000);
    //     }

    //     sendDataToServer(data){
    //         // post data to server
    //         console.log("Sending Data");
    //         $.ajax({
    //             url: ' http://127.0.0.1:5000/save_data',
    //             type: 'post',
    //             dataType: 'json',
    //             contentType: 'application/json',
    //             success: function (data) {
    //                 console.log("Success");
    //             },
    //             data: JSON.stringify(data)
    //         });
    //         console.log("Posted Data");
    //     }

    //     extratInfo() {

    //         const maxPages = parseInt(document
    //             .getElementById("yui_3_18_1_1_1594037729084_702")
    //                                 .getAttribute("data-idx"), 10);

    //         for(var i = 0; i < maxPages; i++) {
    //             var profiles = document.getElementsByClassName("ldb-contact-name");
    //             for(var j = 0; i < profiles.length; j++) {
    //                 var profileLink = profiles[j].getElementsByTagName('a')[0];
    //                 var mainPageLocation = document.location['href'];
    //                 setTimeout(function(){
    //                     profileLink.click();
    //                 }, 5000);

    //                 // now we are at profile page.
    //                 scrollEffect();

    //                 // check is sales last 12mo > 10
    //                 var saleTag = parseInt(document.getElementsByClassName("ctcd-item ctcd-item_sales")[0]
    //                     .innerText
    //                                     .split(' ')[0], 0);
    //                 scrollEffect();
    //                 if(saleTag >= 10) {
    //                     // we have 10 or more sales
    //                     // extract info needed

    //                     scrollEffect();

    //                     var url = document.location['href'];
    //                     var isPremium = document.getElementsByClassName("ctcd-agent-type zsg-content-item").length > 0 ? true : false;

    //                     scrollEffect();

    //                     var name = document.getElementsByClassName("ctcd-user-name")[0].innerText;
    //                     var zipCode = document.getElementsByClassName("postal-code")[0].innerText;

    //                     scrollEffect();

    //                     var fbUrl = document.getElementsByClassName("facebook")[0].parentElement.getAttribute("href");
    //                     var email = "";
    //                     scrollEffect();


    //                     // now go to facebook link, to extract email.

    //                     document.location['href'] = fbUrl;
    //                     while(document.readyState != "complete") {
    //                         console.log("waiting for page to load");
    //                     }

    //                     scrollEffect();
    //                     scrollEffect();
    //                     scrollEffect();

    //                     // probably in FB, go to about section
    //                     document.location['href'] = fbUrl+"about/?section=contact-info";

    //                     while(document.readyState != "complete") {
    //                         console.log("waiting for page to load");
    //                     }

    //                     scrollEffect();
    //                     scrollEffect();

    //                     var a = document.getElementsByTagName("a");
    //                     for(var i = 0; i < a.length; i++) {
    //                         scrollEffect();
    //                         try{
    //                             if(a[i].getAttribute("href").includes("@")){
    //                                 console.log(a[i].getAttribute("href"));
    //                                 email = a[i].getAttribute("href");
    //                             }
    //                         } catch(err){
    //                         }
    //                     }

    //                     scrollEffect();

    //                     var data = {
    //                         "name"      : name,
    //                         "url"       : url,
    //                         "isPremium" : isPremium,
    //                         "zipCode"   : zipCode,
    //                         "fbUrl"     : fbUrl,
    //                         "email"     : email
    //                     };

    //                     sendDataToServer(data);

    //                     scrollEffect();

    //                 } else {
    //                     // go back to previous page
    //                     scrollEffect();
    //                     document.location['href'] = mainPageLocation;
    //                 }
    //             }
    //         }
    //     }
    // }



/**
 * DONE :
 *      - make all message responses asynchronus ?     [X]
 * TODO: 
 *      
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

                var data = {
                    "name": name,
                    "url": url,
                    "isPremium": isPremium,
                    "zipCode": zipCode,
                    "fbUrl": fbUrl
                };

                console.log("[SCRAPPER][SCRAPEPROFILE] Extracted Data : "+JSON.stringify(data));
                resolve(data); 

            } else {
                console.log("[SCRAPPER] Criteria not met : sales = "+saleTag);
                resolve( "CriteriaNotMet");
            }
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

    console.assert(port.name == "main-port");

    port.onMessage.addListener((request) => {
        console.log("[SCRAPPER] Got request: "+JSON.stringify(request));
        if( request.message === "getProfiles" ) {
            if(!sentProfile){
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
            if(!sentProfileData) {
                (async () => {
                    var profileData = await onScrapeProfile();
                    // if either is true, do nothing
                    console.log("Async got", profileData);
                    if( !sentProfileData ) {
                        // handle it ? how ...
                        port.postMessage(profileData);
                        sentProfileData = true;
                    } else {
                       console.log("Silly me");
                    }
                })();        
                // to keep channel open ?
                console.log("scrape profile, returned true?");
                return true;        
            } else {
                console.log("[SCRAPPER] Already sent profile data")
            }
        }

    });
    

    // listen for Profile scrapping action
    // port.onMessage.addListener((request) =>{
       
    // });
});
    
    
    




// adding listner
// alert("Hello");
// chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
//        // alert("scrapper triggered!");
//         if( request.message === "start") {
//             console.log("Starting request");
//             console.log(window.location.href);
//             p = new Prospector();
//             // var data = {
//             //     "name": "Mubeen",
//             //     "city": "Lahore",
//             //     "age": "10"
//             // };
//             // p.sendDataToServer(data);
//             //var prev = changeUrl("https://www.google.com");
//             p.scrollEffect();
//             //setTimeout(rand(prev), 10000);
//             request.t.push(window.location.href);
//             console.log("Recieved tabs : "+request.t);
//             sendResponse({t: request.t});
//         } else {
//             console.log("Did not recieved request");
//         }
//         return true;
   
// });
