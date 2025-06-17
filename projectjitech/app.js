const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
const methodOverride = require('method-override');

const app = express();
const PORT = 3000;

// MongoDB URI
const uri = 'mongodb+srv://archa:root@cluster0.2aoilib.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

let db, projects;

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Start MongoDB connection and app
async function start() {
  try {
    await client.connect();
    db = client.db('projectHQ');
    projects = db.collection('projects');

    // Home - Redirect
    app.get('/', (req, res) => res.redirect('/projects'));

    // List All Projects
    app.get('/projects', async (req, res) => {
      const allProjects = await projects.find().toArray();
      res.render('projects/index', { projects: allProjects });
    });

    // Add Project Form
    app.get('/projects/add', (req, res) => {
      res.render('projects/add');
    });

    // Add Project Handler
    app.post('/projects/add', async (req, res) => {
      const { projectId, name, department, category, startDate, endDate, description } = req.body;
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

    // Render Project Detail Page
    app.get('/projects/:id', async (req, res) => {
      try {
        const project = await projects.findOne({ _id: new ObjectId(req.params.id) });
        if (!project) return res.status(404).send('Project not found');
        res.render('projects/detail', { project });
      } catch (err) {
        res.status(400).send('Invalid ID');
      }
    });

    // Render Edit Page
    app.get('/projects/:id/edit', async (req, res) => {
      try {
        const project = await projects.findOne({ _id: new ObjectId(req.params.id) });
        if (!project) return res.status(404).send('Not Found');
        res.render('projects/edit', { project });
      } catch (err) {
        res.status(400).send('Invalid ID');
      }
    });

    // Update Project
    app.put('/projects/:id', async (req, res) => {
      const { projectId, name, department, category, startDate, endDate, description } = req.body;
      await projects.updateOne(
        { _id: new ObjectId(req.params.id) },
        {
          $set: {
            projectId,
            name,
            department,
            category,
            startDate,
            endDate,
            description
          }
        }
      );
      res.redirect('/projects');
    });

    // Delete Project
    app.delete('/projects/:id', async (req, res) => {
      await projects.deleteOne({ _id: new ObjectId(req.params.id) });
      res.redirect('/projects');
    });

    // Start Server
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Connection error:', error);
  }
}

start();
