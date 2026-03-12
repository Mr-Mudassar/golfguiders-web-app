export interface UpdatePasswordMutationType {
  updatePassword: boolean;
}

//#region variables

export interface UpdatePasswordMutationVariablesType {
  email: string;
  oldPassword: string;
  newPassword: string;
}
