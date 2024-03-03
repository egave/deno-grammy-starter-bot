import type { CustomContext } from '../types/customContext.ts'

const BOT_ADMIN: number[] = Deno.env.get("BOT_ADMIN")?
                            Deno.env.get("BOT_ADMIN")!.split(",").map(Number):
                            [];

export function isAdmin(ctx: CustomContext): boolean {
    return BOT_ADMIN.includes(ctx.from!.id);
}