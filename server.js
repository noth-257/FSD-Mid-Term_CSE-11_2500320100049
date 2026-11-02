
import express from 'express';
const app = express();

// Task 1: Configure middleware
app.use(express.json());

const PORT = process.env.PORT || 3000;

// In-memory array to store books
let books = [];


// Task 2: Add a New Book


// POST /api/books
app.post('/api/books', (req, res) => {

    const { id, title, author, category, quantity, available } = req.body;

    // Validate required fields
    if (
        id === undefined ||
        !title ||
        !author ||
        !category ||
        quantity === undefined ||
        available === undefined
    ) {
        return res.status(400).json({
            message: 'All fields are required'
        });
    }

    // Validate ID
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: 'Book ID must be a positive integer'
        });
    }

    // Check duplicate ID
    const existingBook = books.find(book => book.id === id);

    if (existingBook) {
        return res.status(400).json({
            message: 'Book ID already exists'
        });
    }

    // Validate quantity
    if (
        !Number.isInteger(quantity) ||
        !Number.isInteger(available) ||
        quantity < 0 ||
        available < 0 ||
        available > quantity
    ) {
        return res.status(400).json({
            message: 'Invalid quantity or available value'
        });
    }

    // Create new book
    const newBook = {
        id,
        title: title.trim(),
        author: author.trim(),
        category: category.trim(),
        quantity,
        available
    };

    // Store book in array
    books.push(newBook);

    res.status(201).json({
        message: 'Book added successfully',
        book: newBook
    });

});


// Task 3: Get All Books


// GET /api/books
app.get('/api/books', (req, res) => {

    if (books.length === 0) {
        return res.status(200).json({
            message: 'No books available',
            books: []
        });
    }

    res.status(200).json(books);

});


// Task 3: Get Book By ID


// GET /api/books/:id
app.get('/api/books/:id', (req, res) => {

    const id = Number(req.params.id);

    const book = books.find(book => book.id === id);

    if (!book) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    res.status(200).json(book);

});


// Task 4: Update Book Details


// PUT /api/books/:id
app.put('/api/books/:id', (req, res) => {

    const id = Number(req.params.id);

    // Find book
    const book = books.find(book => book.id === id);

    if (!book) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    // Prevent changing book ID
    if (req.body.id !== undefined) {
        return res.status(400).json({
            message: 'Book ID cannot be changed'
        });
    }

    // Allowed update fields
    const permittedFields = [
        'title',
        'author',
        'category',
        'quantity',
        'available'
    ];

    const fields = Object.keys(req.body);

    if (
        fields.length === 0 ||
        fields.some(field => !permittedFields.includes(field))
    ) {
        return res.status(400).json({
            message: 'Invalid update fields'
        });
    }

    const { title, author, category, quantity, available } = req.body;

    // Validate text fields
    if (
        (title !== undefined &&
            (typeof title !== 'string' || !title.trim())) ||
        (author !== undefined &&
            (typeof author !== 'string' || !author.trim())) ||
        (category !== undefined &&
            (typeof category !== 'string' || !category.trim()))
    ) {
        return res.status(400).json({
            message: 'Invalid book details'
        });
    }

    // Validate quantity
    const newQuantity = quantity === undefined ? book.quantity : quantity;
    const newAvailable = available === undefined ? book.available : available;

    if (
        !Number.isInteger(newQuantity) ||
        !Number.isInteger(newAvailable) ||
        newQuantity < 0 ||
        newAvailable < 0 ||
        newAvailable > newQuantity
    ) {
        return res.status(400).json({
            message: 'Invalid quantity values'
        });
    }

    // Update book details
    if (title !== undefined) book.title = title.trim();
    if (author !== undefined) book.author = author.trim();
    if (category !== undefined) book.category = category.trim();

    book.quantity = newQuantity;
    book.available = newAvailable;

    res.status(200).json({
        message: 'Book updated successfully',
        book: book
    });

});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
