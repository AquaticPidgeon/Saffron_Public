// Note to team: try to do these relationally. If not,
// make use of the req object to obtain userID
const Ingredient = require('../models/ingredient.js');
const Recipe = require('../models/recipe.js');
const Ingredients = require('../collections/ingredients.js');
const Recipes = require('../collections/recipes.js'); // more conveinet to create w/ colleciton
const Ingredients_Recipes = require('../collections/ingredients_recipes.js');
const Recipes_Users = require('../collections/recipes_users.js');
// const User = require('../models/user.js');


module.exports = {
  addRecipe: (req, res) => {
    const userId = 1; // req.body.id
    const newRecipeTitle = req.body.recipeTitle;
    const newRecipeUrl = req.body.recipeUrl;
    const newRecipeImgUrl = req.body.recipeImgUrl;
    const ingredientsList = req.body.recipeIngredients; // TODO: account for plurals
    let recipeId;
    let ingredientId;

    // split `ingredients` in to array, then for each element, trim
    const ingredients = ingredientsList.split(',');
    const ingredientsArr = ingredients.map((ingredient) => ingredient.trim());

    // check if recipe already exists
    // console.log(Recipes.query('where', 'recipeUrl', '=', 'u4'));

    // check if recipe already exists
    Recipe.where({ recipeUrl: newRecipeUrl }).fetch()
      .then((foundRecipe) => {
        console.log(foundRecipe);
        // if so, then take it's id
        if (foundRecipe) {
          const foundRecipeId = foundRecipe.attributes.id;

          // favorite it for the user
          Recipes_Users.create({
            user_id: userId,
            recipe_id: foundRecipeId,
          }).then(() => {
            res.status(200).end();
          });
        } else { // if doesn't exist, then we need to create it
          Recipes.create({ // will return the model that was just created
            recipeTitle: newRecipeTitle,
            recipeUrl: newRecipeUrl,
            recipeImgUrl: newRecipeImgUrl,
          }).then((recipeModel) => {
            recipeId = recipeModel.attributes.id; // to be used later

            // Then we need to favorite it for them again
            Recipes_Users.create({
              user_id: userId,
              recipe_id: recipeId,
            });

            return recipeId;
          }).then((recId) => {
            console.log('>>>> Just in case, can you see the recId?:', recId);

            // Iterate through ingredients to [create new ingredient and] add to join tables
            ingredientsArr.forEach((ing) => {
              // Check if ingredient exists
              Ingredient.where({ ingredient: ing }).fetch()
                .then((foundModel) => {
                  if (foundModel) {  // If so, extract the id, so that can save to join table below
                    console.log('Model found. Extracting id...');
                    ingredientId = foundModel.attributes.id;
                    // TODO: Clean up by adding helper function for inserting in to join table
                    Ingredients_Recipes.create({
                      ingredient_id: ingredientId,
                      recipe_id: recId,
                    }).then((ingredient_recipe) => {
                      console.log('SENDING INGREDIENT_RECIPE:', ingredient_recipe);
                      res.status(200).end();
                    }).catch((error) => {
                      console.log(error);
                    });
                  } else { // Otherwise, we need to add the ingredient to our table of ingredients
                    console.log('Ingredient does not exist. Creating ingredient...');
                    Ingredients.create({
                      ingredient: ing,
                    }) // returns newly created model (see following)
                    .then((ingredientModel) => { // similarly, update join table w/ recipeId
                      ingredientId = ingredientModel.attributes.id;
                      // TODO: Clean up by adding helper function for inserting in to join table
                      Ingredients_Recipes.create({
                        ingredient_id: ingredientId,
                        recipe_id: recId,
                      }).then((ingredient_recipe) => {
                        console.log('SENDING INGREDIENT_RECIPE:', ingredient_recipe);
                        res.status(200).end();
                      }).catch((error) => {
                        console.log(error);
                      });
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                  }
                })
                .catch((err) => {
                  console.log(err);
                });
            });
          })
          .catch((err) => {
            console.log(err);
          });
        }
      });
  },
};
