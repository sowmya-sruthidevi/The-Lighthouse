import api from './client';

export const getReviews = () => api.get('/reviews');
export const createReview = (data) => api.post('/reviews', data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);
