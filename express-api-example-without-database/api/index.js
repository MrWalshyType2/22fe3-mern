const express = require('express');
const morgan = require('morgan');
const HttpError = require('./v1/errors/http-error');
const UserNotFoundError = require('./v1/errors/user-not-found-error');
const userRouter = require('./v1/route/user-router');

const PORT = process.env.PORT || 3000;
const app = express();

// Apply environment configurations and/or middleware
if (process.env.NODE_ENV === "PRODUCTION") {
    console.log("=== PRODUCTION ===");
    app.use(morgan('combined'));
} else {
    console.log("=== DEVELOPMENT ===");
    app.use(morgan('dev'));
}

// Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Router level middleware
app.use("/v1/user", userRouter);

// Error handling middleware
app.use((error, request, response, next) => {
    console.error(error.message);

    if (!(error instanceof HttpError)) {
        if (error instanceof UserNotFoundError) {
            error = new HttpError(error, 404);
        } else {
            // unknown error
            error = new HttpError(new Error("Something went wrong..."), 500);
        }
    }
    // It must be a HTTP error to have reached here, whether that was passed to error, or created
    // above
    return response.status(error.statusCode).json({
        message: error.message,
        data: error.data 
    })
});

// Start the server
const server = app.listen(PORT, function() {
    console.log(`Server up on ${PORT}`);
});