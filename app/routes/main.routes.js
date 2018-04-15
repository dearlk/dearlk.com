module.exports = function(app) {
   
    var main = require('../controllers/main.controller.js');
    
    // Create a new Note
    app.post('/web/notes', main.create);
    // Create a Note
    app.get('/web/create', main.createNote);
    // Retrieve all Notes
    app.get('/web/notes', main.findAll);
    // Retrieve a single Note with noteId
    app.get('/web/notes/:noteId', main.findOne);
    
    // Update a Note with noteId
    app.get('/web/notes/update/:noteId', main.getUpdate);

    // Update a Note with noteId
    app.post('/web/notes/update/:noteId', main.postUpdate);

    // Delete a Note with noteId
    app.get('/web/notes/delete/:noteId', main.delete);
       
}


