interface Column {
    field: string;
    header: string;
	sort?: boolean;
	sticky?: boolean;
    alignFrozen?: string;
    className?: string;
    tdClassName?: string;
    thClassName?: string;
}