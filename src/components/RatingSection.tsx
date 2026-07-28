'use client';

import { useState } from 'react';

export default function RatingSection() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleRate = (star: number) => {
    setRating(star);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="section-card rating-section">
      <p className="rating-section__title">
        {submitted ? '✨ Obrigado pela avaliação!' : '⭐ Avaliar barbearia'}
      </p>
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`rating-star ${star <= (hoverRating || rating) ? 'active' : ''}`}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );
}
