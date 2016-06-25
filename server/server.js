require('dotenv').config({ path: './env/development.env' });

// deubgging Bookshelf
process.stderr.on('data', function(data) {
  console.log(data);
});

const express = require('express');
const app = express();
const ingredientsRoutes = require('./routes/ingredientsRoutes.js');
const addRecipeRoutes = require('./routes/addRecipeRoutes.js');
const recipesRoutes = require('./routes/recipesRoutes.js');
const userProfileRoutes = require('./routes/userProfileRoutes.js');
const authRoutes = require('./routes/authRoutes.js');

// morgan, body-parser, static files
require('./config/init.js')(app, express);

app.use(express.static(__dirname + '/../client/public/'));

// set port
app.set('port', process.env.PORT || 3000);

// page specific routes
ingredientsRoutes(app);
recipesRoutes(app);
userProfileRoutes(app);
authRoutes(app);
addRecipeRoutes(app);

// (*)

// wildcard route
app.get('/*', (req, res) => res.redirect('/'));

// bind and listen to connections on specified port
app.listen(app.get('port'), () => {
  console.log('Express server started in '
    + app.get('env') + ' mode on port '
    + app.get('port'));
});

module.exports = app;

// (*)
// reference router
// app.use('/', router)

// app.route('/login')
// 	.get((req, res) => {
// 		res.sendFile(__dirname + '/../client/public/index.html');
// 		res.end();
// 	})

// app.route('/user/')
//  .get()
//  .post((req, res) => {
//  });

// app.route('/recipes/')
//  .get()
//  .post((req, res) => {
//  });
