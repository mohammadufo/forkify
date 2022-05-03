import * as model from './model.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import { MODEL_CLOSE_SEC } from './config.js';

///////////////////////////////////////

const controllRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    //* Mark selected search result
    resultsView.update(model.getSearchResultsPage());
    //* Updating bookmarks
    bookmarksView.update(model.state.bookmarks);

    //* Loading recipe
    await model.loadRecipe(id);

    //* Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controllSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    //* Get search query
    const query = searchView.getQuery();
    if (!query) return;

    //* Load search
    await model.loadSearchResults(query);

    //* Render results
    resultsView.render(model.getSearchResultsPage());

    //* Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controllPagination = function (goToPage) {
  //* Render new results
  resultsView.render(model.getSearchResultsPage(goToPage));

  //* Render new pagination buttons
  paginationView.render(model.state.search);
};

const controllServings = function (newServings) {
  //* Update the recipe serving in state
  model.updateServings(newServings);

  //* Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controllAddBookmark = function () {
  //! Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  //! update recipe view
  recipeView.update(model.state.recipe);
  //! Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controllBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controllAddRecipe = async function (newRecipe) {
  try {
    //* Show loading spinner
    addRecipeView.renderSpinner();

    //* Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //* Render recipe
    recipeView.render(model.state.recipe);

    //* Success messege
    addRecipeView.renderMessage();

    //* Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //* Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //* Close modal
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODEL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controllBookmarks);
  recipeView.addHandlerRender(controllRecipes);
  recipeView.addHandlerUpdateServings(controllServings);
  recipeView.addhandlerAddBookmark(controllAddBookmark);
  searchView.addHandlerSearch(controllSearchResults);
  paginationView.addhandlerClick(controllPagination);
  addRecipeView.addHandlerUpload(controllAddRecipe);
};
init();
