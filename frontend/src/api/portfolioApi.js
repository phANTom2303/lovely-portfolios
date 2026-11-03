import api from './api';

export async function fetchPortfolios() {
  const response = await api.get('/api/portfolio');
  return response.data.data;
}

export async function fetchPortfolio(portfolioId) {
  const response = await api.get('/api/portfolio', {
    params: { portfolio_id: portfolioId },
  });
  return response.data.data;
}

// Public: only resolves for published portfolios
export async function fetchPublicPortfolio(portfolioId) {
  const response = await api.get(`/api/portfolio/public/${portfolioId}`);
  return response.data.data;
}

export async function createPortfolio(payload) {
  const response = await api.post('/api/portfolio', payload);
  return response.data.data;
}

export async function generatePortfolio(jdText) {
  // Returns { portfolio_id, portfolio_json }
  const response = await api.post('/api/portfolio/generate', { jd_text: jdText });
  return response.data.data;
}

export async function updatePortfolio(payload) {
  const response = await api.patch('/api/portfolio', payload);
  return response.data.data;
}

export async function deletePortfolio(portfolioId) {
  const response = await api.delete('/api/portfolio', {
    params: { portfolio_id: portfolioId },
  });
  return response.data.data;
}
