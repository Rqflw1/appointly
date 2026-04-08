import { Dispatch, SetStateAction } from "react";
import { getDictionary } from "../functions/general";

export enum StorageKey {
  COOKIES = "cookies"
}

export enum CookiesKey {
  COMPANY_ID = "companyId"
}

export type Dictionary = ReturnType<typeof getDictionary>;

export interface Result<B extends true | false, T> {
  ok: B;
  code: number;
  data: T;
}

export type SetState<T> = Dispatch<SetStateAction<T>>;
