var isBusy = false;

var defaultStyles = [
    {
        title: 'Reddit Comments',
        url: 'reddit\\.com\\/r\\/[^\\/]+\\/comments',
        style: `.side {
display: none;
}
#header {
display: none;
}
.arrow, .expand, .score, .live-timestamp, .flat-list, .buttons, .morecomments, .footer-parent, .icon {
display: none !important;
}
`
    },{
        title: 'Wikipedia Article',
        url: 'wikipedia\\.org\\/wiki\\/',
        style: `#mw-navigation {
display: none;
}
#footer {
display: none;
}
#mw-panel {
display: none;
}
#mw-head {
display: none;
}
`
    },{
        title: 'YCombinator News Comments',
        url: 'news\\.ycombinator\\.com\\/item\\?id=[0-9]+',
        style: `#hnmain > tbody > tr:nth-child(1) > td > table {
display: none;
}
* {
background-color: white;
}
.title, .storylink {
text-align: left;
font-weight: bold;
font-size: 20px;
}
.score {
display: none;
}
.age {
display: none;
}
.hnpast {
display: none;
}
.togg {
display: none;
}
.votelinks, .rank {
display: none;
}
.votearrow {
display: none;
}
.yclinks {
display: none;
}
form {
display: none;
}
a.hnuser {
font-weight: bold;
color: black !important;
padding: 3px;
}
.subtext > span, .subtext > a:not(:nth-child(2)) {
display: none;
}
`
    },{
        title: 'Medium Article',
        url: 'medium\\.com',
        style: `.metabar {
display: none !important;
}
header.container {
display: none;
}
.js-postShareWidget {
display: none;
}
footer, canvas {
display: none !important;
}
.u-fixed, .u-bottom0 {
display: none;
}
`
    },{
        title: 'Twitter',
        url: 'twitter\\.com\\/.+',
        style: `.topbar {
display: none !important;
}
.ProfileCanopy, .ProfileCanopy-inner {
display: none;
}
.ProfileSidebar {
display: none;
}
.ProfileHeading {
display: none !important;
}
.ProfileTweet-actionList {
display: none;
}
`
    }

];

chrome.commands.onCommand.addListener(function(command) {
    // alert(isBusy)
    if (isBusy) {
        // alert('BUSY')
        return;
    }
    if (command === 'save-page') {
        // alert('gigi')
        console.log('test str');
        // FIXME
        // chrome.runtime.sendMessage({'shortcut': 'save-page'});
        // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        //     console.log('test str 2', tabs[0]);
        //   chrome.tabs.sendMessage(tabs[0].id, {'shortcut': 'save-page'}, function(response) {
        //     console.log(response);
        //   });
        // });
        // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        //     console.log('test str 2', tabs[0]);
        //     chrome.tabs.executeScript(tabs[0].id, {file: '/menu.js'});
        //     console.log('test str 3');
        //       chrome.tabs.sendMessage(tabs[0].id, {'shortcut': 'save-page'}, function(response) {
        //         console.log(response);
        //       });
        // });
        dispatch('extract-page', false, []);
        isBusy = true;
    } else if (command === 'save-selection') {
        dispatch('extract-selection', false, []);
        isBusy = true;
    } else if (command === 'add-page') {
        dispatch('extract-page', true, []);
        isBusy = true;
    } else if (command === 'add-selection') {
        dispatch('extract-selection', true, []);
        isBusy = true;
    }
});

function dispatch(action, justAddToBuffer, appliedStyles) {
    if (!justAddToBuffer) {
        removeEbook();
    }
    chrome.browserAction.setBadgeBackgroundColor({color:"red"});
    chrome.browserAction.setBadgeText({text: "Busy"});

    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, (tab) => {

                chrome.storage.local.get('styles', (data) => {
                    let styles = defaultStyles;
                    if (data && data.styles) {
                        styles = data.styles;
                    }
                    let currentUrl = tab[0].url;
                    let currentStyle = null;

                    if (styles && styles.length > 0) {
                        let allMatchingStyles = [];

                        for (let i = 0; i < styles.length; i++) {
                            currentUrl = currentUrl.replace(/(http[s]?:\/\/|www\.)/i, '').toLowerCase();
                            let styleUrl = styles[i].url;
                            let styleUrlRegex = null;

                            try {
                                styleUrlRegex =  new RegExp(styleUrl, 'i');
                            } catch (e) {
                            }

                            if (styleUrlRegex && styleUrlRegex.test(currentUrl)) {
                                allMatchingStyles.push({
                                    index: i,
                                    length: styleUrl.length
                                });
                            }
                        }

                        if (allMatchingStyles.length >= 1) {
                            allMatchingStyles.sort(function (a, b) {
                                return b.length - a.length;
                            });
                            let selStyle = allMatchingStyles[0];
                            currentStyle = styles[selStyle.index];
                            // setCurrentStyle(currentStyle);

                            if (currentStyle && currentStyle.style) {
                                chrome.tabs.insertCSS(tab[0].id, {code: currentStyle.style});
                                appliedStyles.push(currentStyle);
                            }
                        }
                    }

                    console.log('OoOoooooooolasdlasldkaldklakdlsk');
                    // chrome.tabs.executeScript(tab[0].id, {
                    //     file: 'extractHtml.js'
                    // }, function() {
                    //     sendMessage(tab[0].id, action, justAddToBuffer, appliedStyles);
                    // });

                    chrome.tabs.sendMessage(tab[0].id, {
                        type: action,
                        appliedStyles: appliedStyles
                    }, function(response) {

                        if (response.length === 0) {
                            if (justAddToBuffer) {
                                alert('Cannot add an empty selection as chapter!');
                            } else {
                                alert('Cannot generate the eBook from an empty selection!');
                            }
                            isBusy = false;
                            chrome.browserAction.setBadgeText({text: ""});
                            return;
                        }
                        if (!justAddToBuffer) {
                            console.log("build ebook done", response);

                            // FIXME - does not work
                            // buildEbook([response]);

                                        // chrome.tabs.executeScript(tab[0].id, {
                                        //     file: 'extractHtml.js'
                                        // }, function() {
                                        //     console.log('aoidadoaidoiaodiao');
                                        //     chrome.tabs.sendMessage(tab[0].id, {'shortcut': 'build-ebook', response: [response]}, (r) => {
                                        //       console.log(r);
                                        //     });
                                        // });
                                        // FIXME
                                        chrome.tabs.sendMessage(tab[0].id, {'shortcut': 'build-ebook', response: [response]}, (r) => {
                                          console.log(r);
                                        });
                            isBusy = false;
                            chrome.browserAction.setBadgeText({text: ""});
                        } else {
                            chrome.storage.local.get('allPages', function (data) {
                                if (!data || !data.allPages) {
                                    data.allPages = [];
                                }
                                data.allPages.push(response);
                                chrome.storage.local.set({'allPages': data.allPages});
                                isBusy = false;
                                chrome.browserAction.setBadgeText({text: ""});
                                alert('Page or selection added as chapter!')
                            })
                        }
                    });
                    // sendMessage(tab[0].id, action, justAddToBuffer, appliedStyles);
                });




    //     chrome.tabs.sendMessage(tab[0].id, {
    //         type: 'echo'
    //     }, (response) => {
    //         if (!response) {
    //             console.log(' NOT RESPONSE');
    //             // chrome.tabs.executeScript(tab[0].id, {file: '/jquery.js'});
    //             chrome.tabs.executeScript(tab[0].id, {file: '/pure-parser.js'});
    //             chrome.tabs.executeScript(tab[0].id, {file: '/cssjson.js'});
    //             chrome.tabs.executeScript(tab[0].id, {file: '/utils.js'});
    //             chrome.tabs.executeScript(tab[0].id, {file: '/filesaver.js'});
    //             chrome.tabs.executeScript(tab[0].id, {file: '/jszip.js'});
    //             chrome.tabs.executeScript(tab[0].id, {file: '/jszip-utils.js'});
    //
    //             // chrome.storage.local.get('styles', (data) => {
    //             //     let styles = defaultStyles;
    //             //     if (data && data.styles) {
    //             //         styles = data.styles;
    //             //     }
    //             //     let currentUrl = tab[0].url;
    //             //     let currentStyle = null;
    //             //
    //             //     if (styles && styles.length > 0) {
    //             //         let allMatchingStyles = [];
    //             //
    //             //         for (let i = 0; i < styles.length; i++) {
    //             //             currentUrl = currentUrl.replace(/(http[s]?:\/\/|www\.)/i, '').toLowerCase();
    //             //             let styleUrl = styles[i].url;
    //             //             let styleUrlRegex = null;
    //             //
    //             //             try {
    //             //                 styleUrlRegex =  new RegExp(styleUrl, 'i');
    //             //             } catch (e) {
    //             //             }
    //             //
    //             //             if (styleUrlRegex && styleUrlRegex.test(currentUrl)) {
    //             //                 allMatchingStyles.push({
    //             //                     index: i,
    //             //                     length: styleUrl.length
    //             //                 });
    //             //             }
    //             //         }
    //             //
    //             //         if (allMatchingStyles.length >= 1) {
    //             //             allMatchingStyles.sort(function (a, b) {
    //             //                 return b.length - a.length;
    //             //             });
    //             //             let selStyle = allMatchingStyles[0];
    //             //             currentStyle = styles[selStyle.index];
    //             //             // setCurrentStyle(currentStyle);
    //             //
    //             //             if (currentStyle && currentStyle.style) {
    //             //                 chrome.tabs.insertCSS(tab[0].id, {code: currentStyle.style});
    //             //                 appliedStyles.push(currentStyle);
    //             //             }
    //             //         }
    //             //     }
    //             //
    //             //     sendMessage(tab[0].id, action, justAddToBuffer, appliedStyles);
    //             // });
    //
    //             // chrome.tabs.executeScript(tab[0].id, {
    //             //     file: 'extractHtml.js'
    //             // }, function() {
    //             //     console.log('aoidadoaidoiaodiao');
    //             //     // sendMessage(tab[0].id, action, justAddToBuffer, appliedStyles);
    //             // });
    //         }
    //         // else if (response.echo) {
    //         //
    //         //
    //         //
    //         //     // sendMessage(tab[0].id, action, justAddToBuffer, appliedStyles);
    //         // }
    //
    //         console.log('baba lulu iii 33');
    //
    //         chrome.tabs.executeScript(tab[0].id, {file: '/pure-parser.js'});
    //         chrome.tabs.executeScript(tab[0].id, {file: '/cssjson.js'});
    //         chrome.tabs.executeScript(tab[0].id, {file: '/utils.js'});
    //         chrome.tabs.executeScript(tab[0].id, {file: '/filesaver.js'});
    //         chrome.tabs.executeScript(tab[0].id, {file: '/jszip.js'});
    //         chrome.tabs.executeScript(tab[0].id, {file: '/jszip-utils.js'});
    //
    //         chrome.storage.local.get('styles', (data) => {
    //             let styles = defaultStyles;
    //             if (data && data.styles) {
    //                 styles = data.styles;
    //             }
    //             let currentUrl = tab[0].url;
    //             let currentStyle = null;
    //
    //             if (styles && styles.length > 0) {
    //                 let allMatchingStyles = [];
    //
    //                 for (let i = 0; i < styles.length; i++) {
    //                     currentUrl = currentUrl.replace(/(http[s]?:\/\/|www\.)/i, '').toLowerCase();
    //                     let styleUrl = styles[i].url;
    //                     let styleUrlRegex = null;
    //
    //                     try {
    //                         styleUrlRegex =  new RegExp(styleUrl, 'i');
    //                     } catch (e) {
    //                     }
    //
    //                     if (styleUrlRegex && styleUrlRegex.test(currentUrl)) {
    //                         allMatchingStyles.push({
    //                             index: i,
    //                             length: styleUrl.length
    //                         });
    //                     }
    //                 }
    //
    //                 if (allMatchingStyles.length >= 1) {
    //                     allMatchingStyles.sort(function (a, b) {
    //                         return b.length - a.length;
    //                     });
    //                     let selStyle = allMatchingStyles[0];
    //                     currentStyle = styles[selStyle.index];
    //                     // setCurrentStyle(currentStyle);
    //
    //                     if (currentStyle && currentStyle.style) {
    //                         chrome.tabs.insertCSS(tab[0].id, {code: currentStyle.style});
    //                         appliedStyles.push(currentStyle);
    //                     }
    //                 }
    //             }
    //
    //             console.log('OoOoooooooolasdlasldkaldklakdlsk');
    //             chrome.tabs.executeScript(tab[0].id, {
    //                 file: 'extractHtml.js'
    //             }, function() {
    //                 sendMessage(tab[0].id, action, justAddToBuffer, appliedStyles);
    //             });
    //             // sendMessage(tab[0].id, action, justAddToBuffer, appliedStyles);
    //         });
    //     });
    });
}

// function sendMessage(tabId, action, justAddToBuffer, appliedStyles) {
//
//     chrome.tabs.sendMessage(tabId, {
//         type: action,
//         appliedStyles: appliedStyles
//     }, function(response) {
//
//         if (response.length === 0) {
//             if (justAddToBuffer) {
//                 alert('Cannot add an empty selection as chapter!');
//             } else {
//                 alert('Cannot generate the eBook from an empty selection!');
//             }
//             isBusy = false;
//             chrome.browserAction.setBadgeText({text: ""});
//             return;
//         }
//         if (!justAddToBuffer) {
//             buildEbook([response]);
//             isBusy = false;
//             chrome.browserAction.setBadgeText({text: ""});
//         } else {
//             chrome.storage.local.get('allPages', function (data) {
//                 if (!data || !data.allPages) {
//                     data.allPages = [];
//                 }
//                 data.allPages.push(response);
//                 chrome.storage.local.set({'allPages': data.allPages});
//                 isBusy = false;
//                 chrome.browserAction.setBadgeText({text: ""});
//                 alert('Page or selection added as chapter!')
//             })
//         }
//     });
// }






chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'get') {
        chrome.storage.local.get('allPages', function (data) {
            if (!data || !data.allPages) {
                sendResponse({allPages: []});
            }
            sendResponse({allPages: data.allPages});
        })
    }
    if (request.type === 'set') {
        chrome.storage.local.set({'allPages': request.pages});
    }
    if (request.type === 'remove') {
        chrome.storage.local.remove('allPages');
        chrome.storage.local.remove('title');
    }
    if (request.type === 'get title') {
        chrome.storage.local.get('title', function (data) {
            if (!data || !data.title || data.title.trim().length === 0) {
                sendResponse({title: 'eBook'});
            } else {
                sendResponse({title: data.title});
            }
        })
    }
    if (request.type === 'set title') {
        chrome.storage.local.set({'title': request.title});
    }
    if (request.type === 'get styles') {
        chrome.storage.local.get('styles', function (data) {
            if (!data || !data.styles) {
                // TODO move defaultStyles in a different file/location ?
                var defaultStyles = [
                    {
                        title: 'Reddit Comments',
                        url: 'reddit\\.com\\/r\\/[^\\/]+\\/comments',
                        style: `.side {
    display: none;
}
#header {
    display: none;
}
.arrow, .expand, .score, .live-timestamp, .flat-list, .buttons, .morecomments, .footer-parent, .icon {
    display: none !important;
}
`
                    },{
                        title: 'Wikipedia Article',
                        url: 'wikipedia\\.org\\/wiki\\/',
                        style: `#mw-navigation {
    display: none;
}
#footer {
    display: none;
}
#mw-panel {
    display: none;
}
#mw-head {
    display: none;
}
`
                    },{
                        title: 'YCombinator News Comments',
                        url: 'news\\.ycombinator\\.com\\/item\\?id=[0-9]+',
                        style: `#hnmain > tbody > tr:nth-child(1) > td > table {
    display: none;
}
* {
    background-color: white;
}
.title, .storylink {
    text-align: left;
    font-weight: bold;
    font-size: 20px;
}
.score {
    display: none;
}
.age {
    display: none;
}
.hnpast {
    display: none;
}
.togg {
    display: none;
}
.votelinks, .rank {
    display: none;
}
.votearrow {
    display: none;
}
.yclinks {
    display: none;
}
form {
    display: none;
}
a.hnuser {
    font-weight: bold;
    color: black !important;
    padding: 3px;
}
.subtext > span, .subtext > a:not(:nth-child(2)) {
    display: none;
}
`
                    },{
                        title: 'Medium Article',
                        url: 'medium\\.com',
                        style: `.metabar {
    display: none !important;
}
header.container {
    display: none;
}
.js-postShareWidget {
    display: none;
}
footer, canvas {
    display: none !important;
}
.u-fixed, .u-bottom0 {
    display: none;
}
`
                    },{
                        title: 'Twitter',
                        url: 'twitter\\.com\\/.+',
                        style: `.topbar {
    display: none !important;
}
.ProfileCanopy, .ProfileCanopy-inner {
    display: none;
}
.ProfileSidebar {
    display: none;
}
.ProfileHeading {
    display: none !important;
}
.ProfileTweet-actionList {
    display: none;
}
`
                    }

/*


*/

                ];
                sendResponse({styles: defaultStyles});
            } else {
                sendResponse({styles: data.styles});
            }
        });
    }
    if (request.type === 'set styles') {
        chrome.storage.local.set({'styles': request.styles});
    }
    if (request.type === 'get current style') {
        chrome.storage.local.get('currentStyle', function (data) {
            if (!data || !data.currentStyle) {
                sendResponse({currentStyle: 0});
            } else {
                sendResponse({currentStyle: data.currentStyle});
            }
        });
    }
    if (request.type === 'set current style') {
        chrome.storage.local.set({'currentStyle': request.currentStyle});
    }
    if (request.type === 'get include style') {
        chrome.storage.local.get('includeStyle', function (data) {
            if (!data) {
                sendResponse({includeStyle: false});
            } else {
                sendResponse({includeStyle: data.includeStyle});
            }
        });
    }
    if (request.type === 'set include style') {
        chrome.storage.local.set({'includeStyle': request.includeStyle});
    }
    return true;
});
