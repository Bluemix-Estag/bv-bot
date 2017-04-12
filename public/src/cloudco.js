/*eslint-env browser */
var fname, lname;

function openTravel() {
    window.location = "travel.html";
}

function openTravelPolicies() {
    window.location = "watson.html";
}

function openHealth() {
    console.log('open health');
}

function register() {
    var firstname = document.getElementById('fname').value;
    var lastname = document.getElementById('lname').value;
    var username = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var message = document.getElementById('messagearea');
    message.innerHTML = '';
    var xhr = new XMLHttpRequest();
    var uri = 'signup';
    var user = {
        'username': username
        , 'password': password
        , 'fname': firstname
        , 'lname': lastname
    };
    xhr.open('POST', uri, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        if (xhr.status === 200 && xhr.responseText) {
            var response = JSON.parse(xhr.responseText);
            console.log("Got response from passport: ", JSON.stringify(response));
            if (response.username) {
                window.location = './login';
            }
            else {
                message.innerHTML = response.message;
                username = '';
                password = '';
                firstname = '';
                lastname = '';
            }
        }
        else {
            var response = JSON.parse(xhr.responseText);
            console.error('Server error for passport. Return status of: ', xhr.statusText);
            if (typeof response.message === "string") {
                message.innerHTML = response.message;
            }
            else {
                message.innerHTML = response.message.message;
            }
        }
        return false;
    };
    xhr.onerror = function () {
        console.error('Network error trying to send message!');
    };
    console.log(JSON.stringify(user));
    xhr.send(JSON.stringify(user));
}

function login() {
    var username = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var xhr = new XMLHttpRequest();
    var uri = 'login';
    var message = document.getElementById('messagearea');
    message.innerHTML = '';
    var user = {
        'username': username
        , 'password': password
    };
    xhr.open('POST', uri, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        var response = JSON.parse(xhr.responseText);
        if (xhr.status === 200 && xhr.responseText) {
            console.log("Got response from passport: ", JSON.stringify(response));
            if (response.username) {
                window.location = './health';
            }
            else {
                message.innerHTML = response.message;
                username = '';
                password = '';
            }
        }
        else {
            console.error('Server error for passport. Return status of: ', xhr.statusText);
            if (typeof response.message === "string") {
                message.innerHTML = response.message;
            }
            else {
                message.innerHTML = response.message.message;
            }
        }
        return false;
    };
    xhr.onerror = function () {
        console.error('Network error trying to send message!');
    };
    //console.log(JSON.stringify(user));
    xhr.send(JSON.stringify(user));
}

function get(path, callback) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            callback(JSON.parse(xmlhttp.responseText));
        }
    }
    xmlhttp.open("GET", path, true);
    xmlhttp.send();
}


function unique(value, index, self) {
    return self.indexOf(value) === index;
}

function initConvOnLoad() {
    checkStatus();    
    // Load Ana's first message after the user info
    userMessage('');
}

function submitClaim(source) {
    var claimFile = {
        date: null
        , benefit: null
        , provider: null
        , amount: null
    };
    var dateElement = document.getElementById('claimdate');
    var benefitElement = document.getElementById('benefittypes');
    var providerElement = document.getElementById('provider');
    var amountElement = document.getElementById('claimamount');
    claimFile.date = dateElement.value;
    claimFile.benefit = benefitElement.value;
    claimFile.provider = providerElement.value;
    claimFile.amount = amountElement.value;
    var xhr = new XMLHttpRequest();
    var uri = '/submitClaim';
    var claimmessages = document.getElementById('claimmessages');
    xhr.open('POST', uri, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function (response) {
        if (xhr.status === 200 && xhr.responseText) {
            var reply = JSON.parse(xhr.responseText);
            if (reply.outcome === 'success') {
                claimmessages.innerHTML = 'Seu reembolso foi salvo.';
            }
            else {
                claimmessages.innerHTML = 'Algo deu errado - tente novamente';
            }
        }
        else {
            alert('Request failed.  Returned status of ' + xhr.status);
        }
    };
    console.log("Submitting claim: ", JSON.stringify(claimFile));
    xhr.send(JSON.stringify(claimFile));
}

function checkStatus() {
    var login = document.getElementById('login');
    var logout = document.getElementById('logout');
    
    var xhr = new XMLHttpRequest();
    var path = '/isLoggedIn';
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var reply = JSON.parse(xhr.responseText);
            console.log("Reply: ", reply);
            if (reply.outcome === 'success') {
                if (logout) {
                    login.style.display = 'none';
                }
                if (login) {
                    logout.style.display = 'inherit';
                }
            }
            else {
                if (logout) {
                    logout.style.display = 'none';
                }
                if (login) {
                    login.style.display = 'inherit';
                }
            }
        }
        else {
            if (login) {
                login.style.display = 'inherit';
            }
            if (logout) {
                logout.style.display = 'none';
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

// Enter is pressed for login
function newEvent(e, target) {
   
    if (e.which === 13 || e.keyCode === 13) {
        if (target === "login") {
            login();
        }
    }
}
checkStatus();