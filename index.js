const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

const users = [];      // Store user information
const exercises = [];  // Store exercise logs

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Endpoint to create a new user
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const userId = Date.now().toString(36);  // Simple unique ID generation
  const user = { username, _id: userId };
  
  users.push(user);
  res.json(user);
});

// Endpoint to retrieve all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Endpoint to add an exercise to a user's log
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const user = users.find(user => user._id === _id);
  
  if (!user) {
    return res.json({ error: 'User not found' });
  }

  const { description, duration } = req.body;
  const date = req.body.date ? new Date(req.body.date) : new Date();
  const exercise = {
    username: user.username,
    description,
    duration: parseInt(duration),
    date: date.toDateString(),
    _id: user._id
  };

  exercises.push(exercise);
  res.json(exercise);
});

// Endpoint to retrieve a user's exercise log with optional date range and limit
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const user = users.find(user => user._id === _id);

  if (!user) {
    return res.json({ error: 'User not found' });
  }

  // Filter exercises by user ID
  let userExercises = exercises.filter(ex => ex._id === _id);

  // Apply date filtering if "from" or "to" are specified
  const { from, to, limit } = req.query;
  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(ex => new Date(ex.date) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(ex => new Date(ex.date) <= toDate);
  }

  // Apply limit if specified
  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }

  // Build the log response structure
  res.json({
    username: user.username,
    count: userExercises.length,
    _id: user._id,
    log: userExercises.map(ex => ({
      description: ex.description,
      duration: ex.duration,
      date: ex.date
    }))
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
