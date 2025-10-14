// src/utils/index.js

/**
 * Cria uma URL para uma página específica.
 * @param {string} pageName - O nome da página (ex: "Dashboard").
 * @returns {string} - O caminho da URL (ex: "/Dashboard").
 */
export const createPageUrl = (pageName) => {
  return `/${pageName}`;
};