export const errorResponse = (err, req, res, next) => {
   res.status(400).json({
       status: false,
       message: err.message || "An unexpected error occurred",
       details: process.env.NODE_ENV === 'development' ? err.stack : undefined 
   });
};