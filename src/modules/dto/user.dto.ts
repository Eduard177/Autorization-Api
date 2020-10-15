export class CreateUserDTO {
  name: string;
  email: string;
  readonly id: number;
  password: string;
  img: string;
  loginTries: number;
  isBlocked: boolean;
  status: boolean;
}

export class UserDTO {
  name: string;
  email: string;
  readonly id: number;
  password: string;
  loginTries: number;
  isBlocked: boolean;
  status: boolean;
}

export class ForgetPasswordDTO{
  readonly email: string;
  newPassword: string;
}