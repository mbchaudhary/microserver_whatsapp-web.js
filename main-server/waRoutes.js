const express = require('express');
const axios = require('axios');

const router = express.Router();

// GET /wa-second-server/status -> proxies to second server WA status
router.get('/status', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5000/wa/status');
        res.status(response.status).send(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).send(error.response.data);
        } else {
            res.status(502).send('Bad Gateway: Unable to reach second server');
        }
    }
});

// GET /wa-second-server/qr -> proxies to second server WA QR (image)
router.get('/qr', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5000/wa/qr', { responseType: 'arraybuffer' });
        const contentType = response.headers['content-type'] || 'image/png';
        res.set('Content-Type', contentType);
        res.status(response.status).send(Buffer.from(response.data));
    } catch (error) {
        if (error.response) {
            if (error.response.data && error.response.headers && error.response.headers['content-type']) {
                res.set('Content-Type', error.response.headers['content-type']);
            }
            res.status(error.response.status).send(error.response.data);
        } else {
            res.status(502).send('Bad Gateway: Unable to reach second server');
        }
    }
});

// POST /wa-second-server/send -> proxies to second server WA send
router.post('/send', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:5000/wa/send', req.body);
        res.status(response.status).send(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).send(error.response.data);
        } else {
            res.status(502).send('Bad Gateway: Unable to reach second server');
        }
    }
});

// File upload endpoint - upload files first
router.post('/upload', async (req, res) => {
    try {
        // Create FormData for multipart request
        const FormData = require('form-data');
        const formData = new FormData();
        
        // Add files
        if (req.files) {
            if (Array.isArray(req.files.file)) {
                // Multiple files
                req.files.file.forEach(file => {
                    formData.append('file', file.data, {
                        filename: file.name,
                        contentType: file.mimetype
                    });
                });
            } else if (req.files.file) {
                // Single file
                formData.append('file', req.files.file.data, {
                    filename: req.files.file.name,
                    contentType: req.files.file.mimetype
                });
            }
        }
        
        const response = await axios.post('http://localhost:5000/wa/upload', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });
        res.status(response.status).send(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).send(error.response.data);
        } else {
            res.status(502).send('Bad Gateway: Unable to reach second server');
        }
    }
});

// Get list of uploaded files
router.get('/files', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5000/wa/files');
        res.status(response.status).send(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).send(error.response.data);
        } else {
            res.status(502).send('Bad Gateway: Unable to reach second server');
        }
    }
});

// Delete uploaded file
router.delete('/files/:fileId', async (req, res) => {
    try {
        const response = await axios.delete(`http://localhost:5000/wa/files/${req.params.fileId}`);
        res.status(response.status).send(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).send(error.response.data);
        } else {
            res.status(502).send('Bad Gateway: Unable to reach second server');
        }
    }
});

// Send files by file IDs (new method)
router.post('/send-files', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:5000/wa/send-files', req.body);
        res.status(response.status).send(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).send(error.response.data);
        } else {
            res.status(502).send('Bad Gateway: Unable to reach second server');
        }
    }
});

// Legacy send file endpoint (for backward compatibility)
router.post('/send-file', async (req, res) => {
    try {
        // Create FormData for multipart request
        const FormData = require('form-data');
        const formData = new FormData();
        
        // Add text fields
        if (req.body.to) formData.append('to', req.body.to);
        if (req.body.message) formData.append('caption', req.body.message);
        
        // Add files
        if (req.files) {
            if (Array.isArray(req.files.file)) {
                // Multiple files
                req.files.file.forEach(file => {
                    formData.append('file', file.data, {
                        filename: file.name,
                        contentType: file.mimetype
                    });
                });
            } else if (req.files.file) {
                // Single file
                formData.append('file', req.files.file.data, {
                    filename: req.files.file.name,
                    contentType: req.files.file.mimetype
                });
            }
        }
        
        const response = await axios.post('http://localhost:5000/wa/send-file', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });
        res.status(response.status).send(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).send(error.response.data);
        } else {
            res.status(502).send('Bad Gateway: Unable to reach second server');
        }
    }
});

module.exports = router;


