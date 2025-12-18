export const errorMiddleware = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(statusCode).json({
        statusCode: statusCode,
        status: false,
        message: message,
        errors: err.errors || [],
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
}