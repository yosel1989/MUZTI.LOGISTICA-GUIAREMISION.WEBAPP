export interface JwtPayloadDto {
  sub: string;
  jti: string;
  iat: number;
  Id: string;
  FirstName: string;
  LastName: string;
  UserName: string;
  EmployeeId: string;
  LocalTypeId: string;
  LocalId: string;
  AreaId: string;
  UserLocalId: string;
  UserLocalId2: string;
  UserLocalId3: string;
  UserLocalComercialId: string;
  IdUsuarioSN: string;
  ProfileAppId: string[];
  exp: number;
  iss: string;
  aud: string;
}
