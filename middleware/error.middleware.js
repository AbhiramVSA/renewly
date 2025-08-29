const errorMiddleware = (err, req, res, next) => {
    try {
        let error = { ...err};
        error.message = err.message;
        console.error(err);

        // Bad object ID on Mongoose
        if (err.name === 'CastError'){
            const message = 'Resource Not Found';
            error = new Error(message);
            error.statusCode = 400;
        }

        // Duplicate key on mongoose
        if (err.name === 11000) {
            const message = 'Duplicate field value found';
            error = new Error(message);
            error.statusCode = 400;
        }

        // Mongoose validation error
        if (err.name === 'ValidationError'){
            const message = Object.values(err.errors).map(val => val.message);
            error = new Error(message.join(', '));
            error.statusCode = 400;
        }

        res.status(error.statusCode || 500).json({success: false, error: error.message || 'Server Error'});

    } catch (error) {
        next(error);
    }
};

export default errorMiddleware;