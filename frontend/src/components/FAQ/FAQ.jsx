import { useMemo, useState } from "react";

import "./FAQ.css";
import FAQItem from "./FAQItem";
import faqData, { faqCategories } from "../../data/faqData";

function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openId, setOpenId] = useState(null);

  const filteredFaqs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return faqData.filter((faq) => {
      const matchesCategory =
        activeCategory === "All" || faq.category === activeCategory;

      const matchesSearch =
        query === "" ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, activeCategory]);

  const handleToggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="faq-section">
      {/* Search Bar */}
      <div className="faq-search-bar">
        <span className="faq-search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search for topics, e.g., 'tutors' or 'payment'"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Categories */}
      <div className="faq-categories">
        {faqCategories.map((category) => (
          <button
            key={category}
            type="button"
            className={`faq-category-button ${
              activeCategory === category ? "active" : ""
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="faq-list">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => (
            <FAQItem
              key={faq.id}
              question={faq.question}
              answer={faq.answer}
              isOpen={openId === faq.id}
              onToggle={() => handleToggle(faq.id)}
            />
          ))
        ) : (
          <div className="faq-no-results">
            <p className="faq-no-results-title">No matching questions found</p>
            <p className="faq-no-results-text">
              Try a different keyword or browse another category, or reach
              out to our support team below.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FAQ;
