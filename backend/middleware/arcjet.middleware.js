import aj from '../config/arcjet.js'

const arcjetMiddleware = async (req, res, next) => {
    // Skip Arcjet protection unless explicitly enabled
    if (process.env.ARCJET_ENV !== 'LIVE') {
        return next();
    }
    
    try {
        const decision = await aj.protect(req, { requested: 1});

        if (decision.isDenied()) {
            if(decision.reason.isRateLimit()) {
                console.log('Rate limit exceeded for IP:', req.ip);
                return res.status(429).json({ 
                    success: false,
                    message: 'Rate limit exceeded. Please try again later.',
                    error: 'Rate limit exceeded. Please try again later.' 
                });
            }
            if(decision.reason.isBot()) {
                console.log('Bot detected for IP:', req.ip);
                return res.status(403).json({
                    success: false,
                    message: 'Bot detected',
                    error: 'Bot detected'
                });
            }
        }

        next();
    } catch (error) {
        console.log(`Arcjet Middleware Error: ${error}`);
        // Don't block requests if Arcjet fails
        next();
    }
}

export default arcjetMiddleware