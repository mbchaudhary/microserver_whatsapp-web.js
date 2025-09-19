const express = require('express');
const axios = require('axios');
const app = express();
const waRoutes = require('./waRoutes');
const dummyCars = require('./data');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const PORT = 3000;

app.use(cors());

app.use(express.json());
app.use(fileUpload({ createParentPath: true }));

// Main Server API

app.get('/', (req, res) => {
    res.send('Hello World From Main Server');
});

//Create a car

app.post('/car', async (req, res) => {
    const {make, model, year, color, fuelType, transmission} = req.body;
    const newCar = {id: dummyCars.length + 1, make, model, year, color, fuelType, transmission};
    dummyCars.push(newCar);
    res.send(newCar);
});

//get all cars

app.get('/cars', async (req, res) => {
    res.send(dummyCars);
});

//get by id car

app.get('/cars/:id', async (req, res) => {
    const id = req.params.id;
    const car = dummyCars.find(car => car.id === parseInt(id));
    if (!car) {
        return res.status(404).send('Car not found');
    }
    res.send(car);
});

//delete a car

app.delete('/cars/:id', async (req, res) => {
    const id = req.params.id;
    const car = dummyCars.find(car => car.id === parseInt(id));
    if (!car) {
        return res.status(404).send('Car not found');
    }
    
    dummyCars.splice(dummyCars.indexOf(car), 1);
    res.send(dummyCars);

});

// Second Server API

app.get('/second-server', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5000/sec-server');
        res.status(response.status).send(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).send(error.response.data);
        } else {
            res.status(502).send('Bad Gateway: Unable to reach second server');
        }
    }
});

//Create a product

app.post('/products-second-server', async (req, res) => {
    console.log(req.body);
    try {
        const response = await axios.post('http://localhost:5000/sec-server/products', req.body);
        res.status(response.status).send(response.data);
    } catch (error) {
        res.status(502).send('Bad Gateway: Unable to reach second server');
    }
});

//get all products

app.get('/products-second-server', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5000/sec-server/products');
        res.status(response.status).send(response.data);
    } catch (error) {
        res.status(502).send('Bad Gateway: Unable to reach second server');
    }
});

//get by id product

app.get('/products-second-server/:id', async (req, res) => {
    try {
        const response = await axios.get(`http://localhost:5000/sec-server/products/${req.params.id}`);
        res.status(response.status).send(response.data);
    } catch (error) {
        res.status(502).send('Bad Gateway: Unable to reach second server');
    }
});

//delete a product

app.delete('/products-second-server/:id', async (req, res) => {
    try {
        const response = await axios.delete(`http://localhost:5000/sec-server/products/${req.params.id}`);
        res.status(response.status).send(response.data);
    } catch (error) {
        res.status(502).send('Bad Gateway: Unable to reach second server');
    }
});

// WhatsApp routes
app.use('/wa-second-server', waRoutes);

app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
});