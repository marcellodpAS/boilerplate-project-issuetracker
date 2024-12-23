'use strict';

const { v4: uuidv4 } = require('uuid'); 

const issues = {};

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get((req, res) => {
      const project = req.params.project;
      const query = req.query;

      if (!issues[project]) return res.json([]);

      let filteredIssues = issues[project];
      for (const key in query) {
        filteredIssues = filteredIssues.filter(issue => issue[key] == query[key]);
      }

      res.json(filteredIssues);
    })
    
    .post((req, res) => {
      const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to = '', status_text = '' } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      const newIssue = {
        _id: uuidv4(),
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        created_on: new Date(),
        updated_on: new Date(),
        open: true,
      };

      if (!issues[project]) issues[project] = [];
      issues[project].push(newIssue);

      res.json(newIssue);
    })
    
    .put((req, res) => {
      const project = req.params.project;
      const { _id, ...updates } = req.body;
    
      if (!_id) return res.json({ error: 'missing _id' });
    
      if (Object.keys(updates).length === 0) {
        return res.json({ error: 'no update field(s) sent', '_id':_id });
      }
    
      if (!issues[project]) return res.json({ error: 'could not update', '_id':_id });
    
      const issue = issues[project].find(issue => issue._id === _id);
      if (!issue) return res.json({ error: 'could not update', '_id':_id });
    
    
      Object.keys(updates).forEach(key => {
        if (key in issue && updates[key] !== undefined) {
          issue[key] = updates[key];
        }
      });
    
      issue.updated_on = new Date();
    
      res.json({ result: 'successfully updated', '_id':_id });
    })
    
    
    .delete((req, res) => {
      const project = req.params.project;
      const { _id } = req.body;

      if (!_id) return res.json({ error: 'missing _id' });

      if (!issues[project]) return res.json({ error: 'could not delete', _id });

      const index = issues[project].findIndex(issue => issue._id === _id);
      if (index === -1) return res.json({ error: 'could not delete', _id });

      issues[project].splice(index, 1);
      res.json({ result: 'successfully deleted', _id });
    });
};
