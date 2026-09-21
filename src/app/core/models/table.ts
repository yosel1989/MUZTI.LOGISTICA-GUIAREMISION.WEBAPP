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


export interface TableColumnState{
    field: string; 
    visible: boolean;
}

export interface TableState{
    table: string;
    cols: TableColumnState[];
}

export interface TableColumnFilter{
    field: string;
    name: string;
    checked: boolean;
}