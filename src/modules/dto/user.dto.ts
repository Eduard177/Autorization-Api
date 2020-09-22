export class CreateUserDTO {
  name: string;
  email: string;
  readonly id: number;
  password: string;
  img: string;
}

export class UserDTO {
  email: string;
  readonly id: number;
  password: string;
}