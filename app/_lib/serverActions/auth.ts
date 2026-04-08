"use server";

import bcrypt from "bcrypt";
import { prisma } from "@/app/_lib/constants/prisma";
import { signIn, signOut } from "../functions/auth";
import { SignInModel, SignUpModel } from "../types/auth";
import { DEFAULT_LANGUAGE } from "../constants/general";
import { logger } from "../constants/logger";
import { getResult } from "../functions/general";
import { refresh } from "next/cache";

export async function signInAction(model: SignInModel) {
  try {
    const { email, password } = model;
    await signIn("credentials", { email, password, redirect: false });
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    return getResult(false, 500);
  }
}

export async function signUpAction(model: SignUpModel) {
  try {
    const { name, surname, email, password } = model;

    const existing = await prisma.user.count({ where: { email } });
    if (existing !== 0) return getResult(false, 1);

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);
    const user = await prisma.user.create({
      data: {
        name,
        surname,
        email,
        password: hash,
        language: DEFAULT_LANGUAGE
      }
    });

    await signIn("credentials", {
      email: user.email,
      password,
      redirect: false
    });
    return getResult(true, 0);
  } catch (error) {
    logger.error(error);
    return getResult(false, 500);
  }
}

export async function signOutAction() {
  await signOut({ redirect: false });
  refresh();
  return getResult(true, 0);
}
