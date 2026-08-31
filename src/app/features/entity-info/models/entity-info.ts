export interface PersonInfoDto{
    document_number: string;
    first_name: string;
    last_name: string;
    birth_date?: Date | null; 
    gender?: string | null; 
}

export interface CompanyInfoDto{
    document_number: string;
    name: string;
    address: string;
    department?: string | null;
    province?: string | null;
    district?: string | null;
}