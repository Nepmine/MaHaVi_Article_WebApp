export class Response {
  constructor(status, message, data = null, error = false, errorMessage = "") {
    this.status = status; // HTTP status code
    this.message = message; // Short message
    this.data = data; // Actual data payload
    this.error = error; // Flag to indicate error
    this.errorMessage = errorMessage; // Detailed error info if any
    this.timestamp = new Date().toISOString(); // Added timestamp
  }
}
