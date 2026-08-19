import { useMemo, useState } from "react";
import DashboardSidebar from "../../components/Dashboard/DashboardSidebar";
import "./Messages.css";

const conversations = [
  { id: 1, name: "Nusrat Jahan", subject: "Mathematics Tutor", initials: "NJ", color: "purple", preview: "Sure, I can help you with that!", time: "10:42 AM", online: true, unread: 2 },
  { id: 2, name: "Tanvir Ahmed", subject: "Physics Tutor", initials: "TA", color: "blue", preview: "Your session is confirmed for tomorrow.", time: "Yesterday", online: true },
  { id: 3, name: "Sadia Islam", subject: "English Tutor", initials: "SI", color: "pink", preview: "Thank you for the notes.", time: "Mon" },
  { id: 4, name: "Rakib Hasan", subject: "Chemistry Tutor", initials: "RH", color: "orange", preview: "Let me know a suitable time.", time: "Sun" },
];

const initialMessages = [
  { id: 1, from: "them", text: "Hello! I saw your request for a Mathematics tutor.", time: "10:31 AM" },
  { id: 2, from: "me", text: "Hi Nusrat! Yes, I need help with algebra and geometry.", time: "10:35 AM" },
  { id: 3, from: "them", text: "Sure, I can help you with that! Which class are you in?", time: "10:42 AM" },
];

function SearchIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>;
}

function SendIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 3-8.5 18-2.8-7.7L2 10.5 21 3Z" /><path d="m9.7 13.3 4.1-4.1" /></svg>;
}

export default function Messages() {
  const [activeId, setActiveId] = useState(1);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(initialMessages);

  const visibleConversations = useMemo(
    () => conversations.filter((conversation) => conversation.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  );
  const activeConversation = conversations.find((conversation) => conversation.id === activeId) ?? conversations[0];

  const sendMessage = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((current) => [...current, { id: Date.now(), from: "me", text, time: "Now" }]);
    setDraft("");
  };

  return (
    <div className="messages-page">
      <DashboardSidebar active="Messages" />

      <main className="messages-main">
        <div className="messages-heading">
          <div><p>Communication</p><h1>Messages</h1></div>
          <span>{conversations.length} conversations</span>
        </div>

        <section className="messenger-panel" aria-label="Messages">
          <aside className="conversation-list">
            <div className="conversation-list-top"><h2>Chats</h2><button type="button" aria-label="Start a new chat">+</button></div>
            <label className="conversation-search"><SearchIcon /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search conversations" /></label>
            <div className="conversation-items">
              {visibleConversations.map((conversation) => (
                <button key={conversation.id} type="button" className={`conversation-item ${activeId === conversation.id ? "is-active" : ""}`} onClick={() => setActiveId(conversation.id)}>
                  <span className={`conversation-avatar ${conversation.color}`}>{conversation.initials}{conversation.online && <i />}</span>
                  <span className="conversation-copy"><span><strong>{conversation.name}</strong><time>{conversation.time}</time></span><small>{conversation.subject}</small><em>{conversation.preview}</em></span>
                  {conversation.unread && <b>{conversation.unread}</b>}
                </button>
              ))}
            </div>
          </aside>

          <section className="chat-window">
            <header className="chat-header">
              <span className={`chat-avatar ${activeConversation.color}`}>{activeConversation.initials}</span>
              <div><h2>{activeConversation.name}</h2><p>{activeConversation.online ? "Active now" : activeConversation.subject}</p></div>
              <button type="button" className="chat-more" aria-label="More options">•••</button>
            </header>

            <div className="chat-content">
              <p className="chat-date">Today</p>
              {messages.map((message) => <div className={`message-row ${message.from}`} key={message.id}><div className="message-bubble">{message.text}<time>{message.time}</time></div></div>)}
            </div>

            <form className="message-composer" onSubmit={sendMessage}>
              <button type="button" aria-label="Add attachment" className="attachment-button">+</button>
              <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Message ${activeConversation.name}`} aria-label="Write a message" />
              <button type="submit" className="send-button" aria-label="Send message"><SendIcon /></button>
            </form>
          </section>
        </section>
      </main>
    </div>
  );
}
