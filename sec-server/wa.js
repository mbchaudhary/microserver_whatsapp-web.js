const express = require('express');
const router = express.Router();
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let waClient;
let waReady = false;
let waState = 'initializing';
let lastQrString = null;
let lastError = null;

// File management
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Store uploaded files metadata
let uploadedFiles = new Map();

function initializeWhatsAppClient() {
    const clientId = process.env.WA_CLIENT_ID || 'sec-server';
    const dataPath = process.env.WA_DATA_PATH || '.wwebjs_auth';
    waClient = new Client({
        authStrategy: new LocalAuth({ dataPath: dataPath, clientId: clientId }),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        }
    });

    waClient.on('qr', (qr) => {
        lastQrString = qr;
        waReady = false;
        waState = 'qr';
    });

    waClient.on('authenticated', () => {
        waState = 'authenticated';
    });

    waClient.on('auth_failure', (message) => {
        waState = 'auth_failure';
        waReady = false;
        lastQrString = null;
        lastError = message || 'Authentication failed';
    });

    waClient.on('ready', () => {
        waReady = true;
        waState = 'ready';
        lastQrString = null;
        console.log('WhatsApp client is ready');
    });

    waClient.on('change_state', (state) => {
        waState = state || waState;
    });

    waClient.on('loading_screen', (percent, message) => {
        waState = `loading:${percent}`;
    });

    // Capture generic errors if emitted
    waClient.on('error', (err) => {
        lastError = (err && err.message) ? err.message : String(err);
    });

    waClient.on('disconnected', (reason) => {
        waReady = false;
        waState = `disconnected:${reason}`;
        lastError = reason || lastError;
        setTimeout(() => {
            try { waClient.initialize(); } catch (e) { /* noop */ }
        }, 5000);
    });

    waClient.initialize();
}

initializeWhatsAppClient();

// Enable file upload handling for this router only
router.use(fileUpload({ createParentPath: true }));

// File upload endpoint - upload files first
router.post('/upload', async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).send({ error: 'No file provided' });
        }

        const files = Array.isArray(req.files.file) ? req.files.file : [req.files.file];
        const uploadedFileIds = [];

        for (const file of files) {
            // Generate unique file ID
            const fileId = crypto.randomUUID();
            const fileExtension = path.extname(file.name);
            const fileName = `${fileId}${fileExtension}`;
            const filePath = path.join(uploadsDir, fileName);

            // Save file to disk
            fs.writeFileSync(filePath, file.data);

            // Store metadata
            uploadedFiles.set(fileId, {
                id: fileId,
                originalName: file.name,
                fileName: fileName,
                filePath: filePath,
                mimetype: file.mimetype,
                size: file.size,
                uploadedAt: new Date().toISOString()
            });

            uploadedFileIds.push(fileId);
        }

        res.send({ 
            ok: true, 
            uploadedFiles: uploadedFileIds,
            message: `Successfully uploaded ${files.length} file(s)`
        });
    } catch (err) {
        console.error('Error uploading files:', err);
        res.status(500).send({ error: 'Failed to upload files: ' + err.message });
    }
});

// Get list of uploaded files
router.get('/files', (req, res) => {
    try {
        const files = Array.from(uploadedFiles.values()).map(file => ({
            id: file.id,
            originalName: file.originalName,
            mimetype: file.mimetype,
            size: file.size,
            uploadedAt: file.uploadedAt
        }));
        res.send({ files });
    } catch (err) {
        res.status(500).send({ error: 'Failed to get files list' });
    }
});

// Delete uploaded file
router.delete('/files/:fileId', (req, res) => {
    try {
        const fileId = req.params.fileId;
        const fileInfo = uploadedFiles.get(fileId);
        
        if (!fileInfo) {
            return res.status(404).send({ error: 'File not found' });
        }

        // Delete file from disk
        if (fs.existsSync(fileInfo.filePath)) {
            fs.unlinkSync(fileInfo.filePath);
        }

        // Remove from metadata
        uploadedFiles.delete(fileId);

        res.send({ ok: true, message: 'File deleted successfully' });
    } catch (err) {
        res.status(500).send({ error: 'Failed to delete file' });
    }
});

router.get('/status', (req, res) => {
    res.send({
        ready: waReady,
        state: waState,
        hasQr: Boolean(lastQrString),
        lastError: lastError,
        clientId: process.env.WA_CLIENT_ID || 'sec-server',
        dataPath: process.env.WA_DATA_PATH || '.wwebjs_auth'
    });
});

router.get('/qr', async (req, res) => {
    try {
        if (!lastQrString) {
            return res.status(404).send({ error: 'QR not available' });
        }
        const png = await qrcode.toBuffer(lastQrString, { type: 'png', width: 256 });
        res.set('Content-Type', 'image/png');
        return res.send(png);
    } catch (err) {
        return res.status(500).send({ error: 'Failed to generate QR' });
    }
});

router.post('/send', async (req, res) => {
    try {
        if (!waClient || !waReady) {
            return res.status(503).send({ error: 'WhatsApp not ready' });
        }
        const { to, message } = req.body;
        if (!to || !message) {
            return res.status(400).send({ error: 'to and message are required' });
        }
        const normalized = String(to).replace(/[^0-9]/g, '');
        const chatId = `${normalized}@c.us`;
        await waClient.sendMessage(chatId, message);
        return res.send({ ok: true });
    } catch (err) {
        return res.status(500).send({ error: 'Failed to send message' });
    }
});

// Send files by file IDs (new method)
router.post('/send-files', async (req, res) => {
    try {
        if (!waClient || !waReady) {
            return res.status(503).send({ error: 'WhatsApp not ready' });
        }
        const { to, caption, fileIds } = req.body || {};
        if (!to) {
            return res.status(400).send({ error: 'to is required' });
        }
        if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
            return res.status(400).send({ error: 'fileIds array is required' });
        }
        
        const normalized = String(to).replace(/[^0-9]/g, '');
        const chatId = `${normalized}@c.us`;
        
        const sentFiles = [];
        
        // Send each file by ID
        for (let i = 0; i < fileIds.length; i++) {
            const fileId = fileIds[i];
            const fileInfo = uploadedFiles.get(fileId);
            
            if (!fileInfo) {
                return res.status(404).send({ error: `File with ID ${fileId} not found` });
            }
            
            // Read file from disk
            const fileData = fs.readFileSync(fileInfo.filePath);
            const base64 = fileData.toString('base64');
            const media = new MessageMedia(fileInfo.mimetype || 'application/octet-stream', base64, fileInfo.originalName);
            
            // Send with caption only for the first file
            const messageCaption = i === 0 ? (caption || '') : '';
            await waClient.sendMessage(chatId, media, { sendMediaAsDocument: true, caption: messageCaption });
            
            sentFiles.push(fileInfo.originalName);
        }
        
        return res.send({ ok: true, filesSent: sentFiles.length, sentFiles });
    } catch (err) {
        console.error('Error sending files:', err);
        return res.status(500).send({ error: 'Failed to send files: ' + err.message });
    }
});

// Legacy endpoint - Send uploaded CSV/XLSX files as WhatsApp documents (for backward compatibility)
router.post('/send-file', async (req, res) => {
    try {
        if (!waClient || !waReady) {
            return res.status(503).send({ error: 'WhatsApp not ready' });
        }
        const { to, caption } = req.body || {};
        if (!to) {
            return res.status(400).send({ error: 'to is required' });
        }
        if (!req.files || !req.files.file) {
            return res.status(400).send({ error: 'file is required' });
        }
        
        const normalized = String(to).replace(/[^0-9]/g, '');
        const chatId = `${normalized}@c.us`;
        
        // Handle multiple files or single file
        const files = Array.isArray(req.files.file) ? req.files.file : [req.files.file];
        
        // Send each file
        for (const uploaded of files) {
            // Create media from buffer
            const base64 = uploaded.data.toString('base64');
            const media = new MessageMedia(uploaded.mimetype || 'application/octet-stream', base64, uploaded.name || 'document');
            
            // Send with caption only for the first file
            const messageCaption = files.indexOf(uploaded) === 0 ? (caption || '') : '';
            await waClient.sendMessage(chatId, media, { sendMediaAsDocument: true, caption: messageCaption });
        }
        
        return res.send({ ok: true, filesSent: files.length });
    } catch (err) {
        console.error('Error sending file:', err);
        return res.status(500).send({ error: 'Failed to send file: ' + err.message });
    }
});

module.exports = router;


