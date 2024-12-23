const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const assert = chai.assert;

chai.use(chaiHttp);

let issueId;

suite('Functional Tests', () => {
  suite('POST /api/issues/{project}', () => {
    test('Create an issue with every field', (done) => {
      chai.request(server)
        .post('/api/issues/test-project')
        .send({
          issue_title: 'Test Issue',
          issue_text: 'This is a test issue.',
          created_by: 'Tester',
          assigned_to: 'Developer',
          status_text: 'In Progress',
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Test Issue');
          assert.equal(res.body.issue_text, 'This is a test issue.');
          assert.equal(res.body.created_by, 'Tester');
          assert.equal(res.body.assigned_to, 'Developer');
          assert.equal(res.body.status_text, 'In Progress');
          issueId = res.body._id; // Store the issue ID for later tests
          done();
        });
    });

    test('Create an issue with only required fields', (done) => {
      chai.request(server)
        .post('/api/issues/test-project')
        .send({
          issue_title: 'Required Fields Only',
          issue_text: 'This is a required-only test.',
          created_by: 'Tester',
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Required Fields Only');
          assert.equal(res.body.issue_text, 'This is a required-only test.');
          assert.equal(res.body.created_by, 'Tester');
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          done();
        });
    });

    test('Create an issue with missing required fields', (done) => {
      chai.request(server)
        .post('/api/issues/test-project')
        .send({
          issue_title: 'Missing Fields',
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });
  });

  suite('GET /api/issues/{project}', () => {
    test('View issues on a project', (done) => {
      chai.request(server)
        .get('/api/issues/test-project')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
    });

    test('View issues on a project with one filter', (done) => {
      chai.request(server)
        .get('/api/issues/test-project')
        .query({ status_text: 'In Progress' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach(issue => {
            assert.equal(issue.status_text, 'In Progress');
          });
          done();
        });
    });

    test('View issues on a project with multiple filters', (done) => {
      chai.request(server)
        .get('/api/issues/test-project')
        .query({ created_by: 'Tester', open: true })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach(issue => {
            assert.equal(issue.created_by, 'Tester');
            assert.isTrue(issue.open);
          });
          done();
        });
    });
  });

  suite('PUT /api/issues/{project}', () => {
    test('Update one field on an issue', (done) => {
      chai.request(server)
        .put('/api/issues/test-project')
        .send({ _id: issueId, status_text: 'Completed' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, issueId);
          done();
        });
    });

    test('Update multiple fields on an issue', (done) => {
      chai.request(server)
        .put('/api/issues/test-project')
        .send({ _id: issueId, issue_title: 'Updated Title', open: false })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, issueId);
          done();
        });
    });

    test('Update an issue with missing _id', (done) => {
      chai.request(server)
        .put('/api/issues/test-project')
        .send({ status_text: 'Completed' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });

    test('Update an issue with no fields to update', (done) => {
      chai.request(server)
        .put('/api/issues/test-project')
        .send({ _id: issueId })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'no update field(s) sent');
          assert.equal(res.body._id, issueId);
          done();
        });
    });

    test('Update an issue with an invalid _id', (done) => {
      chai.request(server)
        .put('/api/issues/test-project')
        .send({ _id: 'invalid-id', status_text: 'Completed' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not update');
          assert.equal(res.body._id, 'invalid-id');
          done();
        });
    });
  });

  suite('DELETE /api/issues/{project}', () => {
    test('Delete an issue', (done) => {
      chai.request(server)
        .delete('/api/issues/test-project')
        .send({ _id: issueId })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully deleted');
          assert.equal(res.body._id, issueId);
          done();
        });
    });

    test('Delete an issue with an invalid _id', (done) => {
      chai.request(server)
        .delete('/api/issues/test-project')
        .send({ _id: 'invalid-id' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not delete');
          assert.equal(res.body._id, 'invalid-id');
          done();
        });
    });

    test('Delete an issue with missing _id', (done) => {
      chai.request(server)
        .delete('/api/issues/test-project')
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
  });
});
