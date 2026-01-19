import type { paths } from "@/types/api";
import APIClient from "@/services/ApiClient";

type LoginUser =
  paths["/auth/login"]["post"]["requestBody"]["content"]["application/json"];

type DBUser =
  paths["/auth/login"]["post"]["responses"]["200"]["content"]["application/json"];

type CreateUser =
  paths["/auth/register"]["post"]["requestBody"]["content"]["application/json"];

// Decorator for our auth client to autmatically
// set the session token on a login / register request

function SetSessionToken(
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
) {
  /*
  
  args - 
  
  target: The object on which the decorated method is defined -> AuthClient.prototype
  propertyKey: The name of the decorated method -> "login" | "register"
  descriptor: An object that contains the original method (login | register) and its metadata.

  A property descriptor is an object that describes a property on another object.
  Every property in JavaScript has one, and it controls how that property behaves.
  
  The descriptor has claims about the property like ->

  value -> actual value of the property, eg for our property -> login | register, 
  the value would be the actual function definition
  writable -> whether the property can be changed or not
  enumerable -> whether the property can be iterated over or not ....

  */

  const originalMethod = descriptor.value;
  // descriptor.value -> actual function implementation (declaration | source code)

  // Now we modify the actual function to do something more than it already did
  // like set the session token (first, get a ref to the actual function)
  descriptor.value = async function (this: AuthClient, ...args: any) {
    const response = await originalMethod.apply(this, args);

    const token = response.headers?.["x-auth-token"];

    if (token) {
      localStorage.setItem("token", token);
    } else {
      throw new Error("No token received from server ...");
    }

    return response;
  };

  return descriptor;
}

class AuthClient extends APIClient {
  constructor() {
    super("auth");
  }

  @SetSessionToken
  async login(user: LoginUser) {
    return await this.post<DBUser, LoginUser>("login", user);
  }

  @SetSessionToken
  async register(user: CreateUser) {
    return await this.post<DBUser, CreateUser>("register", user);
  }

  async logout() {
    localStorage.removeItem("token");
    window.location.reload();
  }
}

const authClient = new AuthClient();
export default authClient;
