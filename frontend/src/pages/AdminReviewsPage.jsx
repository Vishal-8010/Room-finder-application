import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../api';
import { FaTrash, FaFlag } from 'react-icons/fa';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, published, flagged

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllReviews({ filter: filter !== 'all' ? filter : undefined });
      setReviews(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch reviews');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await adminAPI.deleteReview(reviewId);
      toast.success('Review deleted');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const handleFlagReview = async (reviewId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'flagged' ? 'published' : 'flagged';
      await adminAPI.updateReviewStatus(reviewId, newStatus);
      toast.success('Review status updated');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to update review status');
    }
  };

  const filteredReviews = reviews.filter((r) => filter === 'all' || r.status === filter);

  return (
    <div className="min-h-screen bg-light py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-dark mb-2">Reviews Management</h1>
          <p className="text-secondary">Monitor and remove inappropriate reviews</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['all', 'published', 'flagged'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                filter === status ? 'bg-primary text-white' : 'bg-white text-dark hover:bg-light'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Reviews List */}
        {filteredReviews.length > 0 ? (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div key={review._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-dark">{review.author}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm text-secondary">{review.rating}/5</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        review.status === 'flagged' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {review.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFlagReview(review._id, review.status)}
                      className="p-2 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200 transition"
                      title="Flag"
                    >
                      <FaFlag />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <p className="text-secondary">{review.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-secondary">No reviews found</p>
          </div>
        )}
      </div>
    </div>
  );
}
