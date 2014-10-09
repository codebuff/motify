// all listeners should go here
document.addEventListener('DOMContentLoaded', populate);
// this is responsible for opening a link in new tab
$(document).ready(function () {
    $('body').on('click', 'a', function () {
        var location = $(this).attr('href');
        if ((location !== '#news') && (location !== '#assignments') && (location !== '#qlinks')) {
            open_link(location);
            return false;
        } else {
            return;
        }
    });
});

//main function which populates all the elements.
function populate() {
    // console.log("reached populate");
    build_news();
    build_assignents();
    build_quick_links();
}


function build_news() {
    // console.log("build_news");
    var news_str = localStorage.getItem('news');
    console.log(news_str);
    if (news_str === null) {
        news_str = '<li class="list-group-item" >Please select courses first</li>';
    }
    document.getElementById('notif').innerHTML = news_str;
}

function build_assignents() {
    var a_list;
    if (localStorage["a_list"] === undefined) {
        document.getElementById('assignments').innerHTML = "Please select courses first";
    } else {
        a_list = JSON.parse(localStorage["a_list"]);
        if (Object.keys(a_list).length === 0) {
            document.getElementById('assignments').innerHTML = "Nothing Yet...";
        } else {
            var list = "";
            var keys = Object.keys(a_list);
            for (i = 0; i < keys.length; i++) {
                list = list + '<h4 align="center">' + keys[i] + '</h4><table  class="table table-striped table-bordered table-hover">' + a_list[keys[i]] + '</table>';
            }
            document.getElementById('assignments').innerHTML = list;
        }
    }
}


function build_quick_links() {
    console.log("build_quick_links");
    chrome.storage.sync.get({
        qlinks: {}
    }, function (items) {
        //console.log(items.qlinks);
        if (Object.keys(items.qlinks).length === 0) {
            document.getElementById('qlinks_list').innerHTML = "Please select courses from options page first.";
        } else {
            var list = "";
            var keys = Object.keys(items.qlinks);
            for (i = 0; i < keys.length; i++) {
                list = list + '<a href="' + items.qlinks[keys[i]] + '" class="list-group-item"><i class="fa fa-book fa-fw"></i>' + keys[i] + '</a>';
            }
            document.getElementById('qlinks_list').innerHTML = list;
        }

    });
}


function open_link(link) {
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
            chrome.tabs.create({url: link});
        }
    };
}
