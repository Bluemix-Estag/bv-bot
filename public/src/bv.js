"use strict";
// Variables for chat and stored context specific events
var params = {}; // Object for parameters sent to the Watson Conversation service
var watson = 'BV';
var user = '';
var text = '';
var context;
/**
 * @summary Enter Keyboard Event.
 *
 * When a user presses enter in the chat input window it triggers the service interactions.
 *
 * @function newEvent
 * @param {Object} e - Information about the keyboard event.
 */
function newEvent(e) {
    // Only check for a return/enter press - Event 13
    if (e.which === 13 || e.keyCode === 13) {
        var userInput = document.getElementById('chatInput');
        text = userInput.value; // Using text as a recurring variable through functions
        text = text.replace(/(\r\n|\n|\r)/gm, ""); // Remove erroneous characters
        // If there is any input then check if this is a claim step
        // Some claim steps are handled in newEvent and others are handled in userMessage
        if (text) {
            // Display the user's text in the chat box and null out input box
            
            userMessage(text);
            displayMessage(text, user);
            loadingMessage();
            userInput.value = '';
            
            
        }
        else {
            // Blank user message. Do nothing.
            console.error("No message.");
            userInput.value = '';
            return false;
        }
    }
}
/**
 * @summary Main User Interaction with Service.
 *
 * Primary function for parsing the conversation context  object, updating the list of
 * variables available to Ana, handling when a conversation thread ends and resetting the
 * context, and kicking off log generation.
 *
 * @function userMessage
 * @param {String} message - Input message from user or page load.
 */
function userMessage(message) {
    loadingMessage();
    // Set parameters for payload to Watson Conversation
    params.text = message; // User defined text to be sent to service
    params.user_time = new Date();
    if (context) {
        params.context = context;
        console.log('Params: ' + JSON.stringify(params));
    }
    
    
    
    console.log('nome: '+user);
    
    var xhr = new XMLHttpRequest();
    var uri = '/api/ana';
    xhr.open('POST', uri, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        // Verify if there is a success code response and some text was sent
        if (xhr.status === 200 && xhr.responseText) {
            var response = JSON.parse(xhr.responseText);
            text = response.output.text; // Only display the first response
            context = response.context; // Store the context for next round of questions
            console.log("Got response from Ana: ", JSON.stringify(response));
            if (response['cars']) {
                displayCarsMessage(response['cars'], watson);
            }
            if (response['context']['result'] && response['context']['trigger']) {
                delete response['context']['trigger'];
                if (context) {
                    context['result'] = response['context']['result'];
                }
                userMessage('ok');
            }
            for (var txt in text) {
                displayMessage(text[txt], watson);
            }
        }
        else {
            console.error('Server error for Conversation. Return status of: ', xhr.statusText);
            displayMessage("Putz, deu um tilt aqui. Você pode tentar novamente.", watson);
        }
    };
    xhr.onerror = function () {
        console.error('Network error trying to send message!');
        displayMessage("Ops, acho que meu cérebro está offline. Espera um minutinho para continuarmos por favor.", watson);
    };
    console.log(JSON.stringify(params));
    xhr.send(JSON.stringify(params));
}

function getTimestamp() {
    var d = new Date();
    var hours = d.getHours();
    var minutes = d.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}
/**
 * @summary Display Chat Bubble.
 *
 * Formats the chat bubble element based on if the message is from the user or from Ana.
 *
 * @function displayMessage
 * @param {String} text - Text to be dispalyed in chat box.
 * @param {String} user - Denotes if the message is from Ana or the user.
 * @return null
 */
function displayMessage(text, user) {
    
    loadingMessageStop();
    
    var chat = document.getElementById('chatBox');
    var bubble = document.createElement('div');
     
    bubble.className = 'message'; // Wrap the text first in a message class for common formatting
    // Set chat bubble color and position based on the user parameter
    if (user === watson) {
        var name = "BV";
        bubble.innerHTML = "<div class='anaTitle'>" + name + " | " + getTimestamp() + "</div><div class='ana'>" + text + "</div>";
    }
    else {
        var name = "John";
        if (context && context.fname && context.fname.length > 0) {
            name = context.fname;
        }
        bubble.innerHTML = "<div class='userTitle'>" + name + " | " + getTimestamp() + "</div><div class='user'>" + text + "</div>";
    }
    chat.appendChild(bubble);
    chat.scrollTop = chat.scrollHeight; // Move chat down to the last message displayed
    document.getElementById('chatInput').focus();
}

function displayCarsMessage(carsArray, watson) {
    var chat = document.getElementById('chatBox');
    var bubble = document.createElement('div');
    bubble.className = 'message'; // Wrap the text first in a message class for common formatting
    // Set chat bubble color and position based on the user parameter
    var name = "BV";
    bubble.innerHTML = "<div class='anaTitle'>" + name + " | " + getTimestamp() + "</div><div class='ana'>";
    //        bubble.innerHTML += "<div class='carListTable'>"
    for (var i = 0; i < carsArray.length; i++) {
        bubble.innerHTML += "<div class='carListTable' onclick='chooseCar(\"" + carsArray[i][0] + "\"," + carsArray[i][2] + ")'><div class='carImg'><img src='https://d1x1xhcjqq6e69.cloudfront.net/imagens-dinamicas/detalhe-veiculo-grande/fotos/" + carsArray[i][3] + "'alt='no img'/></div><div class='carDetails'><h4>" + carsArray[i][0] + "</h4><h5>Ano:" + carsArray[i][1] + "</h5><h5 class='carPrice'>Preço: " + carsArray[i][2] + "</h5></div></div>";
    }
    bubble.innerHTML += "</div>";
    chat.appendChild(bubble);
    chat.scrollTop = chat.scrollHeight; // Move chat down to the last message displayed
    document.getElementById('chatInput').focus();
}

function chooseCar(name, price) {
    if (context) {
        context.car_model = name;
        context.preco = price;
    }
    displayMessage(name, user);
    userMessage('ok');
}


function loadingMessage(){
    
    document.getElementById('typing_div').innerHTML = '<img src ="images/watson.gif"/>';
    document.getElementById('chatBox').scrollTop = document.getElementById('chatBox').scrollHeight; 
    
//    document.getElementById('typing_div').innerHTML = '<img src ="images/watson.gif"/>';
}
function loadingMessageStop(){
    document.getElementById('typing_div').innerHTML = '';
}