const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getNotes, 
  getNoteById,  // Add this
  createNote, 
  updateNote, 
  deleteNote 
} = require('../controllers/noteController');

router.use(protect);

// Add the GET single note route
router.get('/:id', getNoteById);  // <-- THIS IS CRUCIAL FOR EDITING
router.get('/', getNotes);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;