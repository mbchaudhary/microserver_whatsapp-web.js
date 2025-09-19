const express = require('express');
const app = express();
const dummyProducts = require('./data');
const waRouter = require('./wa');

const cors = require('cors');
app.use(cors());

const port = 5000;

app.use(express.json());
app.use('/wa', waRouter);
// Also mount under /sec-server to match frontend base path
app.use('/sec-server/wa', waRouter);

// WhatsApp endpoints moved to /wa router


// Products APIs

app.get('/sec-server', (req, res) => {
    res.send('Hello World from sec-server');
});

app.post('/sec-server/products', (req, res) => {
    const { title, description, price, category, stock } = req.body;
    const newProduct = { id: dummyProducts.length + 1, title, description, price, category, stock };
    dummyProducts.push(newProduct);
    res.send(newProduct);
});

app.get('/sec-server/products', (req, res) => {
    res.send(dummyProducts);
});

app.get('/sec-server/products/:id', (req, res) => {
    const { id } = req.params;
    const product = dummyProducts.find(product => product.id === parseInt(id));
    if (!product) {
        return res.status(404).send('Product not found');
    }
    res.send(product);
});

app.delete('/sec-server/products/:id', (req, res) => {
    const { id } = req.params;
    const index = dummyProducts.findIndex(product => product.id === parseInt(id));

    if (index === -1) {
        return res.status(404).send('Product not found');
    }

    dummyProducts.splice(index, 1);
    res.send(dummyProducts);
});

app.listen(port, () => {
    console.log('Server is running on port 5000');
});


