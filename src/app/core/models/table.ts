export interface TableColumn{
    field: string;
    header: string;
	sort?: boolean;
	sticky?: boolean;
    className?: string;
}

export interface TableData<T>{
    page_number: number;
    page_size: number;
    total_records: number;
    total_pages: number;
    data: T;
}