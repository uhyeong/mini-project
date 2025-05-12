

const chatLog = document.getElementById('chatLog');
const chatInput = document.getElementById('chatInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const newChatBtn = document.getElementById('newChatBtn');
const initialScreen = document.getElementById('initialScreen');
const sidebar = document.getElementById('sidebar');
const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
const sidebarToggleIcon = document.getElementById('sidebarToggleIcon');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const chatHistoryContainer = document.getElementById('chatHistoryContainer');
const isUserLoggedIn = window.isUserLoggedIn === "true";
let isSidebarCollapsed = false;
let currentChatHistory = []; // To store messages of current session

// --- Django API 연동 함수들 ---
function getCSRFToken() {
    const name = "csrftoken";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            return decodeURIComponent(cookie.substring(name.length + 1));
        }
    }
    return "";
}

async function fetchBotResponse(userMessage, sessionId) {
    try {
        const response = await fetch("/chatbot/chat/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken()
            },
            body: JSON.stringify({ message: userMessage, session_id: sessionId })
        });

        if (!response.ok) throw new Error("Server error");

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error("Failed to get bot response:", error);
        return "Sorry, something went wrong.";
    }
}

let activeSessionId = null;

async function fetchSessions() {
    const res = await fetch("/chatbot/sessions/");
    return await res.json();
}

async function createSession(title = null) {
    const res = await fetch("/chatbot/sessions/create/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken()
        },
        body: JSON.stringify({ title })
    });
    return await res.json();
}

async function deleteSession(sessionId) {
    await fetch(`/chatbot/sessions/${sessionId}/delete/`, {
        method: "POST",
        headers: { "X-CSRFToken": getCSRFToken() }
    });

    if (activeSessionId === sessionId) {
        location.reload();
    }

}

async function loadSessionMessages(sessionId) {
    try {
        const res = await fetch(`/chatbot/sessions/${sessionId}/messages/`);
        const messages = await res.json();

        chatLog.innerHTML = "";
        messages.forEach(msg => {
            addMessageToLog(msg.text, msg.sender);
        });
        currentChatHistory = messages;
    } catch (e) {
        console.error("Failed to load session messages", e);
    }
}

async function renderSidebarSessions() {
    const sessions = await fetchSessions();
    const container = document.getElementById("chatHistoryContainer");
    container.innerHTML = "";

    sessions.forEach(session => {
        const item = document.createElement("a");
        item.href = "#";
        let classList = "chat-history-item group flex items-center justify-between p-2.5 rounded-md transition-colors duration-150 text-sm";
        // 현재 활성화된 세션이면 진하게
        if (session.id === activeSessionId) {
            classList += " bg-gray-700 font-semibold";  // 강조
        } else {
            classList += " hover:bg-gray-700/50";  // 일반 hover 효과
        }
        
        item.className = classList;
        item.dataset.sessionId = session.id;

        const span = document.createElement("span");
        span.className = "flex-grow flex items-center truncate sidebar-item-content";
        span.innerHTML = `<i class='far fa-comment-alt mr-2.5 opacity-70'></i><span class='sidebar-text truncate'>${session.title}</span>`;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-chat-btn p-1 ml-1 rounded-md text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150 focus:outline-none flex-shrink-0";
        deleteBtn.innerHTML = `<i class="fas fa-trash-alt text-xs"></i>`;

        deleteBtn.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await deleteSession(session.id);
            renderSidebarSessions();
        };

        item.onclick = () => {
            activeSessionId = session.id;
            renderSidebarSessions();
            loadSessionMessages(session.id);
        }

        item.appendChild(span);
        item.appendChild(deleteBtn);
        container.appendChild(item);
    });
}



// --- UTILITY FUNCTIONS ---
function escapeHtml(unsafe) {
    return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}

function formatMessageContent(text) {
    let formattedText = escapeHtml(text);
    // Code blocks (```...```)
    formattedText = formattedText.replace(/```([\s\S]*?)```/g, (match, codeContent) => {
        return `<pre><code>${codeContent.trim()}</code></pre>`;
    });
    // Inline code (`)
    formattedText = formattedText.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Unordered lists (* item)
    formattedText = formattedText.replace(/^\* (.*$)/gm, '<ul><li>$1</li></ul>').replace(/<\/ul>\s*<ul>/gm, '');
    // Ordered lists (1. item)
    formattedText = formattedText.replace(/^(\d+)\. (.*$)/gm, '<ol><li>$2</li></ol>').replace(/<\/ol>\s*<ol>/gm, '');
    // Newlines
    return formattedText.replace(/\n/g, '<br>');
}

// --- UI FUNCTIONS ---
function autoResizeTextarea() {
    chatInput.style.height = 'auto';
    let newHeight = chatInput.scrollHeight;
    const maxHeight = 160; // Max height in pixels
    if (newHeight > maxHeight) {
        newHeight = maxHeight;
        chatInput.style.overflowY = 'auto';
    } else {
        chatInput.style.overflowY = 'hidden';
    }
    chatInput.style.height = newHeight + 'px';
    sendMessageBtn.disabled = chatInput.value.trim() === '';
}

function addMessageToLog(message, sender, isThinking = false) {
    if (initialScreen && !initialScreen.classList.contains('hidden')) {
        initialScreen.classList.add('hidden');
    }
    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('chat-message-item', 'flex', 'mb-3', 'max-w-full', 'md:max-w-[85%]', 'lg:max-w-[75%]');
    const iconDiv = document.createElement('div');
    iconDiv.classList.add('mr-3', 'flex-shrink-0');
    const icon = document.createElement('i');
    icon.classList.add('fas', 'p-2', 'rounded-full', 'text-lg', 'h-8', 'w-8', 'flex', 'items-center', 'justify-center');
    const messageBubble = document.createElement('div');
    messageBubble.classList.add('p-3', 'rounded-lg', 'break-words', 'message-content');

    if (sender === 'user') {
        messageWrapper.classList.add('justify-end', 'ml-auto');
        icon.classList.add('fa-user-astronaut', 'bg-indigo-500', 'text-white');
        messageBubble.classList.add('bg-indigo-500', 'text-white', 'rounded-br-none');
        messageBubble.innerHTML = formatMessageContent(message);
        messageWrapper.appendChild(messageBubble);
        messageWrapper.appendChild(iconDiv);
        iconDiv.appendChild(icon);
    } else {
        messageWrapper.classList.add('justify-start', 'mr-auto');
        icon.classList.add('fa-robot', 'bg-gray-600', 'text-indigo-300');
        messageBubble.classList.add('bg-gray-600', 'text-gray-200', 'rounded-bl-none');
        iconDiv.appendChild(icon);
        messageWrapper.appendChild(iconDiv);
        messageWrapper.appendChild(messageBubble);
        if (isThinking) {
            messageBubble.id = 'typingIndicatorBubble';
            messageBubble.innerHTML = `<div class="flex items-center"><div class="typing-indicator-dot"></div><div class="typing-indicator-dot"></div><div class="typing-indicator-dot"></div></div>`;
        } else {
            messageBubble.innerHTML = formatMessageContent(message);
        }
    }
    chatLog.appendChild(messageWrapper);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function showTypingIndicator() {
    addMessageToLog('', 'bot', true);
}

function removeTypingIndicator() {
    const typingBubble = document.getElementById('typingIndicatorBubble');
    if (typingBubble && typingBubble.parentElement) {
        typingBubble.parentElement.remove();
    }
}

// --- CHAT LOGIC ---

async function handleSendMessage() {
    const messageText = chatInput.value.trim();
    if (messageText === '') return;
    if (isUserLoggedIn && !activeSessionId) {
        const title = messageText.split('\n')[0].slice(0, 50);  // 제목 추출
        const session = await createSession(title);
        activeSessionId = session.id;
        await renderSidebarSessions();
    }

    currentChatHistory.push({ sender: 'user', text: messageText });
    addMessageToLog(messageText, 'user');
    chatInput.value = '';
    autoResizeTextarea();
    chatInput.focus();
    showTypingIndicator();

    const botResponse = await fetchBotResponse(messageText, activeSessionId);
    removeTypingIndicator();
    currentChatHistory.push({ sender: 'bot', text: botResponse });
    addMessageToLog(botResponse, 'bot');

    // 제목 업데이트
    const firstHistoryItem = chatHistoryContainer.querySelector('.chat-history-item');
    if (firstHistoryItem && firstHistoryItem.querySelector('.sidebar-text').textContent.startsWith("New Chat")) {
        let newTitle = messageText.split('\\n')[0];
        newTitle = newTitle.length > 30 ? newTitle.substring(0, 27) + "..." : newTitle;
        if (newTitle.trim() === "") newTitle = "Chat Summary";

        const textSpan = firstHistoryItem.querySelector('.sidebar-text.truncate');
        if (textSpan) textSpan.textContent = newTitle;
    }
}


function startNewChat() {
    chatLog.innerHTML = ''; // Clear messages from previous chat
    currentChatHistory = []; // Reset current session's message history
    if (initialScreen) {
        initialScreen.classList.remove('hidden'); // Show initial welcome screen
    }
    
    // Create a new entry in the chat history sidebar
    const newHistoryEntry = document.createElement('a');
    newHistoryEntry.href = "#"; // Placeholder link
    newHistoryEntry.className = "chat-history-item group flex items-center justify-between p-2.5 rounded-md hover:bg-gray-700/50 transition-colors duration-150 text-sm";
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const contentSpan = document.createElement('span');
    contentSpan.className = "flex-grow flex items-center truncate sidebar-item-content";
    // The icon for a chat item
    const chatIcon = document.createElement('i');
    chatIcon.className = "far fa-comment-alt mr-2.5 opacity-70";
    // The text span for the chat title
    const textSpan = document.createElement('span');
    textSpan.className = "sidebar-text truncate";
    textSpan.textContent = `New Chat (${timestamp})`;
    
    contentSpan.appendChild(chatIcon);
    contentSpan.appendChild(textSpan);

    // Create the delete button for this new history item
    const deleteButton = document.createElement('button');
    deleteButton.className = "delete-chat-btn p-1 ml-1 rounded-md text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150 focus:outline-none flex-shrink-0";
    deleteButton.innerHTML = `<i class="fas fa-trash-alt text-xs"></i>`;
    // Assign delete functionality directly
    addDeleteFunctionality(newHistoryEntry); // Use the helper for consistency

    newHistoryEntry.appendChild(contentSpan);
    newHistoryEntry.appendChild(deleteButton);
    
    chatHistoryContainer.insertBefore(newHistoryEntry, chatHistoryContainer.firstChild); // Add to top of history

    // Handle collapsed state for the new item
    if (isSidebarCollapsed) {
            textSpan.style.display = 'none';
            contentSpan.style.justifyContent = 'center';
    }
    chatInput.focus();
    renderSidebarSessions();
}

// This function is no longer directly used as suggestion cards are removed,
// but kept for potential future re-integration or other similar features.
window.handleSuggestionClick = function(suggestionText) {
    chatInput.value = suggestionText;
    autoResizeTextarea();
    handleSendMessage();
}

// --- SIDEBAR & MOBILE MENU ---
function toggleSidebar() {
    isSidebarCollapsed = !isSidebarCollapsed;
    sidebar.classList.toggle('collapsed');
    
    const sidebarTexts = sidebar.querySelectorAll('.sidebar-text');
    const sidebarItemContents = sidebar.querySelectorAll('.sidebar-item-content');
    const newChatBtnPenIcon = newChatBtn.querySelector('.fa-pen-to-square');
    const newChatBtnPlusIcon = newChatBtn.querySelector('.fa-plus');

    if (isSidebarCollapsed) {
        sidebarToggleIcon.classList.remove('fa-angles-left');
        sidebarToggleIcon.classList.add('fa-angles-right');
        sidebar.querySelector('#toggleSidebarBtn .sidebar-text').textContent = "Expand";
        if (newChatBtnPenIcon) newChatBtnPenIcon.style.display = 'none';
        if (newChatBtnPlusIcon) newChatBtnPlusIcon.style.marginRight = '0';
    } else {
        sidebarToggleIcon.classList.remove('fa-angles-right');
        sidebarToggleIcon.classList.add('fa-angles-left');
        sidebar.querySelector('#toggleSidebarBtn .sidebar-text').textContent = "Collapse";
        if (newChatBtnPenIcon) newChatBtnPenIcon.style.display = 'inline-block';
        if (newChatBtnPlusIcon) newChatBtnPlusIcon.style.marginRight = '0.5rem'; // Default Tailwind 'mr-2'
    }
    
    // Hide/show all elements with .sidebar-text class based on collapsed state
    sidebarTexts.forEach(textEl => {
        // Special handling for the pen icon on new chat button as it also has .sidebar-text
        if (textEl.classList.contains('fa-pen-to-square') && textEl.closest('#newChatBtn')) {
            textEl.style.display = isSidebarCollapsed ? 'none' : 'inline-block';
        } else {
            textEl.style.display = isSidebarCollapsed ? 'none' : 'inline';
        }
    });
    
    sidebarItemContents.forEach(contentEl => {
        contentEl.style.justifyContent = isSidebarCollapsed ? 'center' : 'flex-start';
    });
}


// --- EVENT LISTENERS ---
chatInput.addEventListener('input', autoResizeTextarea);
sendMessageBtn.addEventListener('click', handleSendMessage);
chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
    }
});

newChatBtn.addEventListener('click', async () => {
    location.reload();
});

toggleSidebarBtn.addEventListener('click', toggleSidebar);

// --- INITIALIZATION ---
autoResizeTextarea(); // Initialize textarea height and button state
if (window.innerWidth < 768) { // Initially hide sidebar on small screens
    sidebar.classList.add('hidden');
    // Potentially also set isSidebarCollapsed = true if that's the desired default for mobile after opening
}
chatInput.focus();
renderSidebarSessions();

// Add delete functionality to statically loaded chat history items
document.querySelectorAll('#chatHistoryContainer .chat-history-item').forEach(item => {
    addDeleteFunctionality(item);
});
document.addEventListener("DOMContentLoaded", async () => {
    await renderSidebarSessions();  // ✅ 사이드바 세션 초기 렌더링
    autoResizeTextarea();           // ✅ textarea 상태 초기화
    chatInput?.focus();             // ✅ 포커스 이동
});