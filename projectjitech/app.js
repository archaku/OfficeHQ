const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

const app = express();
const PORT = 3000;

// MongoDB URI
const uri = 'mongodb+srv://archa:root@cluster0.2aoilib.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

let db, projects;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

async function start() {
  try {
    await client.connect();
    db = client.db('projectHQ');
    projects = db.collection('projects');

    // Home - List All Projects
    app.get('/projects', async (req, res) => {
      const allProjects = await projects.find().toArray();
      res.render('index', { projects: allProjects });//index.ejs
 
    });

    // Add Project Form
    app.get('/projects/add', (req, res) => {
      res.render('add'); // add.ejs
    });

    // Handle Add Project Submission
    app.post('/projects/add', async (req, res) => {
      const {
        projectId,
        name,
        department,
        category,
        startDate,
        endDate,
        description
      } = req.body;

      await projects.insertOne({
        projectId,
        name,
        department,
        category,
        startDate,
        endDate,
        description
      });

      res.redirect('/projects');
    });

    // Project Detail Page
    app.get('/projects/:id', async (req, res) => {
      try {
        const project = await projects.findOne({ _id: new ObjectId(req.params.id) });
        if (!project) return res.status(404).send('Project not found');
        res.render('details', { project }); // details.ejs
      } catch (err) {
        res.status(400).send('Invalid ID');
      }
    });

    // Redirect root to project list
    app.get('/', (req, res) => res.redirect('/projects'));

    // Start Server
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Connection error:', error);
  }
}

start();
