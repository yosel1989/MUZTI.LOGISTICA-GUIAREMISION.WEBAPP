export interface Column {
    field: string;
    header: string;
	sort?: boolean;
	sticky?: boolean;
    alignFrozen?: string;
    className?: string;
    tdClassName?: string;
    thClassName?: string;
    visible?: boolean;
    canVisible?: boolean;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render?: (rowData: any, rowIndex?: number) => string | null;
}