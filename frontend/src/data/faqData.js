// FAQ data for the TutorSphere Help page
// Each item belongs to a category and is searchable by question/answer text.

const faqData = [
  // ---------- Finding Tutors ----------
  {
    id: "find-1",
    category: "Finding Tutors",
    question: "How do I find the right tutor for my subject?",
    answer:
      "Use the search bar on the Job Dashboard to filter tutors by subject, grade level, location, and availability. You can also compare tutor profiles, ratings, and reviews before reaching out.",
  },
  {
    id: "find-2",
    category: "Finding Tutors",
    question: "Can I filter tutors by location or online availability?",
    answer:
      "Yes. The Job Dashboard lets you filter tutors by city/area as well as by whether they offer online, in-person, or both types of sessions.",
  },
  {
    id: "find-3",
    category: "Finding Tutors",
    question: "What should I check before contacting a tutor?",
    answer:
      "Review the tutor's profile details, subjects taught, experience, verification badge, and past reviews to make sure they're a good fit before sending a request.",
  },

  // ---------- Posting Tutor Requirements ----------
  {
    id: "post-1",
    category: "Posting Requirements",
    question: "How do I post my tutoring requirements?",
    answer:
      "Go to your dashboard and click 'Post a Requirement'. Fill in the subject, grade level, preferred schedule, and budget so tutors can see if they're a good match.",
  },
  {
    id: "post-2",
    category: "Posting Requirements",
    question: "Can I edit or delete a posted requirement?",
    answer:
      "Yes, open 'My Requirements' from your dashboard, select the post, and choose Edit or Delete. Changes are visible to tutors immediately.",
  },
  {
    id: "post-3",
    category: "Posting Requirements",
    question: "How many tutor requirements can I post at once?",
    answer:
      "There's no strict limit, but we recommend keeping only active requirements open so tutors don't apply to requests you've already filled.",
  },

  // ---------- Hiring Tutors ----------
  {
    id: "hire-1",
    category: "Hiring Tutors",
    question: "How do I hire a tutor on TutorSphere?",
    answer:
      "Once you find a tutor you like, send them a request or accept their application to your posted requirement. You can then message them to confirm schedule and payment details before starting sessions.",
  },
  {
    id: "hire-2",
    category: "Hiring Tutors",
    question: "Is TutorSphere free to use?",
    answer:
      "Creating an account, browsing tutors, and posting requirements is completely free. Some premium features, like featured listings, may involve a small fee.",
  },
  {
    id: "hire-3",
    category: "Hiring Tutors",
    question: "What should I do if I experience a payment issue?",
    answer:
      "Contact our support team immediately through the Contact Support option below with your transaction details. We'll investigate and get back to you within 24-48 hours.",
  },

  // ---------- Tutor Profiles ----------
  {
    id: "profile-1",
    category: "Tutor Profiles",
    question: "How do I create or update my tutor profile?",
    answer:
      "Go to Profile Settings from your dashboard to add your subjects, qualifications, experience, hourly rate, and availability. Keeping your profile updated helps you get more requests.",
  },
  {
    id: "profile-2",
    category: "Tutor Profiles",
    question: "How does tutor verification work?",
    answer:
      "Tutors can submit ID and qualification documents for review. Verified tutors receive a badge on their profile, which helps build trust with students and parents.",
  },
  {
    id: "profile-3",
    category: "Tutor Profiles",
    question: "Can I hide my profile temporarily?",
    answer:
      "Yes, use the 'Availability' toggle in Profile Settings to mark yourself as unavailable. Your profile stays saved but won't appear in active search results.",
  },

  // ---------- Reviews & Ratings ----------
  {
    id: "review-1",
    category: "Reviews & Ratings",
    question: "How do I leave a review for a tutor?",
    answer:
      "After a completed session, you'll get a prompt to rate and review your tutor from your dashboard. You can also do this anytime from the tutor's profile page.",
  },
  {
    id: "review-2",
    category: "Reviews & Ratings",
    question: "Can I edit or remove a review I posted?",
    answer:
      "Yes, go to 'My Reviews' in your account settings, where you can edit or delete any review you've submitted within 30 days of posting.",
  },
  {
    id: "review-3",
    category: "Reviews & Ratings",
    question: "What should I do if I receive an unfair review?",
    answer:
      "If you believe a review violates our community guidelines, report it via Contact Support with the details. Our team will review and take appropriate action.",
  },
];

export const faqCategories = [
  "All",
  "Finding Tutors",
  "Posting Requirements",
  "Hiring Tutors",
  "Tutor Profiles",
  "Reviews & Ratings",
];

export default faqData;
