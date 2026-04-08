import { Checkbox } from "@/app/_shadcn/components/ui/checkbox";
import { Row } from "@tanstack/react-table";

interface ComponentProps<TData> {
    row: Row<TData>;
}

export default function SelectRowCell<TData>({ row }: ComponentProps<TData>) {
    return (
        <div className="flex items-center justify-center">
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        </div>
    );
}
