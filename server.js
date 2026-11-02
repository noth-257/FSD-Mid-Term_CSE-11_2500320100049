
import express from 'express';

const app = express();

// Task 1: Middleware
app.use(express.json());

const PORT = process.env.PORT || 3000;

// In-memory array
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
            message: 'Invalid quantity values'
        });
    }

    // Create book
    const newBook = {
        id,
        title: title.trim(),
        author: author.trim(),
        category: category.trim(),
        quantity,
        available
    };

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


// Task 6: Search Books by Title


// GET /api/books/search?title=java
app.get('/api/books/search', (req, res) => {

    const searchTitle = req.query.title;

    if (!searchTitle || !searchTitle.trim()) {
        return res.status(400).json({
            message: 'Please provide a title to search'
        });
    }

    // Case-sensitive search
    const result = books.filter(book =>
        book.title.includes(searchTitle)
    );

    if (result.length === 0) {
        return res.status(404).json({
            message: 'No matching books found'
        });
    }

    res.status(200).json({
        message: 'Books found successfully',
        books: result
    });

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

    const book = books.find(book => book.id === id);

    if (!book) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    // Prevent changing ID
    if (req.body.id !== undefined) {
        return res.status(400).json({
            message: 'Book ID cannot be changed'
        });
    }

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

    const newQuantity = quantity === undefined ? book.quantity : quantity;
    const newAvailable = available === undefined ? book.available : available;

    // Validate quantity
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

    // Update details
    if (title !== undefined) book.title = title.trim();
    if (author !== undefined) book.author = author.trim();
    if (category !== undefined) book.category = category.trim();

    book.quantity = newQuantity;
    book.available = newAvailable;

    res.status(200).json({
        message: 'Book updated successfully',
        book
    });

});


// Task 5: Delete a Book


// DELETE /api/books/:id
app.delete('/api/books/:id', (req, res) => {

    const id = Number(req.params.id);

    const index = books.findIndex(book => book.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    const book = books[index];

    // Check whether any copies are issued
    if (book.available < book.quantity) {
        return res.status(400).json({
            message: 'Cannot delete book. One or more copies are issued'
        });
    }

    // Delete book
    books.splice(index, 1);

    res.status(200).json({
        message: 'Book deleted successfully',
        book
    });

});


// Task 7: Issue a Book


// POST /api/books/:id/issue
app.post('/api/books/:id/issue', (req, res) => {

    const id = Number(req.params.id);

    const book = books.find(book => book.id === id);

    if (!book) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    // Check availability
    if (book.available <= 0) {
        return res.status(400).json({
            message: 'No copies available for issue'
        });
    }

    // Decrease available copies
    book.available--;

    res.status(200).json({
        message: 'Book issued successfully',
        book
    });

});


// Task 7: Return a Book


// POST /api/books/:id/return
app.post('/api/books/:id/return', (req, res) => {

    const id = Number(req.params.id);

    const book = books.find(book => book.id === id);

    if (!book) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    // Check whether a copy was previously issued
    if (book.available >= book.quantity) {
        return res.status(400).json({
            message: 'No issued copies available to return'
        });
    }

    // Increase available copies
    book.available++;

    res.status(200).json({
        message: 'Book returned successfully',
        book
    });

});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
