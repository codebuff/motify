// add listener to open option page on install and add periodic update schedule
chrome.runtime.onInstalled.addListener(function () {
    console.log('installed at ' + getDateTime());
    chrome.tabs.create({url: "options.html"});
    chrome.alarms.create('motifyAlarm', {
        delayInMinutes: 720
    });
});

// fetch updates periodically
chrome.alarms.onAlarm.addListener(function (alarm) {
    console.log('Fired alarm!at :' + getDateTime());
    if (alarm.name === 'motifyAlarm') {
        tasks();
    }
});



// main function
function tasks() {
    update_news();
    update_assignements();
    // later on any new modules can be called here
}

/*------------------------------News Module------------------------------------*/
function update_news() {
    //console.log("attempting  login");

    //  atttempt login to moodle
    var xhr = new XMLHttpRequest();
    var url = "https://moodle.niituniversity.in/moodle/login/index.php";
    var params;
    chrome.storage.sync.get({
        name: 'test',
        pass: 'pass'
    }, function (items) {
        params = "username=" + items.name + "&" + "password=" + items.pass;
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        //console.log(params);
        xhr.send(params);
    });
    xhr.onreadystatechange = function () {//Call a function when the state changes.
        if (xhr.readyState === 4 && xhr.status === 200) {
            get_news();
        }
    };
}


function get_news() {
    var news_str = "";
    console.log("reached get_news");
    chrome.storage.sync.get({
        clinks: ""
    }, function (items) {
        var temp;
        for (i = 0; i < items.clinks.length; i++) {
            temp = parse_news(items.clinks[i]);
            if (typeof temp !== 'undefined') {
                //console.log("iteration" + i + " : " + news_str);
                news_str = news_str + temp;
            }
        }
        save_news(news_str);
    });
}

function parse_news(clink) {
    var xhr = new XMLHttpRequest();
    // must use synchronous call , async will not work
    xhr.open("Get", clink, false);
    xhr.send();
    if (xhr.status === 200) {
        var doc = (new DOMParser).parseFromString(xhr.responseText, "text/html");
        var news_block = doc.getElementsByClassName("block_news_items sideblock");
        var news = news_block[0].getElementsByClassName("unlist")[0];
        if (typeof news !== 'undefined') {
            return news.innerHTML.toString();
        } else {
            return;
        }
    }
}

function save_news(news_str) {
    if (news_str === "") {
        localStorage["news"] = "Nothing Found";
    } else {
        news_str = replaceAll(news_str, 'class="post"', 'class="list-group-item"');
        localStorage["news"] = news_str;
    }
    //may use the code below to save objects but for strings the above code is fine

    /*chrome.storage.local.remove('news',function(){
     chrome.storage.local.set({
     'news': news_str
     }, function() {
     test();
     });//set callback ends here
     });// remove callback ends here*/
}//save_news ends here

/*------------------------------Assignments Module------------------------------------*/
function update_assignements() {
    var a_list = {};
    chrome.storage.sync.get({
        qlinks: new Array()
    }, function (items) {
        console.log(items.qlinks);
        var keys = Object.keys(items.qlinks);
        for (i = 0; i < keys.length; i++) {
            a_list[keys[i]] = fetch_assignments(items.qlinks[keys[i]]);
        }
        save_assignment(a_list);
    });

}

function fetch_assignments(link) {
    var a_link = 'https://moodle.niituniversity.in/moodle/mod/assignment/index.php?' + link.split('?')[1];
    console.log(a_link);
    var xhr = new XMLHttpRequest();
    // must use synchronous call , async will not work
    xhr.open("Get", a_link, false);
    xhr.send();
    if (xhr.status === 200) {
        var doc = (new DOMParser).parseFromString(xhr.responseText, "text/html");
        var a_table = doc.getElementsByClassName("generaltable boxaligncenter")[0];
        if (typeof a_table !== 'undefined') {
            return a_table.innerHTML.toString();
        } else {
            return "Nothing Found";
        }
    }
}

function save_assignment(a_list) {
    localStorage["a_list"] = JSON.stringify(a_list);
}

/*------------------------------common functions------------------------------------*/

function replaceAll(string, find, replace) {
    console.log("reached replace");
    return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function getDateTime() {
    var now = new Date();
    //var year    = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var hour = now.getHours();
    var minute = now.getMinutes();
    //var second  = now.getSeconds(); 
    if (month.toString().length === 1) {
        var month = '0' + month;
    }
    if (day.toString().length === 1) {
        var day = '0' + day;
    }
    if (hour.toString().length === 1) {
        var hour = '0' + hour;
    }
    if (minute.toString().length === 1) {
        var minute = '0' + minute;
    }

    var dateTime = month + '/' + day + ' ' + hour + ':' + minute;
    return dateTime;
}