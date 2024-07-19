const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

const SECRET_KEY = 'your_secret_key';

const mockUser = {
  email: 'test@example.com',
  password: 'password', // In a real application, store hashed passwords
};

let mockNotes = [
  {
    id: 1,
    title: 'Sample Note 1',
    content: 'This is a sample note.',
    tags: ['sample', 'note'],
    color: '#ffffff',
    archived: false,
  },
  {
    id: 2,
    title: 'Sample Note 2',
    content: 'This is another sample note.',
    tags: ['sample'],
    color: '#f0f0f0',
    archived: false,
  },
];

// Serve index.html for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === mockUser.email && password === mockUser.password) {
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).send('Invalid credentials');
  }
});

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  try {
    jwt.verify(token, SECRET_KEY);
    next();
  } catch (error) {
    res.status(401).send('Unauthorized');
  }
};

app.get('/api/notes', authMiddleware, (req, res) => {
  res.json(mockNotes);
});

app.post('/api/notes', authMiddleware, (req, res) => {
  const { title, content, tags, color } = req.body;
  const newNote = {
    id: mockNotes.length + 1,
    title,
    content,
    tags,
    color,
    archived: false,
  };
  mockNotes.push(newNote);
  res.status(201).json(newNote);
});

app.get('/api/notes/search', authMiddleware, (req, res) => {
  const { query } = req.query;
  const results = mockNotes.filter(note =>
    note.title.includes(query) || note.content.includes(query) || note.tags.some(tag => tag.includes(query))
  );
  res.json(results);
});

app.delete('/api/notes/:id', authMiddleware, (req, res) => {
  const noteId = parseInt(req.params.id);
  mockNotes = mockNotes.filter(note => note.id !== noteId);
  res.status(204).send();
});

app.put('/api/notes/:id', authMiddleware, (req, res) => {
  const noteId = parseInt(req.params.id);
  const { color } = req.body;
  const note = mockNotes.find(note => note.id === noteId);
  if (note) {
    note.color = color;
    res.json(note);
  } else {
    res.status(404).send('Note not found');
  }
});

app.listen(PORT, () => {
  console.log("abc");
});