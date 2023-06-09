/**
 * Scrolls to the bottom of the chatbox, using its total scroll height as the y-value
 */
function scrollChatbox() {
    const c = document.getElementById('chatbox');
    c.scrollTo(0, c.scrollHeight);
}

/**
 * Pre-pends a 0 in case the provided number is < 10
 */
function formatNumber(val) {
    if ('number' !== typeof val) {
        throw new Error(`Cannot pass a non-number to formatNumber`);
    }

    return `${val < 10 ? '0' : ''}${val}`;
}

/**
 * Formats the provided value as a DD.MM.YYYY HH:mm date
 * @param {Date|Number|String} date
 * @returns String
 */
function formatTimestamp(date) {
    let d = null;

    if (date instanceof Date) {
        // Check if a date was passed
        d = date;
    } else if ('number' === typeof date || 'string' === typeof date) {
        // If not, numbers and strings are potentially valid too, but have to be parsed
        // into a date first in order to receive the day etc. from them
        d = new Date(date);
    } else {
        // Throw an error otherwise for any other type
        throw new Error(`Unexpected type ${typeof date} in formatTimestamp`);
    }

    // Get all the individual parts for the date, using the formatNumber utility to make 09 of 9 for example
    const day = formatNumber(d.getDate());
    const month = formatNumber(d.getMonth() + 1);
    const year = d.getFullYear();

    const hours = formatNumber(d.getHours());
    const minutes = formatNumber(d.getMinutes());

    // Return the day in a DD.MM.YYYY HH:mm format
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

/**
 * Creates a new chat bubble and adds it to the chat box.
 * Scrolls to the bottom immediately after adding the chat bubble.
 * If content is falsy, nothing happens.
 *
 * @param {String} content Message that should be displayed in the chat bubble
 * @param {String|Date|Number} timestamp Time at which it was sent
 * @param {Boolean} me Whether the user is me or not (to determine if to render left or right)
 * @returns undefined
 */
function createChatBubble(content, timestamp, me = true) {
    // If content is falsy (mainly for '', early return and don't append an empty chat bubble)
    if (!content) {
        return;
    }

    // Create the new surrounding div for the bubble
    const bubble = document.createElement('div');
    // Create the time tag
    const time = document.createElement('time');
    // Create the div that contains the text content
    const bubblecontent = document.createElement('div');

    // Set the text content to the parameter provided by the function
    bubblecontent.innerHTML = content;
    // Set the text of the time tag by formatting the timestamp provided to this function
    time.innerHTML = formatTimestamp(timestamp);

    // Append the time and content to the bubble parent container
    bubble.appendChild(time);
    bubble.appendChild(bubblecontent);

    // Add appropriate child classes
    bubble.classList.add(
        'chatbubble',
        me ? 'chatbubble-right' : 'chatbubble-left',
    );
    // Set font sizes
    time.classList.add('is-size-7');
    // (technically unnecessary since size 6 is 1.0 rem which is normal font size)
    bubblecontent.classList.add('is-size-6');

    // Find the chatbox
    const chatbox = document.getElementById('chatbox');

    // Append the bubble at the bottom
    chatbox.appendChild(bubble);

    // ... and then immediately scroll to the bottom
    scrollChatbox();
}

/**
 * (technically not yet discussed)
 * @returns {string | null} the value of the "me" query param
 */
function getMe() {
    return new URLSearchParams(window.location.search).get('me');
}

/**
 * Reads the message input and creates a new chat bubble
 * using its value, along with a new date, and assuming it is
 * by the user, so moving it to the right side.
 *
 * Also empties the message field so a new message can be entered.
 */
function sendMessage() {
    createChatBubble(
        document.getElementById('message').value,
        new Date(),
        true,
    );
    writeMessageToDB(document.getElementById('message').value);
    document.getElementById('message').value = '';
}

/**
 * Handles the keypress event on the input to catch whether enter was pressed
 * to send the message. Alternatively, a form could be used.
 *
 * @param {KeyboardEvent} e Event to get the keypress from
 */
 function handleKeypress(e) {
    if (e.key === 'Enter') {
        sendMessage();
        
    }
}

async function writeMessageToDB(content){

    const written = await POST(`chats/${focusedChat}/messages`, {content:content, 
        sourceUser_id:session.idUser});

}



let session = null;
let chats = null;
let focusedChat = null;

function createContact(user){


    const entry = document.createElement('a');
    entry.setAttribute('class','panel-block');
    entry.innerText=`${user.firstName} ${user.lastName}`;

    const contacts = document.getElementById('contacts');


    contacts.appendChild(entry);

    entry.addEventListener('click', async (event) => {
    console.warn(event,user);
    clearAllBubbles();
    const nameheader = document.getElementById('nameheader');
    
    nameheader.innerText = entry.innerText;


    if(!user.idChat){

    const created = await POST('chats', {targetUser_id: user.idUser});
    focusedChat = created.idChat;
    
    }else{    
    const messages = await GET(`chats/${user.idChat}/messages`);
    focusedChat = user.idChat;
    }
    loadChat();
}
    )   
}

async function loadChat(){
    const messages = await GET(`chats/${focusedChat}/messages`);

    displayMessages(messages);
}

function displayMessages(messages){
    messages.forEach(message =>{
        let itstMe;
        const date = new Date(Number(message.sentAt));
        if (message.user_id == session.idUser) {
            itstMe = true;
        }else{
            itstMe = false;
        }

        createChatBubble(message.content, date, itstMe);

    })

}

function clearAllBubbles(){

    const chatbubbles = document.getElementsByClassName('chatbubble');

    while (chatbubbles.length > 0) {
      chatbubbles[0].parentNode.removeChild(chatbubbles[0]);
    }
}

// Attach an event listener to when the entire DOM is rendered
document.addEventListener('DOMContentLoaded', async function () {
    // Load all contacts
    const result = await GET('users');
    chats = result
    console.log(chats);


    result.forEach(element => {
        createContact(element);
    });

    // Load session
    session = await GET('session');

    console.log(session);
});
