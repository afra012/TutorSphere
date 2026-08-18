import "./FAQItem.css";

function FAQItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className={`faq-item ${isOpen ? "open" : ""}`}>
      <button
        type="button"
        className="faq-item-question"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <span className="faq-item-icon">⌄</span>
      </button>

      <div className="faq-item-answer-wrapper">
        <div className="faq-item-answer">
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default FAQItem;
