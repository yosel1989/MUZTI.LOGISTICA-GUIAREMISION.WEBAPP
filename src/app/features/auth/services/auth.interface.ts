export interface AuthRequest{
    username: string;
    password: string;
}

export interface UserProfile {
  id: number;
  appId: number;
  nomApp: string;
  description: string;
  isDefault: boolean;
}

export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  userName: string;
  employeeId: number;
  localTypeId: number;
  localId: number;
  areaId: number;
  userLocalId: number;
  userLocalId2: number;
  userLocalId3: number;
  userLocal3Desc: string;
  userLocalComercialId: number;
  idUsuarioSN: number;
  profiles: UserProfile[];
  token: string;
  refreshToken: string;
}
