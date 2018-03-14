export class User {
  uid: string;
  email: string;
  constructor(data: any) {
    this.uid = data.uid;
    this.email = data.email;
  }
}
