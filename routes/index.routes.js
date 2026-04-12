import express from 'express';
const router = express.Router();

// Sending React dist:
router.get('/', (req, res) => res.sendFile('./public/index.html'));

// to sign in and sign up:
import auth from './auth.routes.js';
router.use('/', auth);


//source routes can be only accessed by admin:
import sources from './source.routes.js';
router.use('/admin', sources);


// save routes:
import saves from './saves.routes.js';
router.use('/my_saves', saves)


// news feed
import feeds from './feeds.routes.js';
router.use('/feeds', feeds);

// handling wrong endpoints : ******************************************************************************
router.use( async (req, res) => {
    console.log(`[ip: ${req.ip}] got wrong Endpoint!: [${req.originalUrl}]`);
    return res.status(404).json({msg: 'Not Found! Wrong Endpoint!'});
});

export default router;