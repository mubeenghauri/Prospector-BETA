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
    var profileArray = [];
    var profiles = document.getElementsByClassName("ldb-contact-name");
   
    for(var i = 0; i < profiles.length; i++) {
        scrollEffect();
        var link = profiles[i].getElementsByTagName('a')[0];
        console.log("[GET PROFILES] Found Link : "+link["href"]);
        profileArray.push(link["href"]);
        scrollEffect();
    }
    return profileArray;
}

console.log("Hello from scrapper");

var scrapeProfile = () => {
    console.log("[SCRAPPER][SCRAPEPROFILE] Initiated ...");
    // now we are at profile page.
    scrollEffect();

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
        return data; 

    } else {
        return false;
    }
}


/** START : Registering event listeners **/

chrome.runtime.onConnect.addListener( port => {

    console.assert(port.name == "main-port");

    port.onMessage.addListener((request) => {
        if( request.message === "getProfiles" ) {
            console.log("[SCRAPPER] Looking for profiles");
            var profiles = getProfiles();
            console.log("[SCRAPPER] Extracted Profiles # "+profiles.length);
            for(var i = 0; i < profiles.length; i++) {
                console.log(profiles[i]);
            }
            port.postMessage( { msg: "profiles", p: profiles} );
        }
    });
    

    // listen for Profile scrapping action
    port.onMessage.addListener((request) =>{
        if( request.action === "scrapeProfile" ){
            console.log("[SCRAPPER] ACTION RECIEVED : scrapeProfile");
            var profileData = scrapeProfile();
            console.log("[SCRAPPER] Data Extracted "+JSON.stringify(profileData));
            if( !profileData ) {
                port.postMessage( { data: "profileData", jObj: false } );
            } else {
                port.postMessage( { data: "profileData", jObj: profileData } );
            }
        }
    });
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
