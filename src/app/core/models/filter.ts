export interface ColumnsFilterDto{
  data: string;
  search: {
    value: string;
    regex: boolean;
    match?: string;
  }
}