export interface AreaDto {
  /** Identificador único del área */
    id: number;
  /** Código: 2 dígitos si es principal (10), 4 si es subárea (1001) */
    code: string;
  /** Nombre completo. En subáreas incluye al padre: 'Producción – Envasado' */
    name: string;
  /** Id del área padre. null si es un área principal */
    parent_area_id: number | null;
  /** Nivel jerárquico: 1 = principal, 2 = subárea */
    level: AreaLevel;
  /** Estado del área */
    active: boolean;

    created_at: Date;
    created_at_user: string;
    created_at_user_name: string;
    created_at_employee_id: number | null;

    updated_at: Date | null;
    updated_at_user: string | null;
    updated_at_user_name: string | null;
    updated_at_employee_id: number | null;

    loading_update: boolean;
    loading_active: boolean;

    children?: AreaDto[];
}

/** Niveles permitidos */
export type AreaLevel = 1 | 2;

/**
 * Datos para registrar un área.
 * El backend arma el código y el nombre completo y llena la auditoría.
 */
export interface AreaCreateDto {
  /** null = área principal; con valor = subárea de ese padre */
    parent_area_id: number | null;
  /** Los 2 dígitos que ingresa el usuario*/
    code: string;
  /** Los 2 dígitos del área padre */
    parent_code: string | null;
  /** Nombre del padre */
    parent_name: string | null;
  /** Nombre, el backend también renombra a sus hijos */
    name: string;
  /** Nivel jerárquico: 1 = principal, 2 = subárea */
    level: AreaLevel;
}

/**
 * Datos para editar un área.
 */
export interface AreaUpdateDto {
    id: number;
  /** null = área principal; con valor = subárea de ese padre */
    parent_area_id: number | null;
  /** Los 2 dígitos que ingresa el usuario: '10' para un padre, '01' para un hijo */
    code: string;
  /** Los 2 dígitos del área padre */
    parent_code: string | null;
  /** Nombre del padre */
    parent_name: string | null;
  /** Nombre, el backend también renombra a sus hijos */
    name: string;
  /** Nivel jerárquico: 1 = principal, 2 = subárea */
    level: AreaLevel;
}


export interface AreaToSelectDto {
  /** Identificador único del área */
    id: number;
  /** Código: 2 dígitos si es principal (10), 4 si es subárea (1001) */
    code: string;
  /** Nombre completo. En subáreas incluye al padre: 'Producción – Envasado' */
    name: string;
}