class NotFoundError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message); // (1)
    this.name = "NotFoundError"; // (2)
    this.statusCode = 404;
  }
}

export default NotFoundError;
