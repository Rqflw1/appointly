import { CreateItemModel } from "../validation/item";

export interface CreateItemModelRow extends CreateItemModel {
  rowId: string;
}
