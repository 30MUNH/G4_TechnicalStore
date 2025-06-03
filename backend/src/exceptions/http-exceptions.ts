import { HttpError } from 'routing-controllers';
import { HttpMessages } from './http-messages.constant';

export class HttpException extends HttpError {
  constructor(status: number, message: string) {
    super(status, message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
    this.message = message;
  }
  toJSON() {
    return {
      status: this.httpCode || 500,
      message: this.message,
      name: this.name,
    };
  }
}


export class EntityNotFoundException extends HttpException {
  constructor(entityName = 'Resource') {
    super(404, `${entityName} not found`);
  }
}

export class AccountNotFoundException extends HttpException {
    constructor(){
        console.log('Throwing AccountNotFoundException with message:', HttpMessages._WRONG_CREDENTIALS);
        super(401, HttpMessages._WRONG_CREDENTIALS);
    }
}
