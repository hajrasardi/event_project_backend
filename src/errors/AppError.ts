class AppError {
  public rc: number;
  public readonly success: boolean;
  public message: string;

  constructor(_message: string, _rc: number) {
    this.message = _message;
    this.rc = _rc;
    this.success = false;
  }
}

export default AppError;