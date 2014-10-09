// all listeners should be added here
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
        save_options);
document.getElementById('refresh').addEventListener('click',
        refresh);

// Restores username , password and other settings using the preferences stored in chrome.storage.
function restore_options() {

    chrome.storage.sync.get({
        name: 'test',
        pass: 'pass',
        cnames: 'Please choose courses first.'
    }, function (items) {
        document.getElementById('name').value = items.name;
        document.getElementById('pass').value = items.pass;
        //console.log(items.cname);
        document.getElementById('current_courses').innerHTML = items.cnames.toString();

    });
}


// Saves options to chrome.storage
function save_options() {
    var name = document.getElementById('name').value;
    var pass = document.getElementById('pass').value;
    chrome.storage.sync.set({
        name: name,
        pass: pass
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Fetching Course List.';
        attempt_login();
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}



//try to log in and get the courses 
function attempt_login() {
    //console.log("reached attempt login");
    var xhr = new XMLHttpRequest();
    var url = "https://moodle.niituniversity.in/moodle/login/index.php";
    var params;

    // getting the stored username and password
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
            var doc = (new DOMParser).parseFromString(xhr.responseText, "text/html");
            // in future id may change thus not a very reliable idea.
            /*var courses_block = doc.getElementById("inst2182"); 
             var courses = courses_block.getElementsByTagName("a");*/
            // another implementation
            var courses_block = doc.getElementsByClassName("block_my_courses sideblock");
            var courses = courses_block[0].getElementsByTagName("a");
            var clist = "";
            for (i = 0; i < courses.length - 1; ++i) {
                clist = clist + '<label class="checkbox-inline"><input type="checkbox" name="course" id="' + courses[i].innerHTML + '" value="' + courses[i].getAttribute("href") + '">' + courses[i].innerHTML + '</label>';
                //console.log(courses[i].innerHTML+" link : "+courses[i].getAttribute("href") );
            }

            build_course_form(clist);

            //console.log("page_loading_finished......................................");
        }
    };

}




// create list of courses list 
function build_course_form(clist) {
    clist = clist + '<br><button type="button" class="btn btn-outline btn-primary btn-lg btn-block" id="save_courses" >SAVE SETTINGS</button>';
    document.getElementById("coursesForm").innerHTML = clist;
    document.getElementById('save_courses').addEventListener('click',
            save_courses);
}

// save selected courses to storage qlinks: qlinks
function save_courses() {
    // first get the links of the courses
    var checked_courses = document.querySelectorAll('input[value][type="checkbox"]:checked');
    var clinks = [];
    var cnames = [];
    var qlinks = {};
    for (i = 0; i < checked_courses.length; ++i) {
        clinks.push(checked_courses[i].value);
        cnames.push(checked_courses[i].id);
        qlinks[checked_courses[i].id] = checked_courses[i].value;
    }

    //console.log(qlinks);
    //console.log(Object.keys(qlinks));
    //console.log(Object.keys(qlinks).length);

    // saving user preference to local storage. 
    chrome.storage.sync.set({
        'clinks': clinks,
        'cnames': cnames,
        'qlinks': qlinks
    }, function () {

        document.getElementById('current_courses').innerHTML = cnames.toString();
        var bg = chrome.extension.getBackgroundPage();
        var status = document.getElementById('cstatus');
        // Update status to let user know courses were saved and contents are being fetched.
        status.textContent = 'courses saved and info is being updated.';
        // pass the message to background page
        bg.tasks();
        setTimeout(function () {
            status.textContent = '';
        }, 1000);
    });
}

function refresh() {
    var bg = chrome.extension.getBackgroundPage();
    var status = document.getElementById('rstatus');
    // Update status to let user that contents are being updated.
    status.textContent = 'refreshing notifications.';
    // pass the message to background page
    bg.tasks();

    setTimeout(function () {
        status.textContent = '';
    }, 700);
}