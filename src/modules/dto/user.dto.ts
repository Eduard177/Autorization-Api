export class CreateUserDTO {
  name: string;
  email: string;
  readonly id: number;
  password: string;
  img: string;
  loginTries: number
}

export class UserDTO {
  email: string;
  readonly id: number;
  password: string;
  loginTries: number;
}

export class ForgetPasswordDTO{
  readonly email: string;
  newPassword: string;
}