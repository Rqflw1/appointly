import { Checkbox } from "@/app/_shadcn/components/ui/checkbox";
import { Table } from "@tanstack/react-table";

interface ComponentProps<TData> {
    table: Table<TData>;
}

export default function SelectAllHeader<TData>({
    table
}: ComponentProps<TData>) {
    return (
        <div className="flex items-center justify-center">
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
            />
        </div>
    );
}
